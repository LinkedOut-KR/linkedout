import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
  ) {}

  async sendPhoneCode(phone: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) throw new ConflictException('이미 사용 중인 휴대폰 번호입니다.');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`phone_verify:${phone}`, code, 300); // 5분

    // TODO: 실제 SMS 발송 연동 (MVP에서는 콘솔 출력)
    console.log(`[SMS] ${phone} 인증번호: ${code}`);
  }

  async verifyPhoneCode(phone: string, code: string): Promise<void> {
    const stored = await this.redis.get(`phone_verify:${phone}`);
    if (!stored || stored !== code) {
      throw new BadRequestException('인증번호가 올바르지 않거나 만료되었습니다.');
    }
    // 인증 완료 표시 (10분간 유효)
    await this.redis.set(`phone_verified:${phone}`, '1', 600);
    await this.redis.del(`phone_verify:${phone}`);
  }

  async register(dto: RegisterDto) {
    const verified = await this.redis.get(`phone_verified:${dto.phone}`);
    if (!verified) {
      throw new BadRequestException('휴대폰 인증을 먼저 완료해주세요.');
    }

    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const phoneExists = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (phoneExists) throw new ConflictException('이미 사용 중인 휴대폰 번호입니다.');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        phoneVerified: true,
        nickname: dto.nickname,
        jobCategory: dto.jobCategory,
        isRealName: dto.isRealName ?? false,
        profile: { create: {} },
        userGrade: { create: {} },
      },
      select: { id: true, email: true, nickname: true, role: true },
    });

    await this.redis.del(`phone_verified:${dto.phone}`);

    const token = this.generateToken(user.id.toString(), user.email);
    return { user: { ...user, id: user.id.toString() }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, passwordHash: true, nickname: true, role: true },
    });

    if (!user || !user.passwordHash) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const token = this.generateToken(user.id.toString(), user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: { ...userWithoutPassword, id: user.id.toString() }, token };
  }

  private generateToken(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }
}
