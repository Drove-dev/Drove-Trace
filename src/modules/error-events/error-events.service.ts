import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { ErrorEvent } from './entities/error-event.entity';

@Injectable()
export class ErrorEventsService {
  private readonly logger = new Logger(ErrorEventsService.name);

  constructor(
    @InjectRepository(ErrorEvent)
    private readonly errorEventRepository: Repository<ErrorEvent>,
  ) {}

  async create(createErrorEventDto: CreateErrorEventDto) {
    const {
      sdkKey,
      fingerprint,
      message,
      stackTrace,
      file,
      line,
      browser,
      os,
      environment,
      url,
      release,
      sessionId,
      userId,
      metadata,
    } = createErrorEventDto;

    try {
      const event = this.errorEventRepository.create({
        sdkKey,
        fingerprint,
        message,
        stackTrace,
        file,
        line,
        browser,
        os,
        environment,
        url,
        release,
        sessionId,
        userId,
        metadata: metadata ?? {},
      });

      const saved = await this.errorEventRepository.save(event);
      return saved;
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
