import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateTeamMemberDto {
  @IsUUID('4', { message: 'Team must be a valid UUID' })
  @IsNotEmpty({ message: 'Team is required' })
  teamId: string;

  @IsUUID('4', { message: 'User must be a valid UUID' })
  @IsNotEmpty({ message: 'User is required' })
  userId: string;

  @IsUUID('4', { message: 'Role must be a valid UUID' })
  @IsNotEmpty({ message: 'Role is required' })
  roleId: string;

  // @IsString()
  // @IsOptional()
  // @IsIn(['admin', 'developer', 'viewer'], {
  //   message: 'Role must be admin, developer, or viewer',
  // })
  // role?: 'admin' | 'developer' | 'viewer';
}
