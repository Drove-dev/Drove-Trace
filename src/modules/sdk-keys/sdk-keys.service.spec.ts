import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SdkKeysService } from './sdk-keys.service';
import { SdkKey } from './entities/sdk-key.entity';

const mockSdkKeyRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  findAndCount: jest.fn(),
};

describe('SdkKeysService', () => {
  let service: SdkKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SdkKeysService,
        {
          provide: getRepositoryToken(SdkKey),
          useValue: mockSdkKeyRepository,
        },
      ],
    }).compile();

    service = module.get<SdkKeysService>(SdkKeysService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return paginated SDK keys', async () => {
      const keys = [{ id: '1', key: 'abc', project: { id: 'p-1' } }];
      mockSdkKeyRepository.findAndCount.mockResolvedValue([keys, 1]);

      const result = await service.findAll({ page: 1, limit: 15 });

      expect(result).toMatchObject({ total: 1, page: 1, limit: 15 });
      expect(result.data).toBeDefined();
    });

    it('should return empty when no SDK keys exist', async () => {
      mockSdkKeyRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 15 });

      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return an SDK key by id', async () => {
      const sdkKey = { id: 'key-1', key: 'abc', project: { id: 'p-1' } };
      mockSdkKeyRepository.findOne.mockResolvedValue(sdkKey);

      const result = await service.findOne('key-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findOneByKey ──────────────────────────────────────────
  describe('findOneByKey()', () => {
    it('should return an SDK key by its key string', async () => {
      const sdkKey = {
        id: 'key-1',
        key: 'sdk-key-12345',
        project: { id: 'proj-1' },
      };
      mockSdkKeyRepository.findOne.mockResolvedValue(sdkKey);

      const result = await service.findOneByKey('sdk-key-12345');

      expect(result).toEqual(sdkKey);
      expect(mockSdkKeyRepository.findOne).toHaveBeenCalledWith({
        where: { key: 'sdk-key-12345' },
        relations: ['project'],
      });
    });

    it('should throw NotFoundException if key string does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneByKey('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update()', () => {
    const existing = {
      id: 'key-1',
      key: 'old-key',
      name: 'Old',
      environment: 'dev',
      isActive: true,
      project: { id: 'p-1' },
    };

    it('should update isActive field', async () => {
      const updated = { ...existing, isActive: false };

      mockSdkKeyRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockSdkKeyRepository.save.mockResolvedValue(updated);

      const result = await service.update('key-1', { isActive: false });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('bad-id', { isActive: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the SDK key without errors', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue({
        id: 'key-1',
        key: 'abc',
      });
      mockSdkKeyRepository.remove.mockResolvedValue({});

      await expect(service.remove('key-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if SDK key does not exist', async () => {
      mockSdkKeyRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
