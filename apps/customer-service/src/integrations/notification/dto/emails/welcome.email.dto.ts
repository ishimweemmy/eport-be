import { IsString, IsBoolean, IsUrl } from 'class-validator';

export class WelcomeEmailDto {
  @IsString()
  userName: string;

  @IsBoolean()
  isNewUser: boolean;

  @IsUrl()
  dashboardUrl: string;

  defaultPassword?: string;

  @IsString()
  emailContent: string;
}
