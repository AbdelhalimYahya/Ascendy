import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, dto: UpsertProgressDto) {
    const entry = await this.prisma.progressEntry.upsert({
      where: { userId_problemId: { userId, problemId: dto.problemId } },
      update: {
        status: dto.status,
        timeSpentMin: dto.timeSpentMin,
        language: dto.language,
        notes: dto.notes,
      },
      create: {
        userId,
        problemId: dto.problemId,
        status: dto.status,
        timeSpentMin: dto.timeSpentMin,
        language: dto.language,
        notes: dto.notes,
      },
    });
    await this.recomputeMastery(userId);
    return entry;
  }

  list(userId: string, status?: string) {
    return this.prisma.progressEntry.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { problem: { select: { id: true, title: true, slug: true, difficulty: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async stats(userId: string) {
    const entries = await this.prisma.progressEntry.findMany({ where: { userId } });
    const solved = entries.filter((e) => e.status === 'Solved');
    const byDifficulty: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const solvedWithProblem = await this.prisma.progressEntry.findMany({
      where: { userId, status: 'Solved' },
      include: { problem: { select: { difficulty: true } } },
    });
    solvedWithProblem.forEach((e) => {
      if (e.problem?.difficulty && e.problem.difficulty in byDifficulty) {
        byDifficulty[e.problem.difficulty]++;
      }
    });

    // Streak: distinct solved days, count back from today
    const days = new Set(solved.map((e) => dayKey(new Date(e.updatedAt))));
    let streak = 0;
    const cursor = new Date();
    // If today has no solve, streak can still continue from yesterday
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      totalAttempted: entries.length,
      solvedCount: solved.length,
      byDifficulty,
      streak,
    };
  }

  async speedTrends(userId: string) {
    const entries = await this.prisma.progressEntry.findMany({
      where: { userId, timeSpentMin: { not: null } },
      include: { problem: { select: { difficulty: true } } },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });
    const byDifficulty: Record<string, { count: number; totalMin: number; avgMin: number }> = {};
    entries.forEach((e) => {
      const d = e.problem?.difficulty ?? 'Unknown';
      byDifficulty[d] ??= { count: 0, totalMin: 0, avgMin: 0 };
      byDifficulty[d].count++;
      byDifficulty[d].totalMin += e.timeSpentMin ?? 0;
    });
    Object.values(byDifficulty).forEach((v) => {
      v.avgMin = v.count ? Math.round((v.totalMin / v.count) * 10) / 10 : 0;
    });
    return {
      points: entries.map((e) => ({
        date: e.updatedAt,
        difficulty: e.problem?.difficulty,
        timeSpentMin: e.timeSpentMin,
        status: e.status,
      })),
      byDifficulty,
    };
  }

  async mastery(userId: string) {
    await this.recomputeMastery(userId);
    const scores = await this.prisma.masteryScore.findMany({ where: { userId } });
    const tags = await this.prisma.tag.findMany();
    const map = new Map(scores.map((s) => [s.tagId, s.score]));
    return tags.map((t) => ({
      tagId: t.id,
      tag: t.name,
      score: Math.round((map.get(t.id) ?? 0) * 10) / 10,
    }));
  }

  async recomputeMastery(userId: string) {
    const tags = await this.prisma.tag.findMany({ include: { problems: true } });
    for (const tag of tags) {
      const problemIds = tag.problems.map((p) => p.problemId);
      if (!problemIds.length) continue;
      const total = problemIds.length;
      const solvedEntries = await this.prisma.progressEntry.findMany({
        where: { userId, problemId: { in: problemIds }, status: 'Solved' },
        orderBy: { updatedAt: 'desc' },
      });
      const solved = solvedEntries.length;
      const base = total ? (solved / total) * 80 : 0;
      let recency = 0;
      if (solvedEntries[0]) {
        const daysAgo =
          (Date.now() - new Date(solvedEntries[0].updatedAt).getTime()) / 86400000;
        if (daysAgo <= 7) recency = 12;
        else if (daysAgo <= 30) recency = 6;
      }
      const consistency = Math.min(8, solved * 2);
      const score = Math.min(100, base + recency + consistency);
      const existing = await this.prisma.masteryScore.findUnique({
        where: { userId_tagId: { userId, tagId: tag.id } },
      });
      if (existing) {
        await this.prisma.masteryScore.update({
          where: { id: existing.id },
          data: { score },
        });
      } else {
        await this.prisma.masteryScore.create({ data: { userId, tagId: tag.id, score } });
      }
    }
  }
}
