import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ErrorEventsService } from './error-events.service';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { IsPublic } from '../auth/decorators/is-public/is-public.decorator';
import { RolesGuard, SdkGuard } from '../auth/guards/guards-index';
import { FingerprintThrottlerGuard } from '../auth/guards/fingerprint-throttler/fingerprint-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { ErrorEventResponseDto } from './dtos/error-event-response.dto';

@ApiTags('Error Events')
@ApiBearerAuth('jwt')
@Controller('error-events')
export class ErrorEventsController {
  constructor(private readonly errorEventsService: ErrorEventsService) {}

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @UseGuards(RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: PaginationDto,
    @GetUser() user: UserWithRole,
  ): Promise<PaginatedResponseDto<ErrorEventResponseDto>> {
    return this.errorEventsService.findAll(query, user);
  }


  @IsPublic()
  @UseGuards(SdkGuard, FingerprintThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post()
  create(@Body() createErrorEventDto: CreateErrorEventDto) {
    return this.errorEventsService.create(createErrorEventDto);
  }
}
