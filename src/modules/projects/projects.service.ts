import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const { name, teamId, environment, sdkKey } = createProjectDto;

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    try {
      const project = this.projectRepository.create({
        name,
        team,
        environment,
        sdkKey,
      });

      const saved = await this.projectRepository.save(project);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return this.projectRepository.find({
      relations: ['team'],
      select: {
        id: true,
        name: true,
        environment: true,
        sdkKey: true,
        createdAt: true,
        updatedAt: true,
        team: {
          id: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team'],
      select: {
        id: true,
        name: true,
        environment: true,
        sdkKey: true,
        createdAt: true,
        updatedAt: true,
        team: {
          id: true,
          name: true,
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  private async findOneEntity(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOneEntity(id);
    const { name, teamId, environment, sdkKey } = updateProjectDto;

    try {
      if (name !== undefined) {
        project.name = name;
      }

      if (teamId !== undefined) {
        const team = await this.teamRepository.findOne({ where: { id: teamId } });
        if (!team) {
          throw new NotFoundException(`Team with ID ${teamId} not found`);
        }
        project.team = team;
      }

      if (environment !== undefined) {
        project.environment = environment;
      }

      if (sdkKey !== undefined) {
        project.sdkKey = sdkKey;
      }

      await this.projectRepository.save(project);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const project = await this.findOneEntity(id);
    await this.projectRepository.remove(project);
    return { message: `Project ${id} has been deleted` };
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

