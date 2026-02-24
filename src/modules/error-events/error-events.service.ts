import { BadRequestException, Injectable, InternalServerErrorException, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { ErrorEvent } from './entities/error-event.entity';
import { SdkKeysService } from '../sdk-keys/sdk-keys.service';
import { ErrorGroupsService } from '../error-groups/error-groups.service';

@Injectable()
export class ErrorEventsService {
  private readonly logger = new Logger(ErrorEventsService.name);

  constructor(
    @InjectRepository(ErrorEvent)
    private readonly errorEventRepository: Repository<ErrorEvent>,
    private readonly sdkService: SdkKeysService,
    private readonly errorGroupService: ErrorGroupsService,
  ) {}

  async create(createErrorEventDto: CreateErrorEventDto) {
    const { sdkKey, fingerprint, message, stackTrace, file, line, browser, os, environment, url, release, sessionId, userId, metadata, } = createErrorEventDto;
    // log('Received error event:', createErrorEventDto);

    const existSdk = await this.sdkService.findOneBykey(sdkKey);
    if (!existSdk) throw new BadRequestException('Invalid SDK key');

    this.findOrCreateErrorGroup(fingerprint, sdkKey);

    try {
      const event = this.errorEventRepository.create({ sdkKey, fingerprint, message, stackTrace, file, line, browser, os, environment, url, release, sessionId, userId, metadata: metadata ?? {}, });

      return await this.errorEventRepository.save(event);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  async findOrCreateErrorGroup(fingerPrint: string, sdk: string) {
    try {
      const fp = await this.errorGroupService.findByFingerprint(fingerPrint);
      if (fp) {
        this.errorGroupService.update(fp.id, {
          lastSeen: new Date(),
          occurrences: fp.occurrences + 1,
        });
      }
      else {
        this.errorGroupService.create({
          fingerprint: fingerPrint,
          projectId: (await this.sdkService.findOneBykey(sdk)).project.id,
        });
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error?.code === '23505') {
      throw new BadRequestException(
        error.detail ?? 'Duplicate or constraint violation',
      );
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Referenced entity not found');
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
