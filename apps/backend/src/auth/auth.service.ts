import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register() {
    return { message: 'register — coming next' };
  }

  async login() {
    return { message: 'login — coming next' };
  }
}
