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
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
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
  // CreateTeamMemberDto: teamId (required, UUID), userId (required, UUID), roleId (required, UUID)
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
        .mockResolvedValueOnce(null) // no existing member (duplicate check)
        .mockResolvedValueOnce(saved); // findOne after save
      mockTeamMemberRepository.create.mockReturnValue(saved);
      mockTeamMemberRepository.save.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
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

    it('should throw ConflictException if user is already a member with same team and role', async () => {
      mockTeamRepository.findOne.mockResolvedValue(team);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockTeamMemberRepository.findOne.mockResolvedValue({ id: 'tm-existing' }); // already exists

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
    it('should return an array of team members with relations', async () => {
      const members = [
        {
          id: '1',
          team: { id: 't-1', name: 'Dev' },
          user: { id: 'u-1', name: 'A' },
          role: { id: 'r-1' },
        },
      ];
      mockTeamMemberRepository.find.mockResolvedValue(members);

      expect(await service.findAll()).toEqual(members);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a team member by id', async () => {
      const member = { id: 'tm-1', team: { name: 'Dev' }, user: { name: 'A' } };
      mockTeamMemberRepository.findOne.mockResolvedValue(member);

      expect(await service.findOne('tm-1')).toEqual(member);
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateTeamMemberDto: PartialType → teamId?, userId?, roleId?
  describe('update()', () => {
    const existing = {
      id: 'tm-1',
      team: { id: 'team-1' },
      user: { id: 'user-1' },
      role: { id: 'role-1' },
    };

    it('should update the teamId after verifying team exists', async () => {
      const newTeam = { id: 'team-2', name: 'QA' };
      const updated = { ...existing, team: newTeam };

      mockTeamMemberRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockTeamRepository.findOne.mockResolvedValue(newTeam);
      mockTeamMemberRepository.save.mockResolvedValue(updated);

      const result = await service.update('tm-1', { teamId: 'team-2' });
      expect(result.team.id).toBe('team-2');
    });

    it('should update the userId after verifying user exists', async () => {
      const newUser = { id: 'user-2', name: 'Bob' };
      const updated = { ...existing, user: newUser };

      mockTeamMemberRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockUserRepository.findOne.mockResolvedValue(newUser);
      mockTeamMemberRepository.save.mockResolvedValue(updated);

      const result = await service.update('tm-1', { userId: 'user-2' });
      expect(result.user.id).toBe('user-2');
    });

    it('should update the roleId after verifying role exists', async () => {
      const newRole = { id: 'role-2', name: 'viewer' };
      const updated = { ...existing, role: newRole };

      mockTeamMemberRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockRoleRepository.findOne.mockResolvedValue(newRole);
      mockTeamMemberRepository.save.mockResolvedValue(updated);

      const result = await service.update('tm-1', { roleId: 'role-2' });
      expect(result.role.id).toBe('role-2');
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', { teamId: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new teamId does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValueOnce(existing);
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.update('tm-1', { teamId: 'bad' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new userId does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValueOnce(existing);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('tm-1', { userId: 'bad' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new roleId does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValueOnce(existing);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.update('tm-1', { roleId: 'bad' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the team member and return confirmation', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue({ id: 'tm-1' });
      mockTeamMemberRepository.remove.mockResolvedValue({});

      const result = await service.remove('tm-1');
      expect(result).toEqual({ message: 'Team member tm-1 has been deleted' });
    });

    it('should throw NotFoundException if team member does not exist', async () => {
      mockTeamMemberRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
