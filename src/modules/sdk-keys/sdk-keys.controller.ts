import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/guards-index';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../../common/dtos/pagination';
import { SdkKeysService } from './sdk-keys.service';
import { UpdateSdkKeyDto } from './dto/update-sdk-key.dto';
import { SdkKeyResponseDto } from './dto/sdk-key-response.dto';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';

@ApiTags('SDK Keys')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
@Controller('sdk-keys')
export class SdkKeysController {
  constructor(private readonly sdkKeysService: SdkKeysService) {}

  @ApiOperation({ summary: 'Get all SDK keys paginated and searchable by name' })
  @Roles(ValidRoles.admin)
  @Get()
  async findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<SdkKeyResponseDto>> {
    return this.sdkKeysService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a single SDK key by ID' })
  @Roles(ValidRoles.admin)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SdkKeyResponseDto> {
    return this.sdkKeysService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an SDK key status' })
  @Roles(ValidRoles.admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSdkKeyDto: UpdateSdkKeyDto,
  ): Promise<SdkKeyResponseDto> {
    return this.sdkKeysService.update(id, updateSdkKeyDto);
  }

  @ApiOperation({ summary: 'Remove an SDK key' })
  @Roles(ValidRoles.admin)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sdkKeysService.remove(id);
  }
}
