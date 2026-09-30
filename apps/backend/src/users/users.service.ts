import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async publicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        languagePref: true,
        createdAt: true,
        _count: {
          select: {
            progressEntries: true,
            posts: true,
            roadmaps: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const solved = await this.prisma.progressEntry.count({
      where: { userId: user.id, status: 'Solved' },
    });

    // Hide competitive details if user disabled competitive mode — caller decides display,
    // but we always return counts; frontend hides rank when competitiveMode is false.
    const full = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { competitiveMode: true },
    });

    return { ...user, solvedCount: solved, competitiveMode: full?.competitiveMode ?? true };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.languagePref !== undefined ? { languagePref: dto.languagePref } : {}),
        ...(dto.competitiveMode !== undefined ? { competitiveMode: dto.competitiveMode } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatarUrl: true,
        languagePref: true,
        competitiveMode: true,
      },
    });
  }
}
