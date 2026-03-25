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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/guards-index';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../../common/dtos/pagination';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';

@Controller('team-members')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Roles(ValidRoles.admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeamMemberDto: CreateTeamMemberDto) {
    return this.teamMembersService.create(createTeamMemberDto);
  }

  @Roles(ValidRoles.admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<TeamMemberResponseDto>> {
    return this.teamMembersService.findAll(query);
  }

  @Roles(ValidRoles.admin)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<TeamMemberResponseDto> {
    return this.teamMembersService.findOne(id);
  }

  @Roles(ValidRoles.admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    return this.teamMembersService.update(id, updateTeamMemberDto);
  }

  @Roles(ValidRoles.admin)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<void> {
    return this.teamMembersService.remove(id);
  }
}
