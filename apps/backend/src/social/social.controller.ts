import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto, CreateCommentDto, VoteDto } from './dto/social.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Post('problems/:problemId/posts')
  @UseGuards(JwtAuthGuard)
  createPost(
    @Param('problemId') problemId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePostDto,
  ) {
    return this.social.createPost(user.id, problemId, dto);
  }

  @Get('problems/:problemId/posts')
  problemPosts(@Param('problemId') problemId: string, @Query('sort') sort?: string) {
    return this.social.problemPosts(problemId, sort);
  }

  @Get('posts/:id')
  postDetail(@Param('id') id: string) {
    return this.social.postDetail(id);
  }

  @Get('posts/:postId/comments')
  comments(@Param('postId') postId: string) {
    return this.social.comments(postId);
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  comment(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.social.comment(postId, user.id, dto.content);
  }

  @Post('posts/:postId/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: VoteDto,
  ) {
    return this.social.vote(postId, user.id, dto.value);
  }
}
