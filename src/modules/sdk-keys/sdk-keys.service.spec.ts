import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SdkKeysService } from './sdk-keys.service';
import { SdkKey } from './entities/sdk-key.entity';
import { Project } from '../projects/entities/project.entity';

const mockSdkKeyRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockProjectRepository = {
  findOne: jest.fn(),
};

describe('SdkKeysService', () => {
  let service: SdkKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SdkKeysService,
        { provide: getRepositoryToken(SdkKey), useValue: mockSdkKeyRepository },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<SdkKeysService>(SdkKeysService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  // CreateSdkKeyDto: projectId (required, UUID), key (required, 5-255), environment (required),
  //                  name (required, 2-150), isActive? (boolean), expiresAt? (Date), metadata? (object)
  describe('create()', () => {
    const createDto = {
      projectId: 'proj-uuid',
      key: 'sdk-key-12345',
      environment: 'production',
      name: 'Angular Prod',
    };
    const project = { id: 'proj-uuid', name: 'App' };

    it('should create an SDK key linked to the project', async () => {
      const saved = {
        id: 'key-1',
        ...createDto,
        projectId: project.id,
        isActive: true,
        metadata: {},
      };

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockSdkKeyRepository.create.mockReturnValue(saved);
      mockSdkKeyRepository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'proj-uuid' },
      });
    });

    it('should create with optional fields (isActive, expiresAt, metadata)', async () => {
      const dtoWithOptionals = {
        ...createDto,
        isActive: false,
        expiresAt: new Date('2027-01-01'),
        metadata: { framework: 'Angular', version: '17' },
      };
      const saved = { id: 'key-2', ...dtoWithOptionals, projectId: project.id };

      mockProjectRepository.findOne.mockResolvedValue(project);
      mockSdkKeyRepository.create.mockReturnValue(saved);
      mockSdkKeyRepository.save.mockResolvedValue(saved);

      const result = await service.create(dtoWithOptionals);

      expect(result.isActive).toBe(false);
      expect(result.metadata).toEqual({ framework: 'Angular', version: '17' });
    });

    it('should throw NotFoundException if projectId does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockSdkKeyRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of SDK keys with project relation', async () => {
      const keys = [
        { id: '1', key: 'abc', project: { id: 'p-1', name: 'App' } },
      ];
      mockSdkKeyRepository.find.mockResolvedValue(keys);

      expect(await service.findAll()).toEqual(keys);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return an SDK key by id', async () => {
      const sdkKey = { id: 'key-1', key: 'abc', project: { id: 'p-1' } };
      mockSdkKeyRepository.findOne.mockResolvedValue(sdkKey);

      expect(await service.findOne('key-1')).toEqual(sdkKey);
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findOneBykey ──────────────────────────────────────────
  // Used by ErrorEventsService to validate incoming SDK keys
  describe('findOneBykey()', () => {
    it('should return an SDK key by its key string', async () => {
      const sdkKey = {
        id: 'key-1',
        key: 'sdk-key-12345',
        project: { id: 'proj-1' },
      };
      mockSdkKeyRepository.findOne.mockResolvedValue(sdkKey);

      const result = await service.findOneBykey('sdk-key-12345');
      expect(result).toEqual(sdkKey);
      expect(mockSdkKeyRepository.findOne).toHaveBeenCalledWith({
        where: { key: 'sdk-key-12345' },
        relations: ['project'],
      });
    });

    it('should throw NotFoundException if key string does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneBykey('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateSdkKeyDto: PartialType → projectId?, key?, environment?, name?, isActive?, expiresAt?, metadata?
  describe('update()', () => {
    const existing = {
      id: 'key-1',
      key: 'old-key',
      name: 'Old',
      environment: 'dev',
      isActive: true,
      project: { id: 'p-1' },
    };

    it('should update simple fields (name, environment, isActive)', async () => {
      const updated = { ...existing, name: 'Updated Key', isActive: false };

      mockSdkKeyRepository.findOne
        .mockResolvedValueOnce(existing) // findOneById
        .mockResolvedValueOnce(updated); // findOne at end
      mockSdkKeyRepository.save.mockResolvedValue(updated);

      const result = await service.update('key-1', {
        name: 'Updated Key',
        isActive: false,
      });
      expect(result.name).toBe('Updated Key');
      expect(result.isActive).toBe(false);
    });

    it('should update projectId after verifying project exists', async () => {
      const newProject = { id: 'p-2', name: 'New Project' };
      const updated = { ...existing, project: newProject, projectId: 'p-2' };

      mockSdkKeyRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockProjectRepository.findOne.mockResolvedValue(newProject);
      mockSdkKeyRepository.save.mockResolvedValue(updated);

      const result = await service.update('key-1', { projectId: 'p-2' });
      expect(result.project.id).toBe('p-2');
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new projectId does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValueOnce(existing);
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('key-1', { projectId: 'bad-proj' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the SDK key and return confirmation', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue({
        id: 'key-1',
        key: 'abc',
      });
      mockSdkKeyRepository.remove.mockResolvedValue({});

      const result = await service.remove('key-1');
      expect(result).toEqual({ message: 'SDK key key-1 has been deleted' });
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
