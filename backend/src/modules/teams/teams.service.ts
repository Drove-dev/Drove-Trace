import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';

import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const owner = await this.userRepository.findOne({
      where: { id: createTeamDto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException(
        `User with ID ${createTeamDto.ownerId} not found`,
      );
    }
    const teamExists = await this.teamRepository.findOne({
      where: { name: createTeamDto.name, owner: { id: createTeamDto.ownerId } },
    });
    if (teamExists) {
      throw new BadRequestException(
        `Team with name ${createTeamDto.name} and owner ${owner.name} already exists`,
      );
    }

    const team = this.teamRepository.create({
      name: createTeamDto.name,
      owner,
    });
    const saved = await this.teamRepository.save(team);
    return this.teamRepository.findOne({
      where: { id: saved.id },
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          id: true,
          email: true,
          name: true,
        },
      },
    });
  }

  async findAll(
    query: PaginationDto,
    user: UserWithRole,
  ): Promise<PaginatedResponseDto<TeamResponseDto>> {
    const { page = 1, limit = 15, search } = query;
    const isAdmin = user.role.some((r) => r.role === ValidRoles.admin);

    const queryBuilder = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'owner')
      .orderBy('team.createdAt', 'DESC');

    if (!isAdmin) {
      const teamIds = user.role.map((r) => r.teamId);

      if (teamIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      queryBuilder.where('team.id IN (:...teamIds)', { teamIds });
    }

    if (search) {
      queryBuilder.andWhere('team.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const plainData = data.map((i) => instanceToPlain(i));
    const mappedData = plainToInstance(TeamResponseDto, plainData, {
      excludeExtraneousValues: true,
    });

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TeamResponseDto> {
    const entity = await this.findEntityById(id);
    return plainToInstance(TeamResponseDto, instanceToPlain(entity), {
      excludeExtraneousValues: true,
    });
  }

  private async findEntityById(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamResponseDto> {
    const team = await this.findEntityById(id);
    
    if (updateTeamDto.name !== undefined) {
      team.name = updateTeamDto.name;
    }
    
    const saved = await this.teamRepository.save(team);
    const reloaded = await this.findEntityById(saved.id);
    
    return plainToInstance(TeamResponseDto, instanceToPlain(reloaded), {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const team = await this.findEntityById(id);
    await this.teamRepository.remove(team);
    return { message: `Team ${id} has been deleted` };
  }
}
