import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { ErrorEvent } from '../error-events/entities/error-event.entity';
import { SdkKey } from '../sdk-keys/entities/sdk-key.entity';
import { ErrorGroup } from '../error-groups/entities/error-group.entity';

const mockQB = {
  leftJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(0),
  getRawMany: jest.fn().mockResolvedValue([]),
  getRawOne: jest.fn().mockResolvedValue(null),
};

const mockUserRepository = { count: jest.fn().mockResolvedValue(0) };
const mockTeamRepository = { count: jest.fn().mockResolvedValue(0) };
const mockProjectRepository = {
  count: jest.fn().mockResolvedValue(0),
  find: jest.fn().mockResolvedValue([]),
};
const mockErrorEventRepository = {
  count: jest.fn().mockResolvedValue(0),
  createQueryBuilder: jest.fn().mockReturnValue(mockQB),
};
const mockSdkKeyRepository = {
  find: jest.fn().mockResolvedValue([]),
  createQueryBuilder: jest.fn().mockReturnValue(mockQB),
};
const mockErrorGroupRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQB),
};

const mockUser = {
  role: [{ role: 'admin', teamId: 'team-1' }],
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Team), useValue: mockTeamRepository },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(ErrorEvent),
          useValue: mockErrorEventRepository,
        },
        { provide: getRepositoryToken(SdkKey), useValue: mockSdkKeyRepository },
        {
          provide: getRepositoryToken(ErrorGroup),
          useValue: mockErrorGroupRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── getStats ──────────────────────────────────────────────
  describe('getStats()', () => {
    it('should return correct stats', async () => {
      mockUserRepository.count.mockResolvedValue(10);
      mockTeamRepository.count.mockResolvedValue(2);
      mockProjectRepository.count.mockResolvedValue(5);
      mockErrorEventRepository.count.mockResolvedValue(150);
      mockErrorEventRepository.createQueryBuilder.mockReturnValue(mockQB);
      mockSdkKeyRepository.createQueryBuilder.mockReturnValue(mockQB);
      mockErrorGroupRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getStats();

      expect(result.totalUsers).toBe(10);
      expect(result.totalTeams).toBe(2);
      expect(result.totalProjects).toBe(5);
      expect(result.totalErrors).toBe(150);
      expect(result.errorsByProject).toEqual([]);
      expect(result.topErrors).toEqual([]);
    });
  });

  // ── getMyStats ────────────────────────────────────────────
  describe('getMyStats()', () => {
    it('should return zero stats if user has no teams', async () => {
      const result = await service.getMyStats({ role: [] } as any);

      expect(result.totalProjects).toBe(0);
      expect(result.totalErrors).toBe(0);
    });

    it('should return zero stats if user has teams but no projects', async () => {
      mockProjectRepository.find.mockResolvedValue([]);

      const result = await service.getMyStats(mockUser as any);

      expect(result.totalProjects).toBe(0);
      expect(result.totalErrors).toBe(0);
    });

    it('should return stats with projects but no sdk keys', async () => {
      mockProjectRepository.find.mockResolvedValue([{ id: 'proj-1' }]);
      mockSdkKeyRepository.find.mockResolvedValue([]);

      const result = await service.getMyStats(mockUser as any);

      expect(result.totalProjects).toBe(1);
      expect(result.totalErrors).toBe(0);
    });

    it('should return full stats when projects and sdk keys exist', async () => {
      mockProjectRepository.find.mockResolvedValue([{ id: 'proj-1' }]);
      mockSdkKeyRepository.find.mockResolvedValue([{ id: 'sdk-1' }]);
      mockErrorEventRepository.count.mockResolvedValue(42);
      mockErrorEventRepository.createQueryBuilder.mockReturnValue(mockQB);
      mockErrorGroupRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getMyStats(mockUser as any);

      expect(result.totalProjects).toBe(1);
      expect(result.totalErrors).toBe(42);
    });
  });
});
