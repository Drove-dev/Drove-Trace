import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ErrorEventsService } from './error-events.service';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { IsPublic } from '../auth/decorators/is-public/is-public.decorator';
import { SdkGuard } from '../auth/guards/guards-index';

@Controller('error-events')
export class ErrorEventsController {
  constructor(private readonly errorEventsService: ErrorEventsService) {}

  @IsPublic()
  @UseGuards(SdkGuard)
  @Post()
  create(@Body() createErrorEventDto: CreateErrorEventDto) {
    return this.errorEventsService.create(createErrorEventDto);
  }
}
