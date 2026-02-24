import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ErrorEventsService } from './error-events.service';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { IsPublic } from '../auth/decorators/is-public/is-public.decorator';
import { SdkGuard } from '../auth/guards/guards-index';
import { FingerprintThrottlerGuard } from '../auth/guards/fingerprint-throttler/fingerprint-throttler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('error-events')
export class ErrorEventsController {
  constructor(private readonly errorEventsService: ErrorEventsService) {}

  @IsPublic()
  @UseGuards(SdkGuard, FingerprintThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post()
  create(@Body() createErrorEventDto: CreateErrorEventDto) {
    return this.errorEventsService.create(createErrorEventDto);
  }
}
