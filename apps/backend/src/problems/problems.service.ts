import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { QueryProblemsDto } from './dto/query-problems.dto';
import { paginate } from '../common/pagination';

function slugify(title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'problem';
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProblemDto) {
    const slug = slugify(dto.title);
    return this.prisma.problem.create({
      data: {
        title: dto.title,
        slug,
        statement: dto.statement,
        difficulty: dto.difficulty,
        starterCode: dto.starterCode ?? {},
        sourceUrl: dto.sourceUrl,
        sourcePlatform: dto.sourcePlatform ?? 'Custom',
        tags: dto.tags?.length
          ? {
              create: dto.tags.map((name) => ({
                tag: { connectOrCreate: { where: { name }, create: { name } } },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async findAll(q: QueryProblemsDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 12, 50);
    const where: Record<string, unknown> = {};
    if (q.difficulty) (where as { difficulty: string }).difficulty = q.difficulty;
    if (q.sourcePlatform) (where as { sourcePlatform: string }).sourcePlatform = q.sourcePlatform;
    if (q.search) {
      (where as { OR: unknown[] }).OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { statement: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.tag) {
      (where as { tags: unknown }).tags = { some: { tag: { name: q.tag } } };
    }
    const [total, items] = await Promise.all([
      this.prisma.problem.count({ where: where as never }),
      this.prisma.problem.findMany({
        where: where as never,
        include: { tags: { include: { tag: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return paginate(total, page, limit, items);
  }

  // Problems similar to ones I failed (Attempted but not Solved) — tag overlap
  async failedSimilar(userId: string, limit = 10) {
    const failed = await this.prisma.progressEntry.findMany({
      where: { userId, status: 'Attempted' },
      include: { problem: { include: { tags: true } } },
      take: 20,
    });
    const tagIds = [...new Set(failed.flatMap((f) => f.problem?.tags.map((t) => t.tagId) ?? []))];
    if (!tagIds.length) return [];
    const failedIds = failed.map((f) => f.problemId);
    const candidates = await this.prisma.problem.findMany({
      where: { id: { notIn: failedIds }, tags: { some: { tagId: { in: tagIds } } } },
      include: { tags: { include: { tag: true } } },
      take: 30,
    });
    return candidates
      .map((c) => ({ ...c, shared: c.tags.filter((t) => tagIds.includes(t.tagId)).length }))
      .sort((a, b) => b.shared - a.shared)
      .slice(0, limit);
  }

  async findBySlug(slug: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: { include: { tag: true } },
        testCases: { where: { isSample: true } },
        linksFrom: { include: { toProblem: { select: { id: true, title: true, slug: true, sourcePlatform: true } } } },
        linksTo: { include: { fromProblem: { select: { id: true, title: true, slug: true, sourcePlatform: true } } } },
      },
    });
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  async update(id: string, dto: UpdateProblemDto) {
    const { tags, ...rest } = dto;
    return this.prisma.problem.update({
      where: { id },
      data: {
        ...rest,
        ...(tags
          ? {
              tags: {
                deleteMany: {},
                create: tags.map((name) => ({
                  tag: { connectOrCreate: { where: { name }, create: { name } } },
                })),
              },
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async remove(id: string) {
    await this.prisma.problem.delete({ where: { id } });
    return { deleted: true };
  }

  async addTestCase(problemId: string, dto: { input: string; expectedOutput: string; isSample?: boolean }) {
    await this.ensureProblem(problemId);
    return this.prisma.testCase.create({
      data: {
        problemId,
        input: dto.input,
        expectedOutput: dto.expectedOutput,
        isSample: dto.isSample ?? false,
      },
    });
  }

  async sampleTestCases(problemId: string) {
    await this.ensureProblem(problemId);
    return this.prisma.testCase.findMany({ where: { problemId, isSample: true } });
  }

  async allTestCases(problemId: string) {
    // Internal use (judging) — includes hidden
    return this.prisma.testCase.findMany({ where: { problemId } });
  }

  async addLink(fromProblemId: string, toProblemId: string, note?: string) {
    await this.ensureProblem(fromProblemId);
    await this.ensureProblem(toProblemId);
    return this.prisma.problemLink.upsert({
      where: { fromProblemId_toProblemId: { fromProblemId, toProblemId } },
      update: { note },
      create: { fromProblemId, toProblemId, note },
    });
  }

  async similar(problemId: string, limit = 6) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      include: { tags: true },
    });
    if (!problem) throw new NotFoundException('Problem not found');
    const tagIds = problem.tags.map((t) => t.tagId);
    if (!tagIds.length) return [];
    const candidates = await this.prisma.problem.findMany({
      where: { id: { not: problemId }, tags: { some: { tagId: { in: tagIds } } } },
      include: { tags: { include: { tag: true } } },
      take: 20,
    });
    return candidates
      .map((c) => ({
        ...c,
        shared: c.tags.filter((t) => tagIds.includes(t.tagId)).length,
      }))
      .sort((a, b) => b.shared - a.shared)
      .slice(0, limit);
  }

  private async ensureProblem(id: string) {
    const p = await this.prisma.problem.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Problem not found');
    return p;
  }
}
