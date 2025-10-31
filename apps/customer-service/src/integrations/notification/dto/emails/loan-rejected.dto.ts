import { IsString } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class LoanRejectedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsString()
  reason: string;

  @IsString()
  rejectedAt: string;
}
