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
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth/jwt-auth.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
      synchronize: true, //TODO: Disable this option in production
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

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
