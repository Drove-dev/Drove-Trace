import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ErrorEventsModule } from './modules/error-events/error-events.module';
import { ErrorGroupsModule } from './modules/error-groups/error-groups.module';
import { AuthModule } from './modules/auth/auth.module';
import { SdkKeysModule } from './modules/sdk-keys/sdk-keys.module';
import { RolesModule } from './modules/roles/roles.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth/jwt-auth.guard';

import { JoiValidationSchema } from './config/joi.validation';
import { EnvConfiguration } from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    // DB Setting
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        autoLoadEntities: true,
        synchronize: true, //TODO: Disable this option in production
      }),
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

    DashboardModule,

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
