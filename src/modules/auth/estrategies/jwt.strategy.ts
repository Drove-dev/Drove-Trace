import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

interface UserWithRole {
  id: string;
  email: string;
  role: {
    id: string;
    role: string;
  }[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { id: string }): Promise<UserWithRole> {
    const { id } = payload;

    // const user = await this.userRepository.findOneBy({ id });
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['team_members', 'team_members.role'],
    });

    if (!user) throw new UnauthorizedException('Token not valid');

    return {
      id: user.id,
      email: user.email,
      role: user.team_members.map((team_member) => {
        return {
          id: team_member.id,
          role: team_member.role.name,
        };
      }),
    };
  }
}
