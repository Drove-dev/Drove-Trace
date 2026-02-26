import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockUsersService = {
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create (register) ────────────────────────────────────
  // Delegates to UsersService.create() using CreateUserDto: email, password, name
  describe('create()', () => {
    const createDto = {
      email: 'test@mail.com',
      password: 'Secure123',
      name: 'Test User',
    };

    it('should delegate to UsersService.create() and return the result', async () => {
      const createdUser = { name: createDto.name, email: createDto.email };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.create(createDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
    });

    // Nota: create() no usa `await` en userService.create(),
    // por lo que el try/catch no atrapa errores async.
    // La excepción original se propaga directamente al caller.
    it('should propagate the original error if UsersService.create() fails', async () => {
      mockUsersService.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(createDto)).rejects.toThrow('DB error');
    });
  });

  // ── login ─────────────────────────────────────────────────
  // LoginDto: email (required), password (required)
  describe('login()', () => {
    const loginDto = { email: 'test@mail.com', password: 'Secure123' };

    it('should return user data + JWT token on valid credentials', async () => {
      const dbUser = {
        id: 'uuid-1',
        email: loginDto.email,
        name: 'Test',
        passwordHash: 'hashed',
      };
      mockUserRepository.findOne.mockResolvedValue(dbUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login(loginDto);

      expect(result.token).toBe('jwt-token-123');
      expect(result.id).toBe('uuid-1');
      expect(result.email).toBe(loginDto.email);
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: 'uuid-1' });
    });

    it('should throw UnauthorizedException if email does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credentials are not valid',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        email: loginDto.email,
        passwordHash: 'hashed',
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── checkAuthStatus ───────────────────────────────────────
  describe('checkAuthStatus()', () => {
    it('should return user data with a refreshed token', async () => {
      const user = { id: 'uuid-1', email: 'a@b.com', name: 'A' } as User;
      mockJwtService.sign.mockReturnValue('refreshed-token');

      const result = await service.checkAuthStatus(user);

      expect(result.token).toBe('refreshed-token');
      expect(result.id).toBe('uuid-1');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ id: 'uuid-1' });
    });
  });
});
