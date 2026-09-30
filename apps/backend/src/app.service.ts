import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'Ascendy API — ready to climb 🏔️', version: '0.1.0' };
  }
}
