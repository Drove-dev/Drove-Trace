import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateErrorGroupDto {
  @IsUUID('4', { message: 'Project must be a valid UUID' })
  @IsNotEmpty({ message: 'Project is required' })
  projectId: string;

  @IsString()
  @IsNotEmpty({ message: 'Fingerprint is required' })
  @MaxLength(255, { message: 'Fingerprint must not exceed 255 characters' })
  fingerprint: string;

  @IsOptional()
  firstSeen?: Date;

  @IsOptional()
  lastSeen?: Date;

  @IsInt()
  @Min(1, { message: 'Occurrences must be at least 1' })
  @Type(() => Number)
  @IsOptional()
  occurrences?: number;
}

