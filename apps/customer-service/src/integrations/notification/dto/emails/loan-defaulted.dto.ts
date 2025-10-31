import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class LoanDefaultedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsNumber()
  daysOverdue: number;

  @IsNumber()
  totalDue: number;

  @IsNumber()
  outstandingAmount: number;

  @IsString()
  defaultDate: string;

  @IsNumber()
  creditScoreImpact: number;
}
