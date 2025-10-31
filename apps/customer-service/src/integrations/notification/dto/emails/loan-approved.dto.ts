import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class LoanApprovedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsNumber()
  principalAmount: number;

  @IsNumber()
  interestRate: number;

  @IsNumber()
  tenorMonths: number;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  monthlyInstallment: number;

  @IsString()
  approvalStatus: string;

  @IsString()
  approvedAt: string;

  @IsString()
  firstPaymentDate: string;
}
