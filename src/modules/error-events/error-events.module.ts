import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorEventsService } from './error-events.service';
import { ErrorEventsController } from './error-events.controller';
import { ErrorEvent } from './entities/error-event.entity';
import { Project } from '../projects/entities/project.entity';
import { SdkKeysModule } from '../sdk-keys/sdk-keys.module';
import { ErrorGroupsModule } from '../error-groups/error-groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorEvent, Project]),
    SdkKeysModule,
    ErrorGroupsModule
  ],
  controllers: [
    ErrorEventsController,
  ],
  providers: [ErrorEventsService],
  exports: [ErrorEventsService],
})
export class ErrorEventsModule {}
