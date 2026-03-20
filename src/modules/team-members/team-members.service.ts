import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { TeamMember } from './entities/team-member.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { plainToInstance, instanceToPlain } from 'class-transformer';

@Injectable()
export class TeamMembersService {
  private readonly logger = new Logger(TeamMembersService.name);

  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,

    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    const { teamId, userId, roleId } = createTeamMemberDto;

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const existing = await this.teamMemberRepository.findOne({
      where: {
        team: { id: teamId },
        user: { id: userId },
      },
      relations: ['team', 'user', 'role'],
    });

    if (existing) {
      throw new ConflictException('User is already a member of this team');
    }

    try {
      const member = this.teamMemberRepository.create({
        team,
        user,
        role: { id: roleId },
      });

      const saved = await this.teamMemberRepository.save(member);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    queryDto: PaginationDto,
  ): Promise<PaginatedResponseDto<TeamMemberResponseDto>> {
    const { page = 1, limit = 15, search } = queryDto;

    const queryBuilder = this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .addSelect('team.id', 'id')
      .leftJoinAndSelect('teamMember.team', 'team')
      .leftJoinAndSelect('team.owner', 'owner')
      .leftJoinAndSelect('teamMember.user', 'user')
      .leftJoinAndSelect('teamMember.role', 'role')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('teamMember.createdAt', 'DESC');

    if (search) {
      queryBuilder.where('user.name ILIKE :search', { search: `%${search}%` });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    const plainData = data.map((item) => instanceToPlain(item));
    const mappedData = plainToInstance(TeamMemberResponseDto, plainData, {
      excludeExtraneousValues: true,
    });

    this.logger.log(mappedData);

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TeamMemberResponseDto> {
    const member = await this.findEntityById(id);

    return plainToInstance(TeamMemberResponseDto, instanceToPlain(member), {
      excludeExtraneousValues: true,
    });
  }

  private async findEntityById(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { id },
      relations: ['team', 'team.owner', 'user', 'role'],
    });

    if (!member) {
      throw new NotFoundException(`TeamMember with id ${id} not found`);
    }

    return member;
  }

  async update(
    id: string,
    updateTeamMemberDto: UpdateTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const member = await this.findEntityById(id);
    const { userId, roleId } = updateTeamMemberDto;

    // Check user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Check role
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }

    member.user = user;
    member.role = role;

    await this.teamMemberRepository.save(member);

    // Reload to ensure all relations are fresh
    const reloaded = await this.findEntityById(id);

    return plainToInstance(TeamMemberResponseDto, instanceToPlain(reloaded), {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const member = await this.findEntityById(id);
    await this.teamMemberRepository.remove(member);
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
