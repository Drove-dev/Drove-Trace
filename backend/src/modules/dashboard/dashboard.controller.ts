import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Roles } from '../auth/decorators/roles/roles.decorator';
import { ValidRoles } from '../auth/interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { UserWithRole } from '../auth/interfaces';
import { MyStatsDto } from './dto/my-stats.dto';

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

  @Roles(ValidRoles.admin, ValidRoles.developer, ValidRoles.viewer)
  @Get('my-stats')
  @HttpCode(HttpStatus.OK)
  getMyStats(@GetUser() user: UserWithRole): Promise<MyStatsDto> {
    return this.dashboardService.getMyStats(user);
  }
}
