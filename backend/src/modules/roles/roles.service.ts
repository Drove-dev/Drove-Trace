import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (role) {
      throw new BadRequestException(
        `Role with name ${createRoleDto.name} already exists`,
      );
    }
    return await this.roleRepository.save(createRoleDto);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find();
    return plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    await this.roleRepository.delete(id);
    return { message: `Role ${id} has been deleted` };
  }
}
