import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  codeSnippet?: string;
}

export class CreateCommentDto {
  @IsString()
  content!: string;
}

export class VoteDto {
  @IsIn([1, -1])
  value!: number;
}
