import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles/roles.guard';

@Controller('dashboard')
@ApiBearerAuth('jwt')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(ValidRoles.admin)
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }
}
