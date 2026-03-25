import { Expose, Type } from 'class-transformer';

export class TeamMembershipDto {
  @Expose()
  teamId: string;

  @Expose()
  teamName: string;

  @Expose()
  role: string;
}

export class MeResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => TeamMembershipDto)
  teams: TeamMembershipDto[];
}
