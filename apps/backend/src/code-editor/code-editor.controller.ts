import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from './submissions.service';
import { RunCodeDto } from './dto/run-code.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('problems/:id')
@UseGuards(JwtAuthGuard)
export class CodeEditorController {
  constructor(private readonly subs: SubmissionsService) {}

  @Post('run')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  run(@Param('id') id: string, @Body() dto: RunCodeDto) {
    return this.subs.run(id, dto.code, dto.language);
  }

  @Post('submit')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  submit(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: RunCodeDto,
  ) {
    return this.subs.submit(user.id, id, dto.code, dto.language);
  }

  @Get('submissions/me')
  history(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.subs.history(user.id, id);
  }
}
