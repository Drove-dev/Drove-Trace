import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

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
    const team = await this.teamRepository.findOne({
      where: { name: createTeamDto.name, owner: { id: createTeamDto.ownerId } },
    });
    if (team) {
      throw new BadRequestException(
        `Team with name ${createTeamDto.name} and owner ${owner.name} already exists`,
      );
    }

    try {
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
    } catch (error: any) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return this.teamRepository.find({
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
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findOne({
      where: { id },
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
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  private async findOneEntity(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOneEntity(id);
    try {
      if (updateTeamDto.name !== undefined) team.name = updateTeamDto.name;
      if (updateTeamDto.ownerId !== undefined) {
        const user = await this.userRepository.findOne({
          where: { id: updateTeamDto.ownerId },
        });
        if (!user) {
          throw new NotFoundException(
            `User with ID ${updateTeamDto.ownerId} not found`,
          );
        }
        team.owner = user;
      }
      await this.teamRepository.save(team);
      return this.findOne(id);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const team = await this.findOneEntity(id);
    await this.teamRepository.remove(team);
    return { message: `Team ${id} has been deleted` };
  }

  private handleDBExceptions(error: any): never {
    if (error?.code === '23505') {
      throw new BadRequestException(
        error.detail ?? 'Duplicate or constraint violation',
      );
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Referenced entity (e.g. owner) not found');
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
