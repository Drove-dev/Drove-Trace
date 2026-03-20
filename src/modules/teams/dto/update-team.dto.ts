import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'Team name is required' })
  @MinLength(2, { message: 'Team name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Team name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;
}
