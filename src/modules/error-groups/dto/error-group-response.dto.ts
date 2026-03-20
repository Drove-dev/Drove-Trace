import { Expose, Transform } from 'class-transformer';

export class ErrorGroupResponseDto {
  @Expose()
  id: string;

  @Expose()
  fingerprint: string;

  @Expose()
  firstSeen: Date;

  @Expose()
  lastSeen: Date;

  @Expose()
  occurrences: number;

  @Expose()
  projectId: string;

  @Expose()
  @Transform(({ obj }) => obj.project?.name)
  projectName: string;
}
