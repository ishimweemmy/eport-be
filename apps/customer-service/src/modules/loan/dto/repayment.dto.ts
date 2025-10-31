import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class RepaymentDto {
  @ApiProperty({ example: 'loan-uuid' })
  @IsUUID()
  @IsNotEmpty()
  loanId: string;

  @ApiProperty({ example: 50000, description: 'Repayment amount in RWF' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    required: false,
    description:
      'Savings account to deduct repayment from. If not provided, uses loan disbursement account.',
  })
  @IsUUID()
  @IsOptional()
  savingsAccountId?: string;
}
