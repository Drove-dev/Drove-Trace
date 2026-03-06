import { IsNumber, IsOptional } from 'class-validator';

export class DashboardStatsDto {
  @IsNumber()
  @IsOptional()
  totalTeams?: number;

  @IsNumber()
  @IsOptional()
  totalProjects?: number;

  @IsNumber()
  @IsOptional()
  totalUsers?: number;

  @IsNumber()
  @IsOptional()
  totalErrors?: number;
}
