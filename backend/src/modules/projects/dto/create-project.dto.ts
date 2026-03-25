import { IsString, IsNotEmpty, MinLength, MaxLength, IsUUID, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(2, { message: 'Project name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsUUID('4', { message: 'Team must be a valid UUID' })
  @IsNotEmpty({ message: 'Team is required' })
  teamId: string;

  @IsString()
  @IsNotEmpty({ message: 'Environment is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsIn(['dev', 'staging', 'production'], {
    message: 'Environment must be dev, staging, or production',
  })
  environment: 'dev' | 'staging' | 'production';

}

