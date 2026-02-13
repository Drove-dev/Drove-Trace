import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SdkKeysService } from './sdk-keys.service';
import { CreateSdkKeyDto } from './dto/create-sdk-key.dto';
import { UpdateSdkKeyDto } from './dto/update-sdk-key.dto';

@Controller('sdk-keys')
export class SdkKeysController {
  constructor(private readonly sdkKeysService: SdkKeysService) {}

  @Post()
  create(@Body() createSdkKeyDto: CreateSdkKeyDto) {
    return this.sdkKeysService.create(createSdkKeyDto);
  }

  @Get()
  findAll() {
    return this.sdkKeysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sdkKeysService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSdkKeyDto: UpdateSdkKeyDto) {
    return this.sdkKeysService.update(id, updateSdkKeyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sdkKeysService.remove(id);
  }
}
