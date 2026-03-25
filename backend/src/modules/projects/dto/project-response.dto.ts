import { Expose, Transform } from 'class-transformer';

export class ProjectResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  environment: string;

  @Expose()
  @Transform(({ obj }) => obj.team?.id)
  teamId: string;

  @Expose()
  @Transform(({ obj }) => obj.team?.name)
  teamName: string;

  @Expose()
  createdAt: Date;
}
