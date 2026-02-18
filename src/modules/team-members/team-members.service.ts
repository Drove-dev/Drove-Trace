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
import { TeamMember } from './entities/team-member.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

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
        role: { id: roleId },
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

  async findAll() {
    return this.teamMemberRepository.find({
      relations: ['team', 'user'],
      select: {
        id: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        team: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const member = await this.teamMemberRepository.findOne({
      where: { id },
      relations: ['team', 'user'],
      select: {
        id: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        team: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return member;
  }

  private async findOneEntity(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { id },
      relations: ['team', 'user'],
    });

    if (!member) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return member;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    const member = await this.findOneEntity(id);
    const { teamId, userId, roleId } = updateTeamMemberDto;

    try {
      if (teamId !== undefined) {
        const team = await this.teamRepository.findOne({
          where: { id: teamId },
        });
        if (!team) {
          throw new NotFoundException(`Team with ID ${teamId} not found`);
        }
        member.team = team;
      }

      if (userId !== undefined) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        member.user = user;
      }

      if (roleId !== undefined) {
        const role = await this.roleRepository.findOne({
          where: { id: roleId },
        });
        if (!role) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        member.role = role;
      }

      // if (roleId !== undefined) {
      //   member.role = roleId;
      // }

      await this.teamMemberRepository.save(member);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const member = await this.findOneEntity(id);
    await this.teamMemberRepository.remove(member);
    return { message: `Team member ${id} has been deleted` };
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
