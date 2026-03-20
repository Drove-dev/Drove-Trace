import { Expose, Transform } from 'class-transformer';

export class TeamResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.owner?.id)
  ownerId: string;

  @Expose()
  @Transform(({ obj }) => obj.owner?.name)
  ownerName: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
