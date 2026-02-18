import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'developer', 'viewer'], {
    message: 'Role must be admin, developer, or viewer',
  })
  name: 'admin' | 'developer' | 'viewer';

  @IsString()
  description?: string;

  @IsBoolean()
  isActive: boolean;
}
