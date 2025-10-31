import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class PaymentOverdueDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsNumber()
  dueAmount: number;

  @IsNumber()
  daysOverdue: number;

  @IsNumber()
  lateFee: number;

  @IsNumber()
  totalDue: number;

  @IsNumber()
  scheduleNumber: number;

  @IsNumber()
  outstandingAmount: number;
}
