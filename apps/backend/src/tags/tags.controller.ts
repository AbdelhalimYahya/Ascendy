import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  findAll() {
    return this.tags.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: { name: string }) {
    return this.tags.create(body.name);
  }
}
