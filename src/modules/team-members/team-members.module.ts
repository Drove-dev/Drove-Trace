import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMembersService } from './team-members.service';
import { TeamMembersController } from './team-members.controller';
import { TeamMember } from './entities/team-member.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, Team, User])],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
  exports: [TeamMembersService],
})
export class TeamMembersModule {}
