import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { ErrorEvent } from '../error-events/entities/error-event.entity';

import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ErrorEvent)
    private readonly errorEventRepository: Repository<ErrorEvent>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    try {
      const [totalUsers, totalTeams, totalProjects, totalErrors] =
        await Promise.all([
          this.userRepository.count(),
          this.teamRepository.count(),
          this.projectRepository.count(),
          this.errorEventRepository.count(),
        ]);

      return {
        totalUsers,
        totalTeams,
        totalProjects,
        totalErrors,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get dashboard stats: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve dashboard statistics',
      );
    }
  }
}
