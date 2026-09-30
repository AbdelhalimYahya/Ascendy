import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      // DB may not be up during early setup — API still boots, Prisma connects lazily per request.
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
