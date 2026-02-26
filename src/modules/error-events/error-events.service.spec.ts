import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ErrorEventsService } from './error-events.service';
import { ErrorEvent } from './entities/error-event.entity';
import { SdkKeysService } from '../sdk-keys/sdk-keys.service';
import { ErrorGroupsService } from '../error-groups/error-groups.service';

const mockErrorEventRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockSdkKeysService = {
  findOneBykey: jest.fn(),
};

const mockErrorGroupsService = {
  findByFingerprint: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('ErrorEventsService', () => {
  let service: ErrorEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorEventsService,
        {
          provide: getRepositoryToken(ErrorEvent),
          useValue: mockErrorEventRepository,
        },
        { provide: SdkKeysService, useValue: mockSdkKeysService },
        { provide: ErrorGroupsService, useValue: mockErrorGroupsService },
      ],
    }).compile();

    service = module.get<ErrorEventsService>(ErrorEventsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  // CreateErrorEventDto required: sdkKey, fingerprint, message, stackTrace, file, line, browser, os, environment
  //                     optional: url?, release?, sessionId?, userId?, metadata?
  describe('create()', () => {
    const createDto = {
      sdkKey: 'sdk-key-abc',
      fingerprint: 'fp-123',
      message: 'Cannot read properties of undefined',
      stackTrace: 'Error at app.component.ts:10',
      file: 'app.component.ts',
      line: 10,
      browser: 'Chrome',
      os: 'macOS',
      environment: 'production',
    };

    it('should validate the SDK key, create the event, and trigger error grouping', async () => {
      const sdkEntity = {
        id: 'key-1',
        key: 'sdk-key-abc',
        project: { id: 'proj-1' },
      };
      const savedEvent = { id: 'evt-1', ...createDto, metadata: {} };

      mockSdkKeysService.findOneBykey.mockResolvedValue(sdkEntity);
      mockErrorGroupsService.findByFingerprint.mockResolvedValue(null);
      mockErrorGroupsService.create.mockResolvedValue({});
      mockErrorEventRepository.create.mockReturnValue(savedEvent);
      mockErrorEventRepository.save.mockResolvedValue(savedEvent);

      const result = await service.create(createDto);

      expect(result).toEqual(savedEvent);
      expect(mockSdkKeysService.findOneBykey).toHaveBeenCalledWith(
        'sdk-key-abc',
      );
    });

    it('should create with optional fields when provided', async () => {
      const dtoWithOptionals = {
        ...createDto,
        url: 'https://myapp.com/home',
        release: '1.2.0',
        sessionId: 'session-abc',
        userId: 'user-xyz',
        metadata: { feature: 'checkout' },
      };
      const sdkEntity = {
        id: 'key-1',
        key: 'sdk-key-abc',
        project: { id: 'proj-1' },
      };
      const savedEvent = { id: 'evt-2', ...dtoWithOptionals };

      mockSdkKeysService.findOneBykey.mockResolvedValue(sdkEntity);
      mockErrorGroupsService.findByFingerprint.mockResolvedValue(null);
      mockErrorEventRepository.create.mockReturnValue(savedEvent);
      mockErrorEventRepository.save.mockResolvedValue(savedEvent);

      const result = await service.create(dtoWithOptionals);

      expect(result.url).toBe('https://myapp.com/home');
      expect(result.metadata).toEqual({ feature: 'checkout' });
    });

    it('should throw BadRequestException if SDK key is invalid', async () => {
      mockSdkKeysService.findOneBykey.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Invalid SDK key',
      );
      expect(mockErrorEventRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── findOrCreateErrorGroup ────────────────────────────────
  describe('findOrCreateErrorGroup()', () => {
    it('should increment occurrences if fingerprint already exists', async () => {
      const existingGroup = {
        id: 'eg-1',
        fingerprint: 'fp-123',
        occurrences: 3,
      };

      mockErrorGroupsService.findByFingerprint.mockResolvedValue(existingGroup);
      mockErrorGroupsService.update.mockResolvedValue({});

      await service.findOrCreateErrorGroup('fp-123', 'sdk-key-abc');

      expect(mockErrorGroupsService.update).toHaveBeenCalledWith('eg-1', {
        lastSeen: expect.any(Date),
        occurrences: 4,
      });
      expect(mockErrorGroupsService.create).not.toHaveBeenCalled();
    });

    it('should create a new group if fingerprint does not exist', async () => {
      const sdkEntity = {
        id: 'key-1',
        key: 'sdk-key-abc',
        project: { id: 'proj-1' },
      };

      mockErrorGroupsService.findByFingerprint.mockResolvedValue(null);
      mockSdkKeysService.findOneBykey.mockResolvedValue(sdkEntity);
      mockErrorGroupsService.create.mockResolvedValue({});

      await service.findOrCreateErrorGroup('fp-new', 'sdk-key-abc');

      expect(mockErrorGroupsService.create).toHaveBeenCalledWith({
        fingerprint: 'fp-new',
        projectId: 'proj-1',
      });
      expect(mockErrorGroupsService.update).not.toHaveBeenCalled();
    });
  });
});
