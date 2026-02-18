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

  // 1) USER
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);
  const user = await userRepo.save({
    id: uuidv4(),
    email: 'demo@errormonitor.dev',
    passwordHash: passwordHash,
    name: 'Demo User',
  });

  // 2) TEAM
  const team = await teamRepo.save({
    id: uuidv4(),
    name: 'Frontend Platform Team',
    owner: user,
  });

  //  3)ROLE
  const role = await roleRepo.save({
    id: uuidv4(),
    name: 'admin',
    description: 'Admin role',
    isActive: true,
  });

  // 4) TEAM MEMBER
  await teamMemberRepo.save({
    id: uuidv4(),
    team,
    user,
    role,
  });

  // 5) PROJECT
  const project = await projectRepo.save({
    id: uuidv4(),
    name: 'Angular Error Monitor',
    team,
    environment: 'production',
    sdkKey: 'deprecated-sdk-key-field',
  });

  // 6) SDK KEYS
  const sdkKeys = await sdkRepo.save([
    {
      id: uuidv4(),
      projectId: project.id,
      key: 'sdk_prod_' + uuidv4(),
      environment: 'production',
      name: 'Angular Prod',
      isActive: true,
    },
    {
      id: uuidv4(),
      projectId: project.id,
      key: 'sdk_staging_' + uuidv4(),
      environment: 'staging',
      name: 'Angular Staging',
      isActive: true,
    },
  ]);

  // 7) Error Group
  const errorGroup = await errorGroupRepo.save({
    id: uuidv4(),
    project,
    fingerprint: 'b7a1c9d2f3e44a8c9d0a112233445566',
    firstSeen: new Date(),
    lastSeen: new Date(),
    occurrences: 1,
  });

  // 8)  Error Event
  const errorEvent = await errorEventRepo.save({
    id: uuidv4(),
    sdkKey: sdkKeys[0].key,
    fingerprint: 'b7a1c9d2f3e44a8c9d0a112233445566',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('🌱 MVP seed completed');
  console.log('SDK PROD KEY:', sdkKeys[0].key);
};
