import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { ErrorEvent } from '../error-events/entities/error-event.entity';
import { SdkKey } from '../sdk-keys/entities/sdk-key.entity';
import { ErrorGroup } from '../error-groups/entities/error-group.entity';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Team,
      Project,
      ErrorEvent,
      SdkKey,
      ErrorGroup,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
