import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class RepaymentDueDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsString()
  dueDate: string;

  @IsNumber()
  dueAmount: number;

  @IsNumber()
  scheduleNumber: number;

  @IsNumber()
  outstandingAmount: number;

  @IsNumber()
  gracePeriod: number;
}
