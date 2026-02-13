import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ErrorEventsService } from './error-events.service';
import { CreateErrorEventDto } from './dto/create-error-event.dto';
import { UpdateErrorEventDto } from './dto/update-error-event.dto';

@Controller('error-events')
export class ErrorEventsController {
  constructor(private readonly errorEventsService: ErrorEventsService) {}

  @Post()
  create(@Body() createErrorEventDto: CreateErrorEventDto) {
    return this.errorEventsService.create(createErrorEventDto);
  }

  // @Get()
  // findAll() {
  //   return this.errorEventsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.errorEventsService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateErrorEventDto: UpdateErrorEventDto) {
  //   return this.errorEventsService.update(id, updateErrorEventDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.errorEventsService.remove(id);
  // }
}
