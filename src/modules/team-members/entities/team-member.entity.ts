import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { User } from '../../users/entities/user.entity';

export type TeamMemberRole = 'admin' | 'developer' | 'viewer';

@Entity('team_members')
export class TeamMember {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 20, default: 'viewer' })
  role: TeamMemberRole; //TODO: add role relation

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
}