import { IsInt, Min, Max } from 'class-validator';

export class VoteExperienceDto {
  @IsInt()
  @Min(1)
  @Max(9)
  difficulty: number;

  @IsInt()
  @Min(1)
  @Max(9)
  impact: number;

  @IsInt()
  @Min(1)
  @Max(9)
  workValue: number;

  @IsInt()
  @Min(1)
  @Max(9)
  authenticity: number;
}
