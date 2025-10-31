import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class RepaymentReceivedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  loanNumber: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  scheduleNumber: number;

  @IsNumber()
  totalInstallments: number;

  @IsString()
  transactionReference: string;

  @IsString()
  paymentDate: string;

  @IsString()
  paymentStatus: string;

  @IsNumber()
  outstandingAmount: number;

  @IsNumber()
  progressPercentage: number;

  @IsBoolean()
  fullyPaid: boolean;

  @IsString()
  @IsOptional()
  nextPaymentDate?: string;

  @IsNumber()
  @IsOptional()
  nextInstallmentAmount?: number;
}
