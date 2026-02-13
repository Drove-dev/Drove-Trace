import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { UpdateErrorEventDto } from './dto/update-error-event.dto';
import { ErrorEvent } from './entities/error-event.entity';

@Injectable()
export class ErrorEventsService {
  private readonly logger = new Logger(ErrorEventsService.name);

  constructor(
    @InjectRepository(ErrorEvent)
    private readonly errorEventRepository: Repository<ErrorEvent>,
  ) {}

  async create(createErrorEventDto: CreateErrorEventDto) {
    const { sdkKey, fingerprint, message, stackTrace, file, line, browser, os, environment, url, release, sessionId, userId, metadata, } = createErrorEventDto;

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

  // async findAll() {
  //   return this.errorEventRepository.find({
  //     relations: ['project'],
  //     select: {
  //       id: true,
  //       message: true,
  //       stackTrace: true,
  //       file: true,
  //       line: true,
  //       browser: true,
  //       os: true,
  //       environment: true,
  //       userId: true,
  //       metadata: true,
  //       timestamp: true,
  //       project: {
  //         id: true,
  //         name: true,
  //       },
  //     },
  //     order: { timestamp: 'DESC' },
  //   });
  // }

  // async findOne(id: string) {
  //   const event = await this.errorEventRepository.findOne({
  //     where: { id },
  //     relations: ['project'],
  //     select: {
  //       id: true,
  //       message: true,
  //       stackTrace: true,
  //       file: true,
  //       line: true,
  //       browser: true,
  //       os: true,
  //       environment: true,
  //       userId: true,
  //       metadata: true,
  //       timestamp: true,
  //       project: {
  //         id: true,
  //         name: true,
  //       },
  //     },
  //   });

  //   if (!event) {
  //     throw new NotFoundException(`Error event with ID ${id} not found`);
  //   }

  //   return event;
  // }

  // private async findOneEntity(id: string): Promise<ErrorEvent> {
  //   const event = await this.errorEventRepository.findOne({
  //     where: { id },
  //     relations: ['project'],
  //   });

  //   if (!event) {
  //     throw new NotFoundException(`Error event with ID ${id} not found`);
  //   }

  //   return event;
  // }

  // async update(id: string, updateErrorEventDto: UpdateErrorEventDto) {
  //   const event = await this.findOneEntity(id);
  //   const {
  //     projectId,
  //     message,
  //     stackTrace,
  //     file,
  //     line,
  //     browser,
  //     os,
  //     environment,
  //     userId,
  //     metadata,
  //   } = updateErrorEventDto;

  //   try {
  //     if (projectId !== undefined) {
  //       const project = await this.projectRepository.findOne({
  //         where: { id: projectId },
  //       });
  //       if (!project) {
  //         throw new NotFoundException(`Project with ID ${projectId} not found`);
  //       }
  //       event.project = project;
  //     }

  //     if (message !== undefined) event.message = message;
  //     if (stackTrace !== undefined) event.stackTrace = stackTrace;
  //     if (file !== undefined) event.file = file;
  //     if (line !== undefined) event.line = line;
  //     if (browser !== undefined) event.browser = browser;
  //     if (os !== undefined) event.os = os;
  //     if (environment !== undefined) event.environment = environment;
  //     if (userId !== undefined) event.userId = userId ?? null;
  //     if (metadata !== undefined) event.metadata = metadata ?? null;

  //     await this.errorEventRepository.save(event);
  //     return this.findOne(id);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) throw error;
  //     this.handleDBExceptions(error);
  //   }
  // }

  // async remove(id: string) {
  //   const event = await this.findOneEntity(id);
  //   await this.errorEventRepository.remove(event);
  //   return { message: `Error event ${id} has been deleted` };
  // }

  private handleDBExceptions(error: any): never {
    if (error?.code === '23505') {
      throw new BadRequestException(error.detail ?? 'Duplicate or constraint violation');
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Referenced entity not found');
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}

