import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ErrorGroupsService } from './error-groups.service';
import { ErrorGroup } from './entities/error-group.entity';
import { Project } from '../projects/entities/project.entity';

const mockErrorGroupRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockProjectRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockUser = {
  role: [{ role: 'admin', teamId: 'team-1' }],
};

const mockPagination = { page: 1, limit: 15 };

describe('ErrorGroupsService', () => {
  let service: ErrorGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorGroupsService,
        {
          provide: getRepositoryToken(ErrorGroup),
          useValue: mockErrorGroupRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<ErrorGroupsService>(ErrorGroupsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  describe('create()', () => {
    const createDto = { fingerprint: 'fp-abc123', projectId: 'proj-uuid' };
    const project = { id: 'proj-uuid', name: 'App' };

    it('should create an error group with default values', async () => {
      const saved = {
        id: 'eg-1',
        fingerprint: createDto.fingerprint,
        project,
        occurrences: 1,
      };

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockErrorGroupRepository.create.mockReturnValue(saved);
      mockErrorGroupRepository.save.mockResolvedValue(saved);
      mockErrorGroupRepository.findOne.mockResolvedValue(saved);

      await service.create(createDto);

      expect(mockErrorGroupRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          project,
          fingerprint: 'fp-abc123',
          firstSeen: expect.any(Date),
          lastSeen: expect.any(Date),
          occurrences: 1,
        }),
      );
    });

    it('should create with explicit optional values when provided', async () => {
      const customDate = new Date('2026-01-15');
      const dtoWithOptionals = {
        ...createDto,
        firstSeen: customDate,
        lastSeen: customDate,
        occurrences: 5,
      };
      const saved = { id: 'eg-2', ...dtoWithOptionals, project };

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockErrorGroupRepository.create.mockReturnValue(saved);
      mockErrorGroupRepository.save.mockResolvedValue(saved);
      mockErrorGroupRepository.findOne.mockResolvedValue(saved);

      await service.create(dtoWithOptionals);

      expect(mockErrorGroupRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ occurrences: 5 }),
      );
    });

    it('should throw NotFoundException if projectId does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return paginated error groups for admin user', async () => {
      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockErrorGroupRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(mockPagination, mockUser as any);

      expect(result).toMatchObject({ data: [], total: 0, page: 1, limit: 15 });
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return an error group by id', async () => {
      const group = {
        id: 'eg-1',
        fingerprint: 'fp-abc',
        project: { id: 'p-1' },
      };
      mockErrorGroupRepository.findOne.mockResolvedValue(group);

      const result = await service.findOne('eg-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if error group does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findByFingerprint ─────────────────────────────────────
  describe('findByFingerprint()', () => {
    it('should return an error group by fingerprint', async () => {
      const group = {
        id: 'eg-1',
        fingerprint: 'fp-abc',
        project: { id: 'p-1' },
      };
      mockErrorGroupRepository.findOne.mockResolvedValue(group);

      const result = await service.findByFingerprint('fp-abc');
      expect(result).toEqual(group);
    });

    it('should return null if fingerprint does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue(null);

      const result = await service.findByFingerprint('nonexistent');
      expect(result).toBeNull();
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update()', () => {
    const existing = {
      id: 'eg-1',
      fingerprint: 'fp-abc',
      occurrences: 1,
      project: { id: 'p-1' },
    };

    it('should update occurrences and lastSeen', async () => {
      const newDate = new Date();
      const updated = { ...existing, occurrences: 5, lastSeen: newDate };

      mockErrorGroupRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockErrorGroupRepository.save.mockResolvedValue(updated);

      const result = await service.update('eg-1', {
        occurrences: 5,
        lastSeen: newDate,
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if error group does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { occurrences: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if new projectId does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValueOnce(existing);
      mockProjectRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('eg-1', { projectId: 'bad-proj' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the error group and return confirmation', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue({
        id: 'eg-1',
        fingerprint: 'fp-abc',
      });
      mockErrorGroupRepository.remove.mockResolvedValue({});

      const result = await service.remove('eg-1');
      expect(result).toEqual({ message: 'Error group eg-1 has been deleted' });
    });

    it('should throw NotFoundException if error group does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
