import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

/**
 * Represents a public SDK key used by client applications
 * to send error events to the platform.
 *
 * One project can have multiple SDK keys:
 * - different environments (dev/staging/prod)
 * - key rotation
 * - multiple apps under same project
 */
@Entity({ name: 'sdk_keys' })

// Quickly filter keys per project
@Index(['projectId'])

// Fast lookup when SDK sends events
@Index(['key'], { unique: true })

// Filter per environment
@Index(['environment'])
export class SdkKey {
  /**
   * Unique identifier of the SDK key record.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * FK to project owning this SDK key.
   */
  @Column({ type: 'uuid' })
  projectId: string;

  /**
   * Relation to project.
   */
  @ManyToOne(() => Project, (project) => project.sdkKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * Public key used by frontend SDK.
   * Sent with every error event.
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  key: string;

  /**
   * Environment tied to this key.
   * Example: production | staging | development
   */
  @Column({ type: 'varchar', length: 50 })
  environment: string;

  /**
   * Human-readable name for the key.
   * Example: "Angular Prod", "NextJS Staging"
   */
  @Column({ type: 'varchar', length: 150 })
  name: string;

  /**
   * Whether the key is active.
   * Allows disabling ingestion without deleting history.
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Optional expiration date for security rotation.
   */
  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  /**
   * Extra metadata.
   * Example:
   * {
   *   framework: "Angular",
   *   version: "17",
   *   owner: "frontend-team"
   * }
   */
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  /**
   * Creation timestamp.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Last update timestamp.
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
