import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AiProviderService, AiMode } from './ai-provider.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly provider: AiProviderService,
  ) {}

  async chat(userId: string, dto: ChatDto) {
    let conversationId = dto.conversationId;
    if (!conversationId) {
      const conv = await this.prisma.aIConversation.create({
        data: {
          userId,
          problemId: dto.problemId,
          mode: dto.mode,
          title: dto.message.slice(0, 60),
        },
      });
      conversationId = conv.id;
    } else {
      const existing = await this.prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!existing) throw new NotFoundException('Conversation not found');
    }

    await this.prisma.aIMessage.create({
      data: { conversationId, role: 'user', content: dto.message },
    });

    let problemTitle: string | undefined;
    if (dto.problemId) {
      const p = await this.prisma.problem.findUnique({ where: { id: dto.problemId } });
      problemTitle = p?.title;
    }

    const reply = await this.provider.generate(dto.mode as AiMode, dto.message, {
      problemTitle,
      code: dto.code,
    });

    const assistant = await this.prisma.aIMessage.create({
      data: { conversationId, role: 'assistant', content: reply },
    });

    return { conversationId, reply: assistant.content };
  }

  list(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { _count: { select: { messages: true } } } as never,
    });
  }

  detail(userId: string, id: string) {
    return this.prisma.aIConversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
