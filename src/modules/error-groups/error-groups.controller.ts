import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ErrorGroupsService } from './error-groups.service';
import { CreateErrorGroupDto } from './dto/create-error-group.dto';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto';

@Controller('error-groups')
export class ErrorGroupsController {
  constructor(private readonly errorGroupsService: ErrorGroupsService) {}

  @Post()
  create(@Body() createErrorGroupDto: CreateErrorGroupDto) {
    return this.errorGroupsService.create(createErrorGroupDto);
  }

  @Get()
  findAll() {
    return this.errorGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.errorGroupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateErrorGroupDto: UpdateErrorGroupDto) {
    return this.errorGroupsService.update(id, updateErrorGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.errorGroupsService.remove(id);
  }
}
