import { Controller, Post, Body, HttpStatus, HttpCode, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { IsPublic } from './decorators/is-public/is-public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import type { UserWithRole } from './interfaces';
import { MeResponseDto } from './dto/me-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }


  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: UserWithRole): Promise<MeResponseDto> {
    return this.authService.getMe(user.id);
  }
}
