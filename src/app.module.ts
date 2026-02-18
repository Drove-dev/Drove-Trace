import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ErrorEventsModule } from './modules/error-events/error-events.module';
import { ErrorGroupsModule } from './modules/error-groups/error-groups.module';
import { AuthModule } from './modules/auth/auth.module';
import { SdkKeysModule } from './modules/sdk-keys/sdk-keys.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // DB Setting
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true //Disable this option in prod
    }),

    UsersModule,

    TeamsModule,

    TeamMembersModule,

    ProjectsModule,

    ErrorEventsModule,

    ErrorGroupsModule,

    AuthModule,

    SdkKeysModule,

    RolesModule,


  ],
})
export class AppModule {}
