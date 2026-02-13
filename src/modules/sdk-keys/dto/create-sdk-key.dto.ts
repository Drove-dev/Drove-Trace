import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsObject,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSdkKeyDto {
  @IsUUID('4', { message: 'Project must be a valid UUID' })
  @IsNotEmpty({ message: 'Project is required' })
  projectId: string;

  @IsString()
  @IsNotEmpty({ message: 'Key is required' })
  @MinLength(5, { message: 'Key must be at least 5 characters long' })
  @MaxLength(255, { message: 'Key must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  key: string;

  @IsString()
  @IsNotEmpty({ message: 'Environment is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  environment: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(150, { message: 'Name must not exceed 150 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
