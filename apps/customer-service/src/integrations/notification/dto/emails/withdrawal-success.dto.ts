import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class WithdrawalSuccessDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsNumber()
  amount: number;

  @IsString()
  transactionReference: string;

  @IsString()
  accountNumber: string;

  @IsNumber()
  balanceBefore: number;

  @IsNumber()
  balanceAfter: number;

  @IsString()
  timestamp: string;
}
