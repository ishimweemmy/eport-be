import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class LoanDisbursedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsNumber()
  amount: number;

  @IsString()
  accountNumber: string;

  @IsString()
  transactionReference: string;

  @IsNumber()
  newBalance: number;

  @IsString()
  disbursedAt: string;

  @IsString()
  firstPaymentDate: string;

  @IsNumber()
  monthlyInstallment: number;
}
