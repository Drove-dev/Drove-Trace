import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { SdkKey } from '../../sdk-keys/entities/sdk-key.entity';

export type ProjectEnvironment = 'dev' | 'staging' | 'production';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'varchar', length: 20, nullable: false })
  environment: ProjectEnvironment;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  sdkKey: string; //TODO: check if this column is requiered here!

  @OneToMany(() => SdkKey, (sdkKey) => sdkKey.project)
  sdkKeys: SdkKey[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

