import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendPhoneCodeDto, VerifyPhoneCodeDto } from './dto/verify-phone.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('phone/send')
  @HttpCode(HttpStatus.OK)
  async sendPhoneCode(@Body() dto: SendPhoneCodeDto) {
    await this.auth.sendPhoneCode(dto.phone);
    return { message: '인증번호가 발송되었습니다.' };
  }

  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPhoneCode(@Body() dto: VerifyPhoneCodeDto) {
    await this.auth.verifyPhoneCode(dto.phone, dto.code);
    return { message: '휴대폰 인증이 완료되었습니다.' };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
