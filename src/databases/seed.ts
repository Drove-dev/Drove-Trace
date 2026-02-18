import 'dotenv/config';
import { DataSource } from 'typeorm';

// Entities
import { Project } from '../modules/projects/entities/project.entity';
import { Team } from '../modules/teams/entities/team.entity';
import { TeamMember } from '../modules/team-members/entities/team-member.entity';
import { User } from '../modules/users/entities/user.entity';
import { SdkKey } from '../modules/sdk-keys/entities/sdk-key.entity';
import { ErrorEvent } from '../modules/error-events/entities/error-event.entity';
import { ErrorGroup } from '../modules/error-groups/entities/error-group.entity';
import { Role } from '../modules/roles/entities/role.entity';

//Seed Files
import { seedMVP } from './seeds/initial-seed.seed';
import { resetSeed } from './seeds/reset.seed';

// Connect to DB
function getAppDataSource() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [
      User,
      Team,
      Role,
      TeamMember,
      Project,
      SdkKey,
      ErrorEvent,
      ErrorGroup,
    ],
  });

  return AppDataSource;
}

async function run() {
  const dataSource = getAppDataSource();

  try {
    await dataSource.initialize();

    const action = process.argv[2];

    // usage:
    // npm run seed generate
    // npm run seed reset

    if (action === 'reset') {
      console.log('🧹 Resetting seeded data...');
      await resetSeed(dataSource);
    }

    if (action === 'generate') {
      console.log('🌱 Seeding MVP data...');
      await seedMVP(dataSource);
    }

    await dataSource.destroy();
    console.log('✅ Done');
    process.exit(0);
  } catch (error) {
    console.log('Use: yarn run seed generate | yarn run seed reset');
    console.error('❌ Seed error:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// async function run() {
//     await getAppDataSource().initialize();
//     await seedMVP(getAppDataSource());
// //   await AppDataSource.initialize();
// //   await seedMVP(AppDataSource);
//   process.exit(0);
// }

run();
