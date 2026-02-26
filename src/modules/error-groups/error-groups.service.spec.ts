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
};

const mockProjectRepository = {
  findOne: jest.fn(),
};

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
  // CreateErrorGroupDto: projectId (required, UUID), fingerprint (required, max 255),
  //                      firstSeen? (Date), lastSeen? (Date), occurrences? (int, min 1)
  describe('create()', () => {
    const createDto = { fingerprint: 'fp-abc123', projectId: 'proj-uuid' };
    const project = { id: 'proj-uuid', name: 'App' };

    it('should create an error group with default values (firstSeen, lastSeen, occurrences)', async () => {
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

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
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

      const result = await service.create(dtoWithOptionals);

      expect(result.occurrences).toBe(5);
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
    it('should return an array of error groups with project relation', async () => {
      const groups = [
        { id: '1', fingerprint: 'fp-1', project: { id: 'p-1', name: 'App' } },
      ];
      mockErrorGroupRepository.find.mockResolvedValue(groups);

      expect(await service.findAll()).toEqual(groups);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return an error group by id', async () => {
      const group = { id: 'eg-1', fingerprint: 'fp-abc' };
      mockErrorGroupRepository.findOne.mockResolvedValue(group);

      expect(await service.findOne('eg-1')).toEqual(group);
    });

    it('should throw NotFoundException if error group does not exist', async () => {
      mockErrorGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findByFingerprint ─────────────────────────────────────
  // Returns the group or null (does NOT throw NotFoundException)
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
  // UpdateErrorGroupDto: PartialType → projectId?, fingerprint?, firstSeen?, lastSeen?, occurrences?
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
      expect(result.occurrences).toBe(5);
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
