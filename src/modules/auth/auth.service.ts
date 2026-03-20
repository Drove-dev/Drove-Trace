import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { MeResponseDto } from './dto/me-response.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly userService: UsersService,

    private readonly jwtService: JwtService,
  
  ) {}
  
  async create( createUserDto: CreateUserDto ) {

    try {
      const user = this.userService.create(createUserDto);
      return user;

    } catch (error) {
      throw new InternalServerErrorException('Please check server logs')
    }
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, passwordHash: true, id: true, name: true }
    });

    if ( !user ) 
      throw new UnauthorizedException('Credentials are not valid'); // email
      
    if ( !bcrypt.compareSync( password, user.passwordHash ) )
      throw new UnauthorizedException('Credentials are not valid'); //password

    delete (user as Partial<User>).passwordHash;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }
  
  private getJwtToken(payload:any){
    const token = this.jwtService.sign( payload )
    return token;
  }

  async checkAuthStatus( user: User ){
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'team_members',
        'team_members.team',
        'team_members.role',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      teams: user.team_members.map(tm => ({
        teamId: tm.team.id,
        teamName: tm.team.name,
        role: tm.role.name,
      })),
    };

    return plainToInstance(MeResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

}
