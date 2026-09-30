import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTestCaseDto {
  @IsString()
  input!: string;

  @IsString()
  expectedOutput!: string;

  @IsOptional()
  @IsBoolean()
  isSample?: boolean;
}

export class CreateLinkDto {
  @IsString()
  toProblemId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
