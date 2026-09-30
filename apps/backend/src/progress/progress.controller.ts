import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post()
  upsert(@CurrentUser() user: { id: string }, @Body() dto: UpsertProgressDto) {
    return this.progress.upsert(user.id, dto);
  }

  @Get('me')
  list(@CurrentUser() user: { id: string }, @Query('status') status?: string) {
    return this.progress.list(user.id, status);
  }

  @Get('stats/me')
  stats(@CurrentUser() user: { id: string }) {
    return this.progress.stats(user.id);
  }

  @Get('speed-trends/me')
  speed(@CurrentUser() user: { id: string }) {
    return this.progress.speedTrends(user.id);
  }

  @Get('mastery/me')
  mastery(@CurrentUser() user: { id: string }) {
    return this.progress.mastery(user.id);
  }
}
