import { Expose, Transform } from 'class-transformer';

export class ErrorEventResponseDto {
  @Expose()
  id: string;

  @Expose()
  message: string;

  @Expose()
  fingerprint: string;

  @Expose()
  environment: string;

  @Expose()
  file: string;

  @Expose()
  line: number;

  @Expose()
  browser: string;

  @Expose()
  os: string;

  @Expose()
  url: string;

  @Expose()
  @Transform(({ obj }) => obj.sdkKeyEntity?.project?.id)
  projectId: string;

  @Expose()
  createdAt: Date;
}
