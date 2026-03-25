import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  describe('create()', () => {
    const createDto = {
      email: 'john@example.com',
      password: 'Secure123',
      name: 'John Doe',
    };

    it('should hash the password, save the user, and return { name, email }', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockReturnValue({
        email: createDto.email,
        name: createDto.name,
        passwordHash: 'hashed-password',
      });
      mockUserRepository.save.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('Secure123', 'mock-salt');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: createDto.email,
        name: createDto.name,
        passwordHash: 'hashed-password',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ name: 'John Doe', email: 'john@example.com' });
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-uuid' });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Email already registered',
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return paginated users', async () => {
      const users = [
        {
          id: 'uuid-1',
          email: 'a@b.com',
          name: 'Alice',
          createdAt: new Date(),
        },
      ];
      mockUserRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll({ page: 1, limit: 15 });

      expect(result).toMatchObject({ total: 1, page: 1, limit: 15 });
      expect(result.data).toBeDefined();
    });

    it('should return empty when no users exist', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 15 });

      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'uuid-1',
        email: 'a@b.com',
        name: 'Alice',
        createdAt: new Date(),
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('uuid-1');

      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('bad-id')).rejects.toThrow(
        'User with id bad-id not found',
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update()', () => {
    const existingUser = {
      id: 'uuid-1',
      email: 'old@mail.com',
      name: 'Old Name',
      createdAt: new Date(),
    };

    it('should update the name and return UserResponseDto', async () => {
      const updatedUser = { ...existingUser, name: 'New Name' };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-1', { name: 'New Name' });

      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the user and return a confirmation message', async () => {
      const user = { id: 'uuid-1', email: 'a@b.com', name: 'Alice' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.remove.mockResolvedValue(user);

      const result = await service.remove('uuid-1');

      expect(result).toEqual({ message: 'User uuid-1 has been deleted' });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
