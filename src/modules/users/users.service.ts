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
import { paginate } from '../../common/helpers/paginate.helper';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

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

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { search } = paginationDto;
    const whereOptions: any = {};

    if (search) {
      whereOptions.name = ILike(`%${search}%`);
    }

    return await paginate(
      this.usersRepository,
      paginationDto,
      {
        where: whereOptions,
        order: { createdAt: 'DESC' },
      },
      UserResponseDto,
    );
  }

  private async findEntityById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.name = updateUserDto.name;

    const updatedUser = await this.usersRepository.save(user);

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findEntityById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.usersRepository.remove(user);
    return { message: `User ${id} has been deleted` };
  }
}
