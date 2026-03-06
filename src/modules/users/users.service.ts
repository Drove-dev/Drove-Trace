import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination';

export interface UsersResponse {
  data: User[];
  total: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create new user
      const user = this.usersRepository.create({
        email,
        name,
        passwordHash,
      });

      await this.usersRepository.save(user);

      return { name, email };
    } catch (error) {
      throw new InternalServerErrorException('Error creating user, check logs');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<UsersResponse> {
    const { limit = 15, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      select: ['id', 'email', 'name', 'createdAt'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      // lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(search: string): Promise<User> {
    const whereOptions: any = {};

    if (search) {
      whereOptions.name = ILike(`%${search}%`);
    }

    const users = await this.usersRepository.find({
      where: whereOptions,
      select: ['id', 'email', 'name', 'createdAt'],
    });

    if (!users) {
      throw new NotFoundException(`User with name ${search} not found`);
    }

    return users as unknown as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If email is being updated, check for duplicates
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersRepository.remove(user);
    return { message: `User ${id} has been deleted` };
  }
}
