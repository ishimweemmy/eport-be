import { IsString } from 'class-validator';

export class TwoFactorAuthStatusChangeDto {
  @IsString()
  userName: string;

  @IsString()
  action: string;
}
