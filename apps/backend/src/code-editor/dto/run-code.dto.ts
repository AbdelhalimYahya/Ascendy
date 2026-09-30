import { IsString, IsIn, IsOptional } from 'class-validator';

export class RunCodeDto {
  @IsString()
  code!: string;

  @IsIn(['javascript', 'python', 'cpp', 'java'])
  language!: string;

  @IsOptional()
  @IsString()
  stdin?: string;
}
