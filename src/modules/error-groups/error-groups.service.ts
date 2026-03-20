import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { CreateErrorGroupDto } from './dto/create-error-group.dto';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto';
import { ErrorGroup } from './entities/error-group.entity';
import { Project } from '../projects/entities/project.entity';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { ErrorGroupResponseDto } from './dto/error-group-response.dto';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';

@Injectable()
export class ErrorGroupsService {
  private readonly logger = new Logger(ErrorGroupsService.name);

  constructor(
    @InjectRepository(ErrorGroup)
    private readonly errorGroupRepository: Repository<ErrorGroup>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createErrorGroupDto: CreateErrorGroupDto) {
    const { projectId, fingerprint, firstSeen, lastSeen, occurrences } =
      createErrorGroupDto;

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const group = this.errorGroupRepository.create({
      project,
      fingerprint,
      firstSeen: firstSeen ?? new Date(),
      lastSeen: lastSeen ?? new Date(),
      occurrences: occurrences ?? 1,
    });

    const saved = await this.errorGroupRepository.save(group);
    return this.findOne(saved.id);
  }

  async findAll(
    query: PaginationDto,
    user: UserWithRole,
  ): Promise<PaginatedResponseDto<ErrorGroupResponseDto>> {
    const { page = 1, limit = 15, search } = query;
    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);

    const queryBuilder = this.errorGroupRepository
      .createQueryBuilder('errorGroup')
      .leftJoinAndSelect('errorGroup.project', 'project')
      .orderBy('errorGroup.lastSeen', 'DESC');

    if (!isAdmin) {
      const teamIds = user.role.map((r) => r.teamId);

      const projects = await this.projectRepository.find({
        where: { team: { id: In(teamIds) } },
        select: ['id'],
      });
      const projectIds = projects.map((p) => p.id);

      if (projectIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      queryBuilder.where('errorGroup.projectId IN (:...projectIds)', {
        projectIds,
      });
    }

    if (search) {
      queryBuilder.andWhere('errorGroup.fingerprint ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const plainData = data.map((i) => instanceToPlain(i));
    const finalData = plainToInstance(ErrorGroupResponseDto, plainData, {
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

  async findOne(id: string): Promise<ErrorGroupResponseDto> {
    const entity = await this.findEntityById(id);
    return plainToInstance(
      ErrorGroupResponseDto,
      instanceToPlain(entity),
      { excludeExtraneousValues: true }
    );
  }

  private async findEntityById(id: string): Promise<ErrorGroup> {
    const group = await this.errorGroupRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!group) {
      throw new NotFoundException(`Error group with ID ${id} not found`);
    }

    return group;
  }

  async findByFingerprint(fingerprint: string) {
    const group = await this.errorGroupRepository.findOne({
      where: { fingerprint },
      relations: ['project'],
    });

    if (!group) return null;
    return group;
  }

  async update(id: string, updateErrorGroupDto: UpdateErrorGroupDto) {
    const group = await this.findEntityById(id);
    const { projectId, fingerprint, firstSeen, lastSeen, occurrences } =
      updateErrorGroupDto;

    if (projectId !== undefined) {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }
      group.project = project;
    }

    if (fingerprint !== undefined) group.fingerprint = fingerprint;
    if (firstSeen !== undefined) group.firstSeen = firstSeen;
    if (lastSeen !== undefined) group.lastSeen = lastSeen;
    if (occurrences !== undefined) group.occurrences = occurrences;

    const saved = await this.errorGroupRepository.save(group);
    return this.findOne(saved.id);
  }

  async remove(id: string) {
    const group = await this.findEntityById(id);
    await this.errorGroupRepository.remove(group);
    return { message: `Error group ${id} has been deleted` };
  }
}