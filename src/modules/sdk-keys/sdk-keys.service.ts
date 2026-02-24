import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSdkKeyDto } from './dto/create-sdk-key.dto';
import { UpdateSdkKeyDto } from './dto/update-sdk-key.dto';
import { SdkKey } from './entities/sdk-key.entity';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class SdkKeysService {
  private readonly logger = new Logger(SdkKeysService.name);

  constructor(
    @InjectRepository(SdkKey)
    private readonly sdkKeyRepository: Repository<SdkKey>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createSdkKeyDto: CreateSdkKeyDto) {
    const { projectId, key, environment, name, isActive, expiresAt, metadata } = createSdkKeyDto;

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    try {
      const sdkKey = this.sdkKeyRepository.create({
        projectId: project.id,
        key,
        environment,
        name,
        isActive: isActive ?? true,
        expiresAt,
        metadata: metadata ?? {},
      });

      const saved = await this.sdkKeyRepository.save(sdkKey);
      return saved;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return this.sdkKeyRepository.find({
      relations: ['project'],
      select: {
        id: true,
        projectId: true,
        key: true,
        environment: true,
        name: true,
        isActive: true,
        expiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        project: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const sdkKey = await this.sdkKeyRepository.findOne({
      where: { id },
      relations: ['project'],
      select: {
        id: true,
        projectId: true,
        key: true,
        environment: true,
        name: true,
        isActive: true,
        expiresAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        project: {
          id: true,
          name: true,
        },
      },
    });

    if (!sdkKey) {
      throw new NotFoundException(`SDK key with ID ${id} not found`);
    }

    return sdkKey;
  }

  private async findOneById(id: string): Promise<SdkKey> {
    const sdkKey = await this.sdkKeyRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!sdkKey) {
      throw new NotFoundException(`SDK key with ID ${id} not found`);
    }

    return sdkKey;
  }
  async findOneBykey(key: string): Promise<SdkKey> {
    const sdkKey = await this.sdkKeyRepository.findOne({
      where: { key },
      relations: ['project'],
    });

    if (!sdkKey) {
      throw new NotFoundException(`SDK key with key ${key} not found`);
    }

    return sdkKey;
  }

  async update(id: string, updateSdkKeyDto: UpdateSdkKeyDto) {
    const sdkKey = await this.findOneById(id);
    const { projectId, key, environment, name, isActive, expiresAt, metadata } = updateSdkKeyDto;

    try {
      if (projectId !== undefined) {
        const project = await this.projectRepository.findOne({
          where: { id: projectId },
        });
        if (!project) {
          throw new NotFoundException(`Project with ID ${projectId} not found`);
        }
        sdkKey.project = project;
        sdkKey.projectId = project.id;
      }

      if (key !== undefined) sdkKey.key = key;
      if (environment !== undefined) sdkKey.environment = environment;
      if (name !== undefined) sdkKey.name = name;
      if (isActive !== undefined) sdkKey.isActive = isActive;
      if (expiresAt !== undefined) sdkKey.expiresAt = expiresAt ?? null;
      if (metadata !== undefined) sdkKey.metadata = metadata ?? {};

      await this.sdkKeyRepository.save(sdkKey);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const sdkKey = await this.findOneById(id);
    await this.sdkKeyRepository.remove(sdkKey);
    return { message: `SDK key ${id} has been deleted` };
  }

  private handleDBExceptions(error: any): never {
    if (error?.code === '23505') {
      throw new BadRequestException(error.detail ?? 'Duplicate or constraint violation');
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Referenced entity not found');
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
