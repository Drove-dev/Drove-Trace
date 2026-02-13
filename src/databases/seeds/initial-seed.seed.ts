import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { TeamMember } from '../../modules/team-members/entities/team-member.entity';
import { Project } from '../../modules/projects/entities/project.entity';
import { SdkKey } from '../../modules/sdk-keys/entities/sdk-key.entity';

export const seedMVP = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const teamRepo = dataSource.getRepository(Team);
  const teamMemberRepo = dataSource.getRepository(TeamMember);
  const projectRepo = dataSource.getRepository(Project);
  const sdkRepo = dataSource.getRepository(SdkKey);

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

  // 3) TEAM MEMBER
  await teamMemberRepo.save({
    id: uuidv4(),
    team,
    user,
    role: 'admin',
  });

  // 4) PROJECT
  const project = await projectRepo.save({
    id: uuidv4(),
    name: 'Angular Error Monitor',
    team,
    environment: 'production',
    sdkKey: 'deprecated-sdk-key-field',
  });

  // 5) SDK KEYS
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

  console.log('🌱 MVP seed completed');
  console.log('SDK PROD KEY:', sdkKeys[0].key);
};



//TODO: Init data to error_events DB table
// {
//   "id": "aebbc103-6438-4a2d-9acc-475d7d5b0c74",
//   "sdkKey": "sdk_dev_9f3c2e10-7a4b-4b8a-9f9c-2e2d6a5a1c33",
//   "fingerprint": "b7a1c9d2f3e44a8c9d0a112233445566",
//   "message": "TypeError: Cannot read properties of undefined (reading 'length')",
//   "stackTrace": "TypeError: Cannot read properties of undefined (reading 'length') at ProductListComponent.loadProducts (product-list.component.ts:42:18)",
//   "file": "src/app/products/product-list.component.ts",
//   "line": 42,
//   "browser": "Chrome 121",
//   "os": "MacOS Ventura",
//   "environment": "development",
//   "url": "http://localhost:4200/products",
//   "release": "1.3.0",
//   "sessionId": "sess_6f8c9b2a4d",
//   "userId": "user_102938",
//   "metadata": {
//     "action": "loadProducts",
//     "feature": "product-list",
//     "httpStatus": 500
//   },
//   "createdAt": "2026-02-13T09:38:40.942Z",
//   "updatedAt": "2026-02-13T09:38:40.942Z"
// }