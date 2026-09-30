import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { CreateRoadmapDto, CreateStepDto, UpdateProgressDto } from './dto/roadmap.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmaps: RoadmapsService) {}

  @Get()
  list(@Query('goalType') goalType?: string) {
    return this.roadmaps.list(goalType);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateRoadmapDto) {
    return this.roadmaps.create(user.id, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.roadmaps.detail(id);
  }

  @Post(':id/steps')
  @UseGuards(JwtAuthGuard)
  addStep(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() dto: CreateStepDto) {
    return this.roadmaps.addStep(id, user.id, dto);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roadmaps.follow(user.id, id);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roadmaps.unfollow(user.id, id);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  progress(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProgressDto,
  ) {
    return this.roadmaps.updateProgress(user.id, id, dto.currentStep, dto.visibleToOthers);
  }

  @Get(':id/followers')
  followers(@Param('id') id: string) {
    return this.roadmaps.followers(id);
  }
}
