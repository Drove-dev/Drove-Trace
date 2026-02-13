import { IsNotEmpty, IsString, MinLength, MaxLength, IsNumber, IsOptional, IsObject, } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateErrorEventDto {
  @IsString()
  @IsNotEmpty({ message: 'SDK key is required' })
  @MaxLength(255, { message: 'SDK key must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  sdkKey: string;

  @IsString()
  @IsNotEmpty({ message: 'Fingerprint is required' })
  @MaxLength(255, { message: 'Fingerprint must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  fingerprint: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'Stack trace is required' })
  @Transform(({ value }) => value?.trim())
  stackTrace: string;

  @IsString()
  @IsNotEmpty({ message: 'File is required' })
  @Transform(({ value }) => value?.trim())
  file: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Line number is required' })
  @Type(() => Number)
  line: number;

  @IsString()
  @IsNotEmpty({ message: 'Browser is required' })
  @Transform(({ value }) => value?.trim())
  browser: string;

  @IsString()
  @IsNotEmpty({ message: 'OS is required' })
  @Transform(({ value }) => value?.trim())
  os: string;

  @IsString()
  @IsNotEmpty({ message: 'Environment is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  environment: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'URL must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Release must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  release?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Session ID must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  sessionId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  userId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

