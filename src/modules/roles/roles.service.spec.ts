import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

const mockRoleRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────────────────
  // CreateRoleDto: name (required, enum: admin|developer|viewer), description? (string), isActive (boolean)
  describe('create()', () => {
    const createDto = {
      name: 'admin' as const,
      description: 'Administrator role',
      isActive: true,
    };

    it('should save and return the new role', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);
      mockRoleRepository.save.mockResolvedValue({ id: 'uuid-1', ...createDto });

      const result = await service.create(createDto);

      expect(result).toEqual({ id: 'uuid-1', ...createDto });
      expect(mockRoleRepository.save).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException if role name already exists', async () => {
      mockRoleRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        name: 'admin',
      });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRoleRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────
  describe('findAll()', () => {
    it('should return an array of roles', async () => {
      const roles = [
        { id: '1', name: 'admin', isActive: true },
        { id: '2', name: 'viewer', isActive: true },
      ];
      mockRoleRepository.find.mockResolvedValue(roles);

      expect(await service.findAll()).toEqual(roles);
    });
  });

  // ── findOne ───────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return a role by id', async () => {
      const role = { id: 'uuid-1', name: 'admin', isActive: true };
      mockRoleRepository.findOne.mockResolvedValue(role);

      expect(await service.findOne('uuid-1')).toEqual(role);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ────────────────────────────────────────────────
  // UpdateRoleDto: PartialType(CreateRoleDto) → name?, description?, isActive?
  describe('update()', () => {
    it('should update and return the role', async () => {
      const existing = { id: 'uuid-1', name: 'admin', isActive: true };
      const updated = { ...existing, description: 'Updated desc' };

      mockRoleRepository.findOne
        .mockResolvedValueOnce(existing) // findOne in update
        .mockResolvedValueOnce(updated); // findOne at end

      mockRoleRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('uuid-1', {
        description: 'Updated desc',
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('bad-id', { description: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ────────────────────────────────────────────────
  describe('remove()', () => {
    it('should delete the role and return confirmation', async () => {
      mockRoleRepository.findOne.mockResolvedValue({
        id: 'uuid-1',
        name: 'admin',
      });
      mockRoleRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('uuid-1');
      expect(result).toEqual({ message: 'Role uuid-1 has been deleted' });
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
