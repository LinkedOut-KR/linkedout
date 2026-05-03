import { IsString, Matches } from 'class-validator';

export class SendPhoneCodeDto {
  @Matches(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력하세요 (010XXXXXXXX)' })
  phone: string;
}

export class VerifyPhoneCodeDto {
  @Matches(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력하세요' })
  phone: string;

  @IsString()
  code: string;
}
