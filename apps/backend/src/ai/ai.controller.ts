import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  chat(@CurrentUser() user: { id: string }, @Body() dto: ChatDto) {
    return this.ai.chat(user.id, dto);
  }

  @Get('conversations')
  list(@CurrentUser() user: { id: string }) {
    return this.ai.list(user.id);
  }

  @Get('conversations/:id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ai.detail(user.id, id);
  }
}
