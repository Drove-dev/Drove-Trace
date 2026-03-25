import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { TeamMember } from './entities/team-member.entity';
import { Team } from '../teams/entities/team.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

const mockTeamMemberRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockTeamRepository = {
  findOne: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

const mockRoleRepository = {
  findOne: jest.fn(),
};

const mockPagination = { page: 1, limit: 15 };

describe('TeamMembersService', () => {
  let service: TeamMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamMembersService,
        {
          provide: getRepositoryToken(TeamMember),
          useValue: mockTeamMemberRepository,
        },
        { provide: getRepositoryToken(Team), useValue: mockTeamRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<TeamMembersService>(TeamMembersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  describe('create()', () => {
    const createDto = {
      teamId: 'team-uuid',
      userId: 'user-uuid',
      roleId: 'role-uuid',
    };
    const team = { id: 'team-uuid', name: 'Dev' };
    const user = { id: 'user-uuid', email: 'a@b.com', name: 'Alice' };

    it('should create a team member linking team, user, and role', async () => {
      const saved = { id: 'tm-1', team, user, role: { id: 'role-uuid' } };

      mockTeamRepository.findOne.mockResolvedValue(team);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockTeamMemberRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(saved);
      mockTeamMemberRepository.create.mockReturnValue(saved);
      mockTeamMemberRepository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockTeamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'team-uuid' },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
    });

    it('should throw NotFoundException if teamId does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if userId does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(team);
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockTeamRepository.findOne.mockResolvedValue(team);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockTeamMemberRepository.findOne.mockResolvedValue({ id: 'tm-existing' });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'User is already a member of this team',
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return paginated team members', async () => {
      const mockQB = {
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockTeamMemberRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll(mockPagination);

      expect(result).toMatchObject({ data: [], total: 0, page: 1, limit: 15 });
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a team member by id', async () => {
      const member = {
        id: 'tm-1',
        team: { name: 'Dev' },
        user: { name: 'A' },
        role: { id: 'r-1' },
      };
      mockTeamMemberRepository.findOne.mockResolvedValue(member);

      const result = await service.findOne('tm-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  describe('update()', () => {
    const existing = {
      id: 'tm-1',
      team: { id: 'team-1' },
      user: { id: 'user-1' },
      role: { id: 'role-1' },
    };

    it('should update userId and roleId', async () => {
      const newUser = { id: 'user-2', name: 'Bob' };
      const newRole = { id: 'role-2', name: 'viewer' };
      const updated = { ...existing, user: newUser, role: newRole };

      mockTeamMemberRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockUserRepository.findOne.mockResolvedValue(newUser);
      mockRoleRepository.findOne.mockResolvedValue(newRole);
      mockTeamMemberRepository.save.mockResolvedValue(updated);

      const result = await service.update('tm-1', {
        userId: 'user-2',
        roleId: 'role-2',
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { userId: 'x', roleId: 'y' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if new userId does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValueOnce(existing);
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('tm-1', { userId: 'bad', roleId: 'role-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if new roleId does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValueOnce(existing);
      mockUserRepository.findOne.mockResolvedValue({ id: 'user-1' });
      mockRoleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('tm-1', { userId: 'user-1', roleId: 'bad' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the team member without errors', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue({ id: 'tm-1' });
      mockTeamMemberRepository.remove.mockResolvedValue({});

      await expect(service.remove('tm-1')).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
