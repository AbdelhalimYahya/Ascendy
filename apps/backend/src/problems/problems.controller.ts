import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { QueryProblemsDto } from './dto/query-problems.dto';
import { CreateTestCaseDto, CreateLinkDto } from './dto/testcase-link.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProblemDto) {
    return this.problems.create(dto);
  }

  @Get()
  findAll(@Query() q: QueryProblemsDto) {
    return this.problems.findAll(q);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.problems.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProblemDto) {
    return this.problems.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.problems.remove(id);
  }

  @Post(':id/testcases')
  @UseGuards(JwtAuthGuard)
  addTestCase(@Param('id') id: string, @Body() dto: CreateTestCaseDto) {
    return this.problems.addTestCase(id, dto);
  }

  @Get(':id/testcases')
  testcases(@Param('id') id: string) {
    return this.problems.sampleTestCases(id);
  }

  @Post(':id/links')
  @UseGuards(JwtAuthGuard)
  addLink(@Param('id') id: string, @Body() dto: CreateLinkDto) {
    return this.problems.addLink(id, dto.toProblemId, dto.note);
  }

  @Get(':id/similar')
  similar(@Param('id') id: string) {
    return this.problems.similar(id);
  }
}
