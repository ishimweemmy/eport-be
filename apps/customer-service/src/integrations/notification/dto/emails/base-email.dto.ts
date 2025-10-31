import { IsString, IsOptional, IsUrl } from 'class-validator';

export class BaseEmailDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body1?: string;

  @IsString()
  @IsOptional()
  body2?: string;

  @IsString()
  @IsOptional()
  otp?: string;

  @IsString()
  @IsOptional()
  buttonText?: string;

  @IsUrl()
  @IsOptional()
  buttonLink?: string;

  @IsUrl()
  @IsOptional()
  unsubscribeLink?: string;

  @IsUrl()
  @IsOptional()
  preferencesLink?: string;

  @IsUrl()
  @IsOptional()
  twitterLink?: string;

  @IsUrl()
  @IsOptional()
  facebookLink?: string;

  @IsUrl()
  @IsOptional()
  linkedinLink?: string;
}
