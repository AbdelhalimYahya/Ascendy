import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  findAll() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }
}
