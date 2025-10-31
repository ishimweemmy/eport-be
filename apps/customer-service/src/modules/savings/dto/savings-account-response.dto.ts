import { ApiProperty } from '@nestjs/swagger';
import { ESavingsAccountType } from '../enums/savings-account-type.enum';
import { EAccountTier } from '../enums/account-tier.enum';
import { EAccountStatus } from '../enums/account-status.enum';

export class SavingsAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty({ enum: ESavingsAccountType })
  accountType: ESavingsAccountType;

  @ApiProperty({ enum: EAccountTier })
  tier: EAccountTier;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ enum: EAccountStatus })
  status: EAccountStatus;

  @ApiProperty({ required: false })
  lastInterestCalculationDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
