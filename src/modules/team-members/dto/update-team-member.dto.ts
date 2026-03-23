import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateTeamMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
