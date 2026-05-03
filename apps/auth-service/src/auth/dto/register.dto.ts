import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @Matches(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력하세요 (010XXXXXXXX)' })
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname: string;

  @IsString()
  jobCategory: string;

  @IsOptional()
  @IsBoolean()
  isRealName?: boolean;
}
