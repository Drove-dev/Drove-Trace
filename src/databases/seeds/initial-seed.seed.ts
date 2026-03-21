/**
 * Environment Variables required for User seeding:
 * 
 * # Seeder
 * SEED_ADMIN_EMAIL=admin@errormonitor.dev
 * SEED_ADMIN_PASSWORD=Admin123!
 * SEED_ADMIN_NAME=Admin User
 */
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { TeamMember } from '../../modules/team-members/entities/team-member.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { SdkKey } from '../../modules/sdk-keys/entities/sdk-key.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { ErrorGroup } from '../../modules/error-groups/entities/error-group.entity';
import { ErrorEvent } from '../../modules/error-events/entities/error-event.entity';

export const seedMVP = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const teamRepo = dataSource.getRepository(Team);
  const roleRepo = dataSource.getRepository(Role);
  const teamMemberRepo = dataSource.getRepository(TeamMember);
  const projectRepo = dataSource.getRepository(Project);
  const sdkRepo = dataSource.getRepository(SdkKey);
  const errorGroupRepo = dataSource.getRepository(ErrorGroup);
  const errorEventRepo = dataSource.getRepository(ErrorEvent);

  // 1) ROLES (admin, developer, viewer) - idempotency by name
  const existingAdminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  const adminRole = existingAdminRole ?? await roleRepo.save({
    id: uuidv4(),
    name: 'admin',
    description: 'Admin role',
    isActive: true,
  });

  const existingDeveloperRole = await roleRepo.findOne({ where: { name: 'developer' } });
  const developerRole = existingDeveloperRole ?? await roleRepo.save({
    id: uuidv4(),
    name: 'developer',
    description: 'Developer role',
    isActive: true,
  });

  const existingViewerRole = await roleRepo.findOne({ where: { name: 'viewer' } });
  const viewerRole = existingViewerRole ?? await roleRepo.save({
    id: uuidv4(),
    name: 'viewer',
    description: 'Viewer role',
    isActive: true,
  });

  // 2) USER ADMIN - idempotency by email
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@errormonitor.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Admin User';

  const existingUser = await userRepo.findOne({ where: { email: adminEmail } });
  let user: User;

  if (existingUser) {
    user = existingUser;
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    user = await userRepo.save({
      id: uuidv4(),
      email: adminEmail,
      passwordHash: passwordHash,
      name: adminName,
    });
  }

  // 3) TEAM - idempotency by name
  const teamName = 'Frontend Platform Team';
  const existingTeam = await teamRepo.findOne({ where: { name: teamName } });
  const team = existingTeam ?? await teamRepo.save({
    id: uuidv4(),
    name: teamName,
    owner: user,
  });

  // 4) TEAM MEMBER - idempotency by team + user
  const existingTeamMember = await teamMemberRepo.findOne({
    where: { team: { id: team.id }, user: { id: user.id } },
  });
  const teamMember = existingTeamMember ?? await teamMemberRepo.save({
    id: uuidv4(),
    team,
    user,
    role: adminRole,
  });

  // 5) PROJECT - idempotency by name
  const projectName = 'Angular Error Monitor';
  const existingProject = await projectRepo.findOne({ where: { name: projectName } });
  const project = existingProject ?? await projectRepo.save({
    id: uuidv4(),
    name: projectName,
    team,
    environment: 'production',
  });

  // 6) SDK KEYS - idempotency by name + projectId
  const existingProdKey = await sdkRepo.findOne({
    where: { name: 'Angular Prod', projectId: project.id },
  });
  const prodSdkKey = existingProdKey ?? await sdkRepo.save({
    id: uuidv4(),
    projectId: project.id,
    key: 'sdk_prod_' + uuidv4(),
    environment: 'production',
    name: 'Angular Prod',
    isActive: true,
  });

  const existingStagingKey = await sdkRepo.findOne({
    where: { name: 'Angular Staging', projectId: project.id },
  });
  const stagingSdkKey = existingStagingKey ?? await sdkRepo.save({
    id: uuidv4(),
    projectId: project.id,
    key: 'sdk_staging_' + uuidv4(),
    environment: 'staging',
    name: 'Angular Staging',
    isActive: true,
  });

  // 7) ERROR GROUP - idempotency by projectId + fingerprint
  const fingerprintHash = 'b7a1c9d2f3e44a8c9d0a112233445566';
  const existingErrorGroup = await errorGroupRepo.findOne({
    where: { project: { id: project.id }, fingerprint: fingerprintHash },
  });
  const errorGroup = existingErrorGroup ?? await errorGroupRepo.save({
    id: uuidv4(),
    project,
    fingerprint: fingerprintHash,
    firstSeen: new Date(),
    lastSeen: new Date(),
    occurrences: 1,
  });

  // 8) ERROR EVENT - create UNO si no existe ninguno en dicha sdkKeyId
  const errorEventCount = await errorEventRepo.count({
    where: { sdkKeyId: prodSdkKey.id },
  });

  if (errorEventCount === 0) {
    await errorEventRepo.save({
      id: uuidv4(),
      sdkKey: prodSdkKey.key, // original string value
      sdkKeyId: prodSdkKey.id, // new FK uuid
      fingerprint: fingerprintHash,
      message: 'TypeError: Cannot read properties of undefined (reading )',
      stackTrace:
        'TypeError: Cannot read properties of undefined (reading ) at ProductListComponent.loadProducts (product-list.component.ts:42:18)',
      file: 'src/app/products/product-list.component.ts',
      line: 42,
      browser: 'Chrome 121',
      os: 'MacOS Ventura',
      environment: 'development',
      url: 'http://localhost:4200/products',
      release: '1.3.0',
      sessionId: 'sess_6f8c9b2a4d',
      userId: 'user_102938',
      metadata: {
        action: 'loadProducts',
        feature: 'product-list',
        httpStatus: 500,
      },
    });
  }

  console.log('✅ Seed completed');
  console.log('Admin email:', adminEmail);
  console.log('SDK PROD KEY:', prodSdkKey.key);
};
