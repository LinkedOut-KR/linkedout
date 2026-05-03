import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  problem?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  goal?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  action?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  result?: string;

  @IsOptional()
  @IsString()
  achievement?: string;

  @IsOptional()
  @IsString()
  lesson?: string;
}
