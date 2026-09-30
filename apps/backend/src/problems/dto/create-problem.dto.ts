import { IsOptional, IsString, IsIn, IsObject, IsArray } from 'class-validator';

export class CreateProblemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  statement?: string;

  @IsIn(['Easy', 'Medium', 'Hard'])
  difficulty!: string;

  @IsOptional()
  @IsObject()
  starterCode?: Record<string, string>;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  sourcePlatform?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
