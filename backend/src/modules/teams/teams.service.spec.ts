import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';

const mockTeamRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockUser = {
  role: [{ role: 'admin', teamId: 'team-1' }],
};

const mockPagination = { page: 1, limit: 15 };

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockTeamRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  describe('create()', () => {
    const createDto = { name: 'Dev Team', ownerId: 'owner-uuid' };
    const owner = { id: 'owner-uuid', email: 'owner@mail.com', name: 'Owner' };

    it('should create and return the team with owner relation', async () => {
      const savedTeam = {
        id: 'team-1',
        name: createDto.name,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(owner);
      mockTeamRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedTeam);
      mockTeamRepository.create.mockReturnValue({
        name: createDto.name,
        owner,
      });
      mockTeamRepository.save.mockResolvedValue(savedTeam);

      const result = await service.create(createDto);

      expect(result).toEqual(savedTeam);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-uuid' },
      });
    });

    it('should throw NotFoundException if ownerId does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if team name + owner already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(owner);
      mockTeamRepository.findOne.mockResolvedValue({
        id: 'existing',
        name: createDto.name,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return paginated teams for admin user', async () => {
      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockTeamRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(mockPagination, mockUser as any);

      expect(result).toMatchObject({ data: [], total: 0, page: 1, limit: 15 });
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a team by id', async () => {
      const team = { id: 'team-1', name: 'Dev', owner: { id: 'o-1' } };
      mockTeamRepository.findOne.mockResolvedValue(team);

      const result = await service.findOne('team-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update()', () => {
    const existing = { id: 'team-1', name: 'Old Name', owner: { id: 'o-1' } };

    it('should update the team name', async () => {
      const updated = { ...existing, name: 'New Name' };
      mockTeamRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockTeamRepository.save.mockResolvedValue(updated);

      const result = await service.update('team-1', { name: 'New Name' });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the team and return confirmation', async () => {
      mockTeamRepository.findOne.mockResolvedValue({
        id: 'team-1',
        name: 'Dev',
      });
      mockTeamRepository.remove.mockResolvedValue({});

      const result = await service.remove('team-1');
      expect(result).toEqual({ message: 'Team team-1 has been deleted' });
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
