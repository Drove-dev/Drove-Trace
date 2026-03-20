import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Team } from '../teams/entities/team.entity';

const mockProjectRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockTeamRepository = {
  findOne: jest.fn(),
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        { provide: getRepositoryToken(Team), useValue: mockTeamRepository },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  // CreateProjectDto: name (required), teamId (required, UUID), environment (required, enum: dev|staging|production)
  describe('create()', () => {
    const createDto = {
      name: 'My App',
      teamId: 'team-uuid',
      environment: 'production' as const,
    };
    const team = { id: 'team-uuid', name: 'Dev Team' };

    it('should create the project linked to the team and return it', async () => {
      const saved = { id: 'proj-1', ...createDto, team };

      mockTeamRepository.findOne.mockResolvedValue(team);
      mockProjectRepository.create.mockReturnValue(saved);
      mockProjectRepository.save.mockResolvedValue(saved);
      mockProjectRepository.findOne.mockResolvedValue(saved);

      const result = await service.create(createDto);

      expect(result).toEqual(saved);
      expect(mockTeamRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'team-uuid' },
      });
    });

    it('should throw NotFoundException if teamId does not exist', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of projects with team relation', async () => {
      const projects = [
        { id: '1', name: 'App', team: { id: 't-1', name: 'Dev' } },
      ];
      mockProjectRepository.find.mockResolvedValue(projects);

      expect(await service.findAll()).toEqual(projects);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a project by id', async () => {
      const project = { id: 'proj-1', name: 'My App', team: { id: 't-1' } };
      mockProjectRepository.findOne.mockResolvedValue(project);

      expect(await service.findOne('proj-1')).toEqual(project);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateProjectDto: PartialType → name?, teamId?, environment?
  describe('update()', () => {
    const existing = {
      id: 'proj-1',
      name: 'Old',
      team: { id: 't-1' },
      environment: 'dev',
    };

    it('should update name and environment without touching team', async () => {
      const updated = { ...existing, name: 'New App', environment: 'staging' };

      mockProjectRepository.findOne
        .mockResolvedValueOnce(existing) // findOneEntity
        .mockResolvedValueOnce(updated); // findOne at end
      mockProjectRepository.save.mockResolvedValue(updated);

      const result = await service.update('proj-1', {
        name: 'New App',
        environment: 'staging' as const,
      });
      expect(result.name).toBe('New App');
      expect(result.environment).toBe('staging');
    });

    it('should update the teamId after verifying team exists', async () => {
      const newTeam = { id: 't-2', name: 'QA' };
      const updated = { ...existing, team: newTeam };

      mockProjectRepository.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockTeamRepository.findOne.mockResolvedValue(newTeam);
      mockProjectRepository.save.mockResolvedValue(updated);

      const result = await service.update('proj-1', { teamId: 't-2' });
      expect(result.team.id).toBe('t-2');
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);
      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new teamId does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValueOnce(existing);
      mockTeamRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('proj-1', { teamId: 'bad-team' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the project and return confirmation', async () => {
      mockProjectRepository.findOne.mockResolvedValue({
        id: 'proj-1',
        name: 'App',
      });
      mockProjectRepository.remove.mockResolvedValue({});

      const result = await service.remove('proj-1');
      expect(result).toEqual({ message: 'Project proj-1 has been deleted' });
    });

    it('should throw NotFoundException if project does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
