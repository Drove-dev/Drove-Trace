import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { SdkKeysService } from '../sdk-keys/sdk-keys.service';
import { ErrorGroupsService } from '../error-groups/error-groups.service';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { ErrorEvent } from './entities/error-event.entity';
import { PaginationDto } from '../../common/dtos/pagination';
import { UserWithRole, ValidRoles } from '../auth/interfaces';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { ErrorEventResponseDto } from './dtos/error-event-response.dto';
import { Project } from '../projects/entities/project.entity';
import { SdkKey } from '../sdk-keys/entities/sdk-key.entity';
import { ErrorGroup } from '../error-groups/entities/error-group.entity';

@Injectable()
export class ErrorEventsService {
  private readonly logger = new Logger(ErrorEventsService.name);

  constructor(
    @InjectRepository(ErrorEvent)
    private readonly errorEventRepository: Repository<ErrorEvent>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(SdkKey)
    private readonly sdkKeyRepository: Repository<SdkKey>,
    @InjectRepository(ErrorGroup)
    private readonly errorGroupRepository: Repository<ErrorGroup>,
    private readonly sdkService: SdkKeysService,
    private readonly errorGroupService: ErrorGroupsService,
  ) {}

  async findAll(
    query: PaginationDto,
    user: UserWithRole,
  ): Promise<PaginatedResponseDto<ErrorEventResponseDto>> {
    const { page = 1, limit = 15, search } = query;
    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);

    const queryBuilder = this.errorEventRepository
      .createQueryBuilder('errorEvent')
      .leftJoinAndSelect('errorEvent.sdkKeyEntity', 'sdkKey')
      .leftJoinAndSelect('sdkKey.project', 'project')
      .orderBy('errorEvent.createdAt', 'DESC');

    if (!isAdmin) {
      const teamIds = user.role.map((r) => r.teamId);

      const projects = await this.projectRepository.find({
        where: { team: { id: In(teamIds) } },
        select: ['id'],
      });
      const projectIds = projects.map((p) => p.id);

      const sdkKeys = await this.sdkKeyRepository.find({
        where: { projectId: In(projectIds) },
        select: ['id'],
      });
      const sdkKeyIds = sdkKeys.map((s) => s.id);

      // Handle case with no access
      if (sdkKeyIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      queryBuilder.where('errorEvent.sdkKeyId IN (:...sdkKeyIds)', {
        sdkKeyIds,
      });
    }

    if (search) {
      queryBuilder.andWhere('errorEvent.message ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const plainData = data.map((i) => instanceToPlain(i));
    const finalData = plainToInstance(ErrorEventResponseDto, plainData, {
      excludeExtraneousValues: true,
    });

    return {
      data: finalData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByGroup(
    groupId: string,
    query: PaginationDto,
    user: UserWithRole,
  ): Promise<PaginatedResponseDto<ErrorEventResponseDto>> {
    const { page = 1, limit = 15 } = query;

    const errorGroup = await this.errorGroupRepository.findOne({
      where: { id: groupId },
      relations: ['project'],
    });

    if (!errorGroup) {
      throw new NotFoundException(`Error group with ID ${groupId} not found`);
    }

    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);

    if (!isAdmin) {
      const teamIds = user.role.map((r) => r.teamId);
      const projects = await this.projectRepository.find({
        where: { team: { id: In(teamIds) } },
        select: ['id'],
      });
      const projectIds = projects.map((p) => p.id);

      if (!projectIds.includes(errorGroup.project.id)) {
        throw new ForbiddenException(
          'You do not have access to this error group',
        );
      }
    }

    const sdkKeys = await this.sdkKeyRepository.find({
      where: { projectId: errorGroup.project.id },
      select: ['id'],
    });
    const sdkKeyIds = sdkKeys.map((s) => s.id);

    if (sdkKeyIds.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await this.errorEventRepository
      .createQueryBuilder('errorEvent')
      .leftJoinAndSelect('errorEvent.sdkKeyEntity', 'sdkKey')
      .leftJoinAndSelect('sdkKey.project', 'project')
      .where('errorEvent.fingerprint = :fingerprint', {
        fingerprint: errorGroup.fingerprint,
      })
      .andWhere('errorEvent.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
      .orderBy('errorEvent.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const plainData = data.map((i) => instanceToPlain(i));
    const finalData = plainToInstance(ErrorEventResponseDto, plainData, {
      excludeExtraneousValues: true,
    });

    return {
      data: finalData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createErrorEventDto: CreateErrorEventDto) {
    const {
      sdkKey,
      fingerprint,
      message,
      stackTrace,
      file,
      line,
      browser,
      os,
      environment,
      url,
      release,
      sessionId,
      userId,
      metadata,
    } = createErrorEventDto;

    // Resolve SDK Key entity to efficiently get Project info without redundant deep validation
    const existSdk = await this.sdkKeyRepository.findOne({
      where: { key: sdkKey },
      relations: ['project'],
      select: { id: true, project: { id: true } }
    });

    if (!existSdk) {
      throw new BadRequestException('Invalid SDK key');
    }

    // Create error group associated with the project linked to the SDK Key
    await this.findOrCreateErrorGroup(fingerprint, existSdk.project.id);

    try {
      const event = this.errorEventRepository.create({
        sdkKey, // Original string for traceability
        sdkKeyId: existSdk.id, // Normalized UUID FK
        fingerprint,
        message,
        stackTrace,
        file,
        line,
        browser,
        os,
        environment,
        url,
        release,
        sessionId,
        userId,
        metadata: metadata ?? {},
      });

      return await this.errorEventRepository.save(event);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOrCreateErrorGroup(fingerPrint: string, projectId: string) {
    try {
      const fp = await this.errorGroupService.findByFingerprint(fingerPrint);
      if (fp) {
        await this.errorGroupService.update(fp.id, {
          lastSeen: new Date(),
          occurrences: fp.occurrences + 1,
        });
      } else {
        await this.errorGroupService.create({
          fingerprint: fingerPrint,
          projectId,
        });
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error?.code === '23505') {
      throw new BadRequestException(
        error.detail ?? 'Duplicate or constraint violation',
      );
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Referenced entity not found');
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
