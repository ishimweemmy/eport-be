import { IsNumber } from 'class-validator';
import { VerificationEmailDto } from './verification.email.dto';

export class UserOnboardVerificationDto extends VerificationEmailDto {
  @IsNumber()
  otp: number;
  @IsNumber()
  otpValidityDuration: number;
}
