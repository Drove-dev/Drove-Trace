import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorGroupsService } from './error-groups.service';
import { ErrorGroupsController } from './error-groups.controller';
import { ErrorGroup } from './entities/error-group.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorGroup, Project])],
  controllers: [ErrorGroupsController],
  providers: [ErrorGroupsService],
  exports: [ErrorGroupsService],
})
export class ErrorGroupsModule {}
