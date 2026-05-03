import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary: string;

  @IsString()
  category: string;

  @IsString()
  @MinLength(20)
  problem: string;

  @IsString()
  @MinLength(10)
  role: string;

  @IsString()
  @MinLength(10)
  goal: string;

  @IsString()
  @MinLength(20)
  action: string;

  @IsString()
  @MinLength(20)
  result: string;

  @IsOptional()
  @IsString()
  achievement?: string;

  @IsOptional()
  @IsString()
  lesson?: string;
}
