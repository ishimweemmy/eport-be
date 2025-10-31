import { IsString, IsUrl, IsOptional } from 'class-validator';

export class VerificationEmailDto {
  @IsString()
  userName: string;

  @IsUrl()
  @IsOptional()
  verificationUrl?: string;
}
