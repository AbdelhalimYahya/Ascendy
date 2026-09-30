import { IsString, IsOptional, IsIn, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateRoadmapDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['interview', 'competitive', 'custom'])
  goalType?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateStepDto {
  @IsInt()
  @Min(0)
  order!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  problemId?: string;
}

export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  currentStep!: number;

  @IsOptional()
  @IsBoolean()
  visibleToOthers?: boolean;
}
