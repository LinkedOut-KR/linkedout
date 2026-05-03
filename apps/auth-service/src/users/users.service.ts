import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        email: true,
        nickname: true,
        jobCategory: true,
        profileImageUrl: true,
        freeViewsRemaining: true,
        role: true,
        createdAt: true,
        profile: true,
        userGrade: true,
        experiences: {
          select: { id: true, title: true, status: true, grade: true, createdAt: true },
          orderBy: { createdAt: 'desc' as const },
          take: 50,
        },
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return {
      ...user,
      id: user.id.toString(),
    };
  }

  async updateProfile(
    userId: string,
    data: { bio?: string; githubUrl?: string; linkedinUrl?: string; portfolioUrl?: string; nickname?: string },
  ) {
    const { bio, githubUrl, linkedinUrl, portfolioUrl, nickname } = data;

    if (nickname) {
      await this.prisma.user.update({
        where: { id: BigInt(userId) },
        data: { nickname },
      });
    }

    const profile = await this.prisma.profile.upsert({
      where: { userId: BigInt(userId) },
      create: { userId: BigInt(userId), bio, githubUrl, linkedinUrl, portfolioUrl },
      update: { bio, githubUrl, linkedinUrl, portfolioUrl },
    });

    return profile;
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        nickname: true,
        jobCategory: true,
        profileImageUrl: true,
        profile: true,
        userGrade: true,
        experiences: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            title: true,
            summary: true,
            category: true,
            grade: true,
            viewCount: true,
            createdAt: true,
          },
          orderBy: { grade: 'asc' },
          take: 10,
        },
        _count: { select: { experiences: { where: { status: 'APPROVED' } } } },
      },
    });

    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    return { ...user, id: user.id.toString() };
  }

  async recalculateUserGrade(userId: string) {
    const experiences = await this.prisma.experienceGrade.findMany({
      where: { experience: { userId: BigInt(userId), status: 'APPROVED' } },
      select: { grade: true },
      orderBy: { grade: 'asc' },
      take: 100,
    });

    const totalScore = experiences.reduce((sum, e) => {
      return sum + (10 - Number(e.grade));
    }, 0);

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
}
