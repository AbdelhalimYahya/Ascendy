import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePostDto } from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  createPost(authorId: string, problemId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId,
        problemId,
        title: dto.title,
        content: dto.content,
        codeSnippet: dto.codeSnippet,
      },
      include: { author: { select: { username: true } } },
    });
  }

  async problemPosts(problemId: string, sort: string = 'top') {
    const posts = await this.prisma.post.findMany({
      where: { problemId },
      include: {
        author: { select: { username: true } },
        votes: true,
        _count: { select: { comments: true } },
      },
    });
    const withScore = posts.map((p) => ({
      ...p,
      score: p.votes.reduce((s, v) => s + v.value, 0),
    }));
    if (sort === 'new') withScore.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else withScore.sort((a, b) => b.score - a.score || +new Date(b.createdAt) - +new Date(a.createdAt));
    return withScore;
  }

  async postDetail(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        votes: true,
        comments: {
          include: { author: { select: { username: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return { ...post, score: post.votes.reduce((s, v) => s + v.value, 0) };
  }

  comment(postId: string, authorId: string, content: string) {
    return this.prisma.comment.create({
      data: { postId, authorId, content },
      include: { author: { select: { username: true } } },
    });
  }

  comments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async vote(postId: string, userId: string, value: number) {
    const existing = await this.prisma.vote.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (existing && existing.value === value) {
      await this.prisma.vote.delete({ where: { id: existing.id } });
      return { toggled: true, score: await this.score(postId) };
    }
    await this.prisma.vote.upsert({
      where: { postId_userId: { postId, userId } },
      update: { value },
      create: { postId, userId, value },
    });
    return { toggled: false, score: await this.score(postId) };
  }

  private async score(postId: string) {
    const votes = await this.prisma.vote.findMany({ where: { postId } });
    return votes.reduce((s, v) => s + v.value, 0);
  }
}
