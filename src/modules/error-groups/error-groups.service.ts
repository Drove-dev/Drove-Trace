import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateErrorGroupDto } from './dto/create-error-group.dto';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto';
import { ErrorGroup } from './entities/error-group.entity';
import { Project } from '../projects/entities/project.entity';

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

    try {
      const group = this.errorGroupRepository.create({
        project,
        fingerprint,
        firstSeen: firstSeen ?? new Date(),
        lastSeen: lastSeen ?? new Date(),
        occurrences: occurrences ?? 1,
      });

      const saved = await this.errorGroupRepository.save(group);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return this.errorGroupRepository.find({
      relations: ['project'],
      select: {
        id: true,
        fingerprint: true,
        firstSeen: true,
        lastSeen: true,
        occurrences: true,
        project: {
          id: true,
          name: true,
        },
      },
      order: { lastSeen: 'DESC' },
    });
  }

  async findOne(id: string) {
    const group = await this.errorGroupRepository.findOne({
      where: { id },
      relations: ['project'],
      select: {
        id: true,
        fingerprint: true,
        firstSeen: true,
        lastSeen: true,
        occurrences: true,
        project: {
          id: true,
          name: true,
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Error group with ID ${id} not found`);
    }

    return group;
  }

  private async findOneEntity(id: string): Promise<ErrorGroup> {
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
    const group = await this.findOneEntity(id);
    const { projectId, fingerprint, firstSeen, lastSeen, occurrences } =
      updateErrorGroupDto;

    try {
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

      await this.errorGroupRepository.save(group);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const group = await this.findOneEntity(id);
    await this.errorGroupRepository.remove(group);
    return { message: `Error group ${id} has been deleted` };
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