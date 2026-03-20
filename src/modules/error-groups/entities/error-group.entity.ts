import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Index(['projectId', 'fingerprint'], { unique: true })
@Entity('error_groups')
export class ErrorGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fingerprint: string;

  @Column({ type: 'timestamp', nullable: false })
  firstSeen: Date;

  @Column({ type: 'timestamp', nullable: false })
  lastSeen: Date;

  @Column({ type: 'integer', default: 1 })
  occurrences: number;
}
