import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { TeamMember } from '../../modules/team-members/entities/team-member.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { SdkKey } from '../../modules/sdk-keys/entities/sdk-key.entity';
import { ErrorEvent } from '../../modules/error-events/entities/error-event.entity';
import { ErrorGroup } from '../../modules/error-groups/entities/error-group.entity';

/** Delete all rows using DELETE (avoids TRUNCATE FK issues). Order: children first. */
async function deleteAll(repo: { createQueryBuilder: (alias?: string) => any }) {
  await repo.createQueryBuilder().delete().execute();
}

export const resetSeed = async (dataSource: DataSource) => {
  console.log('🧹 Cleaning seeded data...');

  const errorEventRepo = dataSource.getRepository(ErrorEvent);
  const errorGroupRepo = dataSource.getRepository(ErrorGroup);
  const sdkRepo = dataSource.getRepository(SdkKey);
  const projectRepo = dataSource.getRepository(Project);
  const teamMemberRepo = dataSource.getRepository(TeamMember);
  const teamRepo = dataSource.getRepository(Team);
  const userRepo = dataSource.getRepository(User);

  // Delete in FK-safe order (children before parents)
  await deleteAll(errorEventRepo);
  await deleteAll(errorGroupRepo);
  await deleteAll(sdkRepo);
  await deleteAll(projectRepo);
  await deleteAll(teamMemberRepo);
  await deleteAll(teamRepo);
  await deleteAll(userRepo);

  console.log('✅ Seed data cleaned');
};
