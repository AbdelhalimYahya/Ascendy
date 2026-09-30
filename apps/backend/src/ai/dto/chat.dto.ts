import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class ChatDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsString()
  problemId?: string;

  @IsString()
  message!: string;

  @IsIn(['hint', 'explain', 'full_solution', 'code_review'])
  mode!: string;

  @IsOptional()
  @IsString()
  code?: string;
}
