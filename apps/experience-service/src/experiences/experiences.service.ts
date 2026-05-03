import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { VoteExperienceDto } from './dto/vote-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(userId: string, dto: CreateExperienceDto) {
    const experience = await this.prisma.experience.create({
      data: {
        userId: BigInt(userId),
        ...dto,
        status: 'DRAFT',
      },
    });
    return { ...experience, id: experience.id.toString(), userId: experience.userId.toString() };
  }

  async submit(userId: string, experienceId: string) {
    const experience = await this.findOneOrThrow(experienceId);
    if (experience.userId.toString() !== userId) throw new ForbiddenException();
    if (experience.status !== 'DRAFT' && experience.status !== 'REJECTED') {
      throw new BadRequestException('제출할 수 없는 상태입니다.');
    }
    const proofCount = await this.prisma.experienceProof.count({ where: { experienceId: BigInt(experienceId) } });
    if (proofCount === 0) throw new BadRequestException('증빙 자료를 최소 1개 이상 첨부해주세요.');

    return this.prisma.experience.update({
      where: { id: BigInt(experienceId) },
      data: { status: 'PENDING' },
    });
  }

  async findAll(query: { category?: string; sort?: string; search?: string; page?: number }) {
    const { category, sort = 'latest', search, page = 1 } = query;
    const take = 20;
    const skip = (page - 1) * take;

    const where: any = { status: 'APPROVED' };
    if (category) where.category = category;
    if (search) where.title = { contains: search };

    const orderBy: any =
      sort === 'grade' ? { grade: 'asc' } :
      sort === 'popular' ? { viewCount: 'desc' } :
      { createdAt: 'desc' };

    const [experiences, total] = await Promise.all([
      this.prisma.experience.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          grade: true,
          viewCount: true,
          createdAt: true,
          user: { select: { nickname: true } },
          _count: { select: { votes: true } },
        },
      }),
      this.prisma.experience.count({ where }),
    ]);

    return {
      data: experiences.map((e) => ({ ...e, id: e.id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(experienceId: string, userId?: string) {
    const experience = await this.prisma.experience.findUnique({
      where: { id: BigInt(experienceId) },
      include: {
        user: { select: { id: true, nickname: true, jobCategory: true } },
        experienceGrade: true,
        _count: { select: { votes: true } },
        premiumContent: userId
          ? {
              select: {
                id: true,
                preview: true,
                price: true,
                purchases: { where: { userId: BigInt(userId) }, select: { id: true } },
              },
            }
          : { select: { id: true, preview: true, price: true } },
      },
    });

    if (!experience || (experience.status !== 'APPROVED' && experience.userId.toString() !== userId)) {
      throw new NotFoundException('경험을 찾을 수 없습니다.');
    }

    // 조회수 증가 (Redis counter)
    await this.redis.incr(`view_count:${experienceId}`);

    return {
      ...experience,
      id: experience.id.toString(),
      userId: experience.userId.toString(),
    };
  }

  async vote(userId: string, experienceId: string, dto: VoteExperienceDto) {
    const experience = await this.findOneOrThrow(experienceId);
    if (experience.status !== 'APPROVED') throw new BadRequestException('승인된 경험에만 평가할 수 있습니다.');
    if (experience.userId.toString() === userId) throw new ForbiddenException('본인 경험은 평가할 수 없습니다.');

    await this.prisma.vote.upsert({
      where: { experienceId_voterId: { experienceId: BigInt(experienceId), voterId: BigInt(userId) } },
      create: { experienceId: BigInt(experienceId), voterId: BigInt(userId), ...dto },
      update: { ...dto },
    });

    await this.updateExperienceGrade(experienceId);
  }

  async report(reporterId: string, experienceId: string, reason: string, detail?: string) {
    const existing = await this.prisma.report.findUnique({
      where: { reporterId_experienceId: { reporterId: BigInt(reporterId), experienceId: BigInt(experienceId) } },
    });
    if (existing) throw new ConflictException('이미 신고한 경험입니다.');

    return this.prisma.report.create({
      data: {
        reporterId: BigInt(reporterId),
        experienceId: BigInt(experienceId),
        reason: reason as any,
        detail,
      },
    });
  }

  private async updateExperienceGrade(experienceId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { experienceId: BigInt(experienceId) },
      select: { difficulty: true, impact: true, workValue: true, authenticity: true },
    });

    if (votes.length === 0) return;

    const avg = (field: keyof typeof votes[0]) =>
      votes.reduce((s, v) => s + Number(v[field]), 0) / votes.length;

    const grade = Number(
      ((avg('difficulty') + avg('impact') + avg('workValue') + avg('authenticity')) / 4).toFixed(1),
    );

    await this.prisma.experienceGrade.upsert({
      where: { experienceId: BigInt(experienceId) },
      create: { experienceId: BigInt(experienceId), grade, voteCount: votes.length },
      update: { grade, voteCount: votes.length },
    });

    await this.prisma.experience.update({
      where: { id: BigInt(experienceId) },
      data: { grade },
    });

    const experience = await this.prisma.experience.findUnique({
      where: { id: BigInt(experienceId) },
      select: { userId: true },
    });
    if (experience) await this.recalculateUserGrade(experience.userId.toString());
  }

  private async recalculateUserGrade(userId: string) {
    const grades = await this.prisma.experienceGrade.findMany({
      where: { experience: { userId: BigInt(userId), status: 'APPROVED' } },
      select: { grade: true },
      orderBy: { grade: 'asc' },
      take: 100,
    });

    const totalScore = grades.reduce((sum, e) => sum + (10 - Number(e.grade)), 0);
    const count = await this.prisma.experience.count({
      where: { userId: BigInt(userId), status: 'APPROVED' },
    });

    await this.prisma.userGrade.upsert({
      where: { userId: BigInt(userId) },
      create: { userId: BigInt(userId), totalScore, experienceCount: count },
      update: { totalScore, experienceCount: count },
    });

    await this.redis.del(`user_grade:${userId}`);
  }

  private async findOneOrThrow(experienceId: string) {
    const exp = await this.prisma.experience.findUnique({ where: { id: BigInt(experienceId) } });
    if (!exp) throw new NotFoundException('경험을 찾을 수 없습니다.');
    return exp;
  }
}
