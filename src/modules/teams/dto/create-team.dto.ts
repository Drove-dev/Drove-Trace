import {
  IsString,
  IsNotEmpty,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'Team name is required' })
  @MinLength(2, { message: 'Team name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Team name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsUUID('4', { message: 'Owner must be a valid UUID' })
  @IsNotEmpty({ message: 'Owner is required' })
  ownerId: string;
}
