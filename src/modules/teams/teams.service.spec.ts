import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';

const mockTeamRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: mockTeamRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  // CreateTeamDto: name (required, 2-255 chars), ownerId (required, UUID)
  describe('create()', () => {
    const createDto = { name: 'Dev Team', ownerId: 'owner-uuid' };
    const owner = { id: 'owner-uuid', email: 'owner@mail.com', name: 'Owner' };

    it('should create and return the team with owner relation', async () => {
      const savedTeam = {
        id: 'team-1',
        name: createDto.name,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(owner);
      mockTeamRepository.findOne
        .mockResolvedValueOnce(null) // no duplicate name+owner
        .mockResolvedValueOnce(savedTeam); // findOne after save

      mockTeamRepository.create.mockReturnValue({
        name: createDto.name,
        owner,
      });
      mockTeamRepository.save.mockResolvedValue(savedTeam);

      const result = await service.create(createDto);

      expect(result).toEqual(savedTeam);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'owner-uuid' },
      });
    });

    it('should throw NotFoundException if ownerId does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if team name + owner combination already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(owner);
      mockTeamRepository.findOne.mockResolvedValue({
        id: 'existing',
        name: createDto.name,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of teams with owner relation', async () => {
      const teams = [
        {
          id: '1',
          name: 'Team A',
          owner: { id: 'o-1', email: 'o@b.com', name: 'O' },
        },
      ];
      mockTeamRepository.find.mockResolvedValue(teams);

      expect(await service.findAll()).toEqual(teams);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a team by id', async () => {
      const team = { id: 'team-1', name: 'Dev', owner: { id: 'o-1' } };
      mockTeamRepository.findOne.mockResolvedValue(team);

      expect(await service.findOne('team-1')).toEqual(team);
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateTeamDto: PartialType(CreateTeamDto) → name?, ownerId?
  describe('update()', () => {
    const existing = { id: 'team-1', name: 'Old Name', owner: { id: 'o-1' } };

    it('should update the team name', async () => {
      const updated = { ...existing, name: 'New Name' };
      mockTeamRepository.findOne
        .mockResolvedValueOnce(existing) // findOneEntity
        .mockResolvedValueOnce(updated); // findOne at end
      mockTeamRepository.save.mockResolvedValue(updated);

      const result = await service.update('team-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should update the ownerId after verifying user exists', async () => {
      const newOwner = { id: 'o-2', name: 'New Owner' };
      const updated = { ...existing, owner: newOwner };

      mockTeamRepository.findOne
        .mockResolvedValueOnce(existing) // findOneEntity
        .mockResolvedValueOnce(updated); // findOne at end
      mockUserRepository.findOne.mockResolvedValue(newOwner);
      mockTeamRepository.save.mockResolvedValue(updated);

      const result = await service.update('team-1', { ownerId: 'o-2' });
      expect(result.owner.id).toBe('o-2');
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new ownerId does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValueOnce(existing);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('team-1', { ownerId: 'bad-owner' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the team and return confirmation', async () => {
      mockTeamRepository.findOne.mockResolvedValue({
        id: 'team-1',
        name: 'Dev',
      });
      mockTeamRepository.remove.mockResolvedValue({});

      const result = await service.remove('team-1');
      expect(result).toEqual({ message: 'Team team-1 has been deleted' });
    });

    it('should throw NotFoundException if team does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
