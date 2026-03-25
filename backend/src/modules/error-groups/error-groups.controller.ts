import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ErrorGroupsService } from './error-groups.service';
import { CreateErrorGroupDto } from './dto/create-error-group.dto';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto';
import { RolesGuard } from '../auth/guards/guards-index';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { ErrorGroupResponseDto } from './dto/error-group-response.dto';

@Controller('error-groups')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
export class ErrorGroupsController {
  constructor(private readonly errorGroupsService: ErrorGroupsService) {}

  // @Roles(ValidRoles.admin, ValidRoles.developer)
  // @Post()
  // create(@Body() createErrorGroupDto: CreateErrorGroupDto) {
  //   return this.errorGroupsService.create(createErrorGroupDto);
  // }

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get()
  findAll(
    @Query() query: PaginationDto,
    @GetUser() user: UserWithRole,
  ): Promise<PaginatedResponseDto<ErrorGroupResponseDto>> {
    return this.errorGroupsService.findAll(query, user);
  }

  @Roles(ValidRoles.admin, ValidRoles.developer)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ErrorGroupResponseDto> {
    return this.errorGroupsService.findOne(id);
  }

  // @Roles(ValidRoles.admin)
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateErrorGroupDto: UpdateErrorGroupDto,
  // ) {
  //   return this.errorGroupsService.update(id, updateErrorGroupDto);
  // }

  // @Roles(ValidRoles.admin)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.errorGroupsService.remove(id);
  // }
}
