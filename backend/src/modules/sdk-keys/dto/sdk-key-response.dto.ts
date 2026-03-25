import { Expose, Transform } from 'class-transformer';

export class SdkKeyResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.project?.name)
  project: string;

  @Expose()
  key: string;

  @Expose()
  environment: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
