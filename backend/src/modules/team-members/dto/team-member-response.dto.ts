import { Expose, Transform } from 'class-transformer';

export class TeamMemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.team?.name)
  teamName: string;

  @Expose()
  @Transform(({ obj }) => obj.team?.owner?.name)
  teamOwnerName: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.id)
  userId: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.name)
  userName: string;

  @Expose()
  @Transform(({ obj }) => obj.role?.name)
  roleNames: string;

  @Expose()
  @Transform(({ obj }) => obj.role?.id)
  roleId: string;

  @Expose()
  createdAt: Date;
}
