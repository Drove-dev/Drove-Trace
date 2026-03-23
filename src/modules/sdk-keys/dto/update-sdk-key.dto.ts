import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSdkKeyDto {
  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
