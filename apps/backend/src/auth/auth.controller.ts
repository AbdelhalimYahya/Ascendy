import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() _body: Record<string, unknown>) {
    return this.auth.register();
  }

  @Post('login')
  login(@Body() _body: Record<string, unknown>) {
    return this.auth.login();
  }

  @Get('ping')
  ping() {
    return { module: 'auth', status: 'wired' };
  }
}
