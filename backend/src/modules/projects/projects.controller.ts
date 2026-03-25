import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RolesGuard } from '../auth/guards/guards-index';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import type { UserWithRole } from '../auth/interfaces';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dtos/pagination';
import { ProjectResponseDto } from './dto/project-response.dto';

@ApiTags('Projects')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(ValidRoles.admin)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get()
  findAll(@Query() query: PaginationDto, @GetUser() user: UserWithRole) {
    return this.projectsService.findAll(query, user);
  }

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser() user: UserWithRole,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, user);
  }

  @Roles(ValidRoles.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Roles(ValidRoles.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
