import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { Team } from '../teams/entities/team.entity';
import { PaginationDto } from '../../common/dtos/pagination';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';
import { paginate } from '../../common/helpers/paginate.helper';
import { ProjectResponseDto } from './dto/project-response.dto';

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
    const { name, teamId, environment } = createProjectDto;

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const project = this.projectRepository.create({
      name,
      team,
      environment,
    });

    const saved = await this.projectRepository.save(project);
    const reloaded = await this.findEntityById(saved.id);

    return plainToInstance(ProjectResponseDto, instanceToPlain(reloaded), {
      excludeExtraneousValues: true,
    });
  }

  async findAll(query: PaginationDto, user: UserWithRole) {
    const { search } = query;
    const teamIds = user.role.map((r) => r.teamId);
    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);

    const where: any = {};

    // Filter by team if not admin
    if (!isAdmin) {
      where.team = { id: In(teamIds) };
    }

    // Apply search filter if provided
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    return paginate(
      this.projectRepository,
      query,
      {
        where,
        relations: ['team'],
        order: { createdAt: 'DESC' },
      },
      ProjectResponseDto,
    );
  }

  async findOne(id: string, user: UserWithRole): Promise<ProjectResponseDto> {
    const entity = await this.findEntityById(id);

    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);
    const teamIds = user.role.map((r) => r.teamId);

    if (!isAdmin && !teamIds.includes(entity.team.id)) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return plainToInstance(ProjectResponseDto, instanceToPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  private async findEntityById(id: string): Promise<Project> {
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
    const project = await this.findEntityById(id);
    const { name, teamId, environment } = updateProjectDto;

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

    await this.projectRepository.save(project);
    const reloaded = await this.findEntityById(id);

    return plainToInstance(ProjectResponseDto, instanceToPlain(reloaded), {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string) {
    const project = await this.findEntityById(id);
    await this.projectRepository.remove(project);
    return { message: `Project ${id} has been deleted` };
  }

}
