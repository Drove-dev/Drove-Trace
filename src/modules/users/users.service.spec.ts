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
    it('should return an array of users with selected fields', async () => {
      const users = [
        {
          id: 'uuid-1',
          email: 'a@b.com',
          name: 'Alice',
          createdAt: new Date(),
        },
        { id: 'uuid-2', email: 'c@d.com', name: 'Bob', createdAt: new Date() },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'createdAt'],
      });
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

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: ['id', 'email', 'name', 'createdAt'],
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('bad-id')).rejects.toThrow(
        'User with ID bad-id not found',
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateUserDto only allows: email? and name? (no password update)
  describe('update()', () => {
    const existingUser = {
      id: 'uuid-1',
      email: 'old@mail.com',
      name: 'Old Name',
      createdAt: new Date(),
    };

    it('should update the name without checking for duplicate emails', async () => {
      const updatedUser = { ...existingUser, name: 'New Name' };
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-1', { name: 'New Name' });

      expect(result).toEqual(updatedUser);
      // findOne should be called only once (to get the user), no duplicate email check
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update the email after verifying it is not taken', async () => {
      const updatedUser = { ...existingUser, email: 'new@mail.com' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser) // findOne to get the user
        .mockResolvedValueOnce(null); // check for duplicate: no match

      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-1', { email: 'new@mail.com' });

      expect(result.email).toBe('new@mail.com');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException if the new email is already in use', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser) // findOne to get the user
        .mockResolvedValueOnce({ id: 'uuid-other', email: 'taken@mail.com' }); // duplicate found

      await expect(
        service.update('uuid-1', { email: 'taken@mail.com' }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update('uuid-1', { email: 'taken@mail.com' }),
      ).rejects.toThrow('Email already in use');
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
