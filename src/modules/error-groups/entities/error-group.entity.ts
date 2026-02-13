import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('error_groups')
export class ErrorGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

