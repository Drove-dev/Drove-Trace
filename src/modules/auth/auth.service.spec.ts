import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
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
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── login ─────────────────────────────────────────────────
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
