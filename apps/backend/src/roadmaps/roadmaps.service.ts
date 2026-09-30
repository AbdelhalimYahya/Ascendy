import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRoadmapDto, CreateStepDto } from './dto/roadmap.dto';

@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreateRoadmapDto) {
    return this.prisma.roadmap.create({
      data: {
        title: dto.title,
        description: dto.description,
        goalType: dto.goalType ?? 'custom',
        isPublic: dto.isPublic ?? true,
        authorId,
      },
    });
  }

  list(goalType?: string) {
    return this.prisma.roadmap.findMany({
      where: { isPublic: true, ...(goalType ? { goalType } : {}) },
      include: {
        author: { select: { username: true } },
        _count: { select: { steps: true, follows: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        steps: { orderBy: { order: 'asc' }, include: { problem: { select: { id: true, title: true, slug: true, difficulty: true } } } },
      },
    });
    if (!roadmap) throw new NotFoundException('Path not found');
    return roadmap;
  }

  async addStep(id: string, userId: string, dto: CreateStepDto) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap) throw new NotFoundException('Path not found');
    if (roadmap.authorId !== userId) throw new ForbiddenException('Only author can edit');
    return this.prisma.roadmapStep.create({
      data: {
        roadmapId: id,
        order: dto.order,
        title: dto.title,
        description: dto.description,
        problemId: dto.problemId,
      },
    });
  }

  follow(userId: string, roadmapId: string) {
    return this.prisma.roadmapFollow.upsert({
      where: { userId_roadmapId: { userId, roadmapId } },
      update: {},
      create: { userId, roadmapId },
    });
  }

  unfollow(userId: string, roadmapId: string) {
    return this.prisma.roadmapFollow.deleteMany({ where: { userId, roadmapId } });
  }

  updateProgress(userId: string, roadmapId: string, currentStep: number, visibleToOthers?: boolean) {
    return this.prisma.roadmapFollow.upsert({
      where: { userId_roadmapId: { userId, roadmapId } },
      update: {
        currentStep,
        ...(visibleToOthers !== undefined ? { visibleToOthers } : {}),
      },
      create: { userId, roadmapId, currentStep },
    });
  }

  followers(roadmapId: string) {
    return this.prisma.roadmapFollow.findMany({
      where: { roadmapId, visibleToOthers: true },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: { currentStep: 'desc' },
      take: 50,
    });
  }
}
