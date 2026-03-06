import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Project } from '../projects/entities/project.entity';
import { ErrorEvent } from '../error-events/entities/error-event.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ErrorEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return correct stats from repositories', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10) // User
        .mockResolvedValueOnce(2) // Team
        .mockResolvedValueOnce(5) // Project
        .mockResolvedValueOnce(150); // ErrorEvent

      const result = await service.getStats();

      expect(mockRepository.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        totalUsers: 10,
        totalTeams: 2,
        totalProjects: 5,
        totalErrors: 150,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.count.mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.getStats()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });
});
