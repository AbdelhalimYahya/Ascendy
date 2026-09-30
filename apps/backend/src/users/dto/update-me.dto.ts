import { IsOptional, IsString, MaxLength, IsIn, IsBoolean } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsIn(['en', 'ar'])
  languagePref?: string;

  @IsOptional()
  @IsBoolean()
  competitiveMode?: boolean;
}
