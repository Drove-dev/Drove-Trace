import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { ErrorEvent } from '../error-events/entities/error-event.entity';
import { SdkKey } from '../sdk-keys/entities/sdk-key.entity';
import { ErrorGroup } from '../error-groups/entities/error-group.entity';

import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { MyStatsDto } from './dto/my-stats.dto';
import type { UserWithRole } from '../auth/interfaces';

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
    @InjectRepository(SdkKey)
    private readonly sdkKeyRepository: Repository<SdkKey>,
    @InjectRepository(ErrorGroup)
    private readonly errorGroupRepository: Repository<ErrorGroup>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      totalTeams,
      totalProjects,
      totalErrors,
      errorsByProjectRaw,
      errorsByEnvironmentRaw,
      errorsLast24h,
      errorsLast7days,
      errorsLast30days,
      topErrorsRaw,
      sdkKeyStatsRaw,
    ] = await Promise.all([
      // 1. totalUsers
      this.userRepository.count(),

      // 2. totalTeams
      this.teamRepository.count(),

      // 3. totalProjects
      this.projectRepository.count(),

      // 4. totalErrors
      this.errorEventRepository.count(),

      // 5. errorsByProject
      this.errorEventRepository
        .createQueryBuilder('ee')
        .leftJoin('ee.sdkKeyEntity', 'sdk')
        .leftJoin('sdk.project', 'project')
        .select('project.id', 'projectId')
        .addSelect('project.name', 'projectName')
        .addSelect('COUNT(ee.id)', 'count')
        .groupBy('project.id')
        .addGroupBy('project.name')
        .orderBy('count', 'DESC')
        .getRawMany(),

      // 6. errorsByEnvironment
      this.errorEventRepository
        .createQueryBuilder('ee')
        .leftJoin('ee.sdkKeyEntity', 'sdk')
        .select('sdk.environment', 'environment')
        .addSelect('COUNT(ee.id)', 'count')
        .groupBy('sdk.environment')
        .getRawMany(),

      // 7. errorsLast24h
      this.errorEventRepository
        .createQueryBuilder('ee')
        .where("ee.createdAt > NOW() - INTERVAL '24 hours'")
        .getCount(),

      // 8. errorsLast7days
      this.errorEventRepository
        .createQueryBuilder('ee')
        .where("ee.createdAt > NOW() - INTERVAL '7 days'")
        .getCount(),

      // 9. errorsLast30days
      this.errorEventRepository
        .createQueryBuilder('ee')
        .where("ee.createdAt > NOW() - INTERVAL '30 days'")
        .getCount(),

      // 10. topErrors
      this.errorGroupRepository
        .createQueryBuilder('eg')
        .leftJoin('eg.project', 'project')
        .select('eg.fingerprint', 'fingerprint')
        .addSelect('project.name', 'projectName')
        .addSelect('eg.occurrences', 'occurrences')
        .orderBy('eg.occurrences', 'DESC')
        .limit(5)
        .getRawMany(),

      // 11. sdkKeyStats
      this.sdkKeyRepository
        .createQueryBuilder('sdk')
        .select('sdk.isActive', 'isActive')
        .addSelect('COUNT(sdk.id)', 'count')
        .groupBy('sdk.isActive')
        .getRawMany(),
    ]);

    // Mapeos y transformaciones de tipos (raw count strings to numbers)
    const errorsByProject = errorsByProjectRaw
      .filter((r) => r.projectId !== null)
      .map((r) => ({
        projectId: r.projectId,
        projectName: r.projectName,
        count: Number(r.count),
      }));

    const errorsByEnvironment = errorsByEnvironmentRaw
      .filter((r) => r.environment !== null)
      .map((r) => ({
        environment: r.environment,
        count: Number(r.count),
      }));

    const topErrors = topErrorsRaw.map((r) => ({
      fingerprint: r.fingerprint,
      projectName: r.projectName,
      occurrences: Number(r.occurrences),
    }));

    const activeSdkKeys = Number(
      sdkKeyStatsRaw.find((r) => r.isActive === true)?.count ?? 0,
    );
    const inactiveSdkKeys = Number(
      sdkKeyStatsRaw.find((r) => r.isActive === false)?.count ?? 0,
    );

    return {
      totalUsers,
      totalTeams,
      totalProjects,
      totalErrors,
      errorsByProject,
      errorsByEnvironment,
      errorsLast24h,
      errorsLast7days,
      errorsLast30days,
      topErrors,
      activeSdkKeys,
      inactiveSdkKeys,
    };
  }

  async getMyStats(user: UserWithRole): Promise<MyStatsDto> {
    const teamIds = user.role.map((r) => r.teamId);

    const zeroStats: MyStatsDto = {
      totalProjects: 0,
      totalErrors: 0,
      errorsLast24h: 0,
      errorsLast7days: 0,
      errorsLast30days: 0,
      errorsByProject: [],
      topErrors: [],
      lastErrorReceivedAt: null,
    };

    if (!teamIds.length) {
      return zeroStats;
    }

    const projects = await this.projectRepository.find({
      where: { team: { id: In(teamIds) } },
      select: ['id'],
    });
    const projectIds = projects.map((p) => p.id);

    if (!projectIds.length) {
      return zeroStats;
    }

    const sdkKeys = await this.sdkKeyRepository.find({
      where: { projectId: In(projectIds) },
      select: ['id'],
    });
    const sdkKeyIds = sdkKeys.map((s) => s.id);

    if (!sdkKeyIds.length) {
      return {
        ...zeroStats,
        totalProjects: projectIds.length,
      };
    }

    const [
      totalErrors,
      errorsLast24h,
      errorsLast7days,
      errorsLast30days,
      errorsByProjectRaw,
      topErrorsRaw,
      lastErrorResult,
    ] = await Promise.all([
      this.errorEventRepository.count({
        where: { sdkKeyId: In(sdkKeyIds) },
      }),

      this.errorEventRepository
        .createQueryBuilder('ee')
        .where('ee.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
        .andWhere("ee.createdAt > NOW() - INTERVAL '24 hours'")
        .getCount(),

      this.errorEventRepository
        .createQueryBuilder('ee')
        .where('ee.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
        .andWhere("ee.createdAt > NOW() - INTERVAL '7 days'")
        .getCount(),

      this.errorEventRepository
        .createQueryBuilder('ee')
        .where('ee.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
        .andWhere("ee.createdAt > NOW() - INTERVAL '30 days'")
        .getCount(),

      this.errorEventRepository
        .createQueryBuilder('ee')
        .leftJoin('ee.sdkKeyEntity', 'sdk')
        .leftJoin('sdk.project', 'project')
        .select('project.id', 'projectId')
        .addSelect('project.name', 'projectName')
        .addSelect('COUNT(ee.id)', 'count')
        .where('ee.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
        .groupBy('project.id')
        .addGroupBy('project.name')
        .orderBy('count', 'DESC')
        .getRawMany(),

      this.errorGroupRepository
        .createQueryBuilder('eg')
        .leftJoin('eg.project', 'project')
        .select('eg.fingerprint', 'fingerprint')
        .addSelect('project.name', 'projectName')
        .addSelect('eg.occurrences', 'occurrences')
        .where('eg.projectId IN (:...projectIds)', { projectIds })
        .orderBy('eg.occurrences', 'DESC')
        .limit(5)
        .getRawMany(),

      this.errorEventRepository
        .createQueryBuilder('ee')
        .select('MAX(ee.createdAt)', 'lastSeen')
        .where('ee.sdkKeyId IN (:...sdkKeyIds)', { sdkKeyIds })
        .getRawOne(),
    ]);

    const errorsByProject = errorsByProjectRaw.map((r) => ({
      projectId: r.projectId,
      projectName: r.projectName,
      count: Number(r.count),
    }));

    const topErrors = topErrorsRaw.map((r) => ({
      fingerprint: r.fingerprint,
      projectName: r.projectName,
      occurrences: Number(r.occurrences),
    }));

    const lastErrorReceivedAt = lastErrorResult?.lastSeen
      ? new Date(lastErrorResult.lastSeen)
      : null;

    return {
      totalProjects: projectIds.length,
      totalErrors,
      errorsLast24h,
      errorsLast7days,
      errorsLast30days,
      errorsByProject,
      topErrors,
      lastErrorReceivedAt,
    };
  }
}
