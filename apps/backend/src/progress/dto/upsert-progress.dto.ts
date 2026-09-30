import { IsString, IsIn, IsOptional, IsInt, Min } from 'class-validator';

export class UpsertProgressDto {
  @IsString()
  problemId!: string;

  @IsIn(['Attempted', 'Solved', 'Skipped'])
  status!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMin?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
