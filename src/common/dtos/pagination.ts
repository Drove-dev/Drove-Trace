import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    default: 1,
    required: true,
  })
  @IsNotEmpty({ message: 'Page is required' })
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    description: 'Limit of elements per page must be less than or equal to 15',
    default: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  @Min(1)
  @Max(15)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search keyword',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
