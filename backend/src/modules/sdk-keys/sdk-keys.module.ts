import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SdkKeysService } from './sdk-keys.service';
import { SdkKeysController } from './sdk-keys.controller';
import { SdkKey } from './entities/sdk-key.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SdkKey, Project])],
  controllers: [SdkKeysController],
  providers: [SdkKeysService],
  exports: [SdkKeysService],
})
export class SdkKeysModule {}
