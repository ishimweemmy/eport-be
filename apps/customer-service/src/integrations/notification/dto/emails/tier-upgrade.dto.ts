import { IsString, IsNumber, IsOptional } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class TierUpgradeDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  previousTier: string;

  @IsString()
  newTier: string;

  @IsString()
  accountNumber: string;

  @IsString()
  upgradeDate: string;

  @IsNumber()
  interestRate: number;

  @IsNumber()
  dailyDepositLimit: number;

  @IsNumber()
  dailyWithdrawalLimit: number;

  @IsNumber()
  monthlyWithdrawalLimit: number;

  @IsNumber()
  currentBalance: number;

  @IsNumber()
  previousInterestRate: number;

  @IsNumber()
  previousDailyDeposit: number;

  @IsNumber()
  previousDailyWithdrawal: number;

  @IsNumber()
  previousMonthlyWithdrawal: number;

  @IsString()
  tierClass: string;

  @IsString()
  @IsOptional()
  nextTier?: string;
}
