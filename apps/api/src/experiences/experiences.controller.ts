import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Optional, Request,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { VoteExperienceDto } from './dto/vote-experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('experiences')
export class ExperiencesController {
  constructor(private experiences: ExperiencesService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    return this.experiences.findAll({ category, sort, search, page: page ? +page : 1 });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.experiences.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateExperienceDto) {
    return this.experiences.create(user.id, dto);
  }

  @Patch(':id/submit')
  @UseGuards(JwtAuthGuard)
  submit(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.experiences.submit(user.id, id);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: VoteExperienceDto,
  ) {
    return this.experiences.vote(user.id, id, dto);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  report(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: { reason: string; detail?: string },
  ) {
    return this.experiences.report(user.id, id, body.reason, body.detail);
  }
}
