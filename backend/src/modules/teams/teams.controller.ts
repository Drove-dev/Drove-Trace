import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dtos/pagination';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { TeamResponseDto } from './dto/team-response.dto';

@Controller('teams')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Roles(ValidRoles.admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: PaginationDto,
    @GetUser() user: UserWithRole,
  ): Promise<PaginatedResponseDto<TeamResponseDto>> {
    return this.teamsService.findAll(query, user);
  }

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<TeamResponseDto> {
    return this.teamsService.findOne(id);
  }

  @Roles(ValidRoles.admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto): Promise<TeamResponseDto> {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Roles(ValidRoles.admin)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.teamsService.remove(id);
  }
}
