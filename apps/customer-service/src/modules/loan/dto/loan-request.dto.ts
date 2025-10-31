import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class LoanRequestDto {
  @ApiProperty({ example: 100000, description: 'Loan amount in RWF' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  principalAmount: number;

  @ApiProperty({
    example: 6,
    description: 'Loan tenor in months',
    enum: [3, 6, 12, 24],
  })
  @IsNumber()
  @IsEnum([3, 6, 12, 24])
  @IsNotEmpty()
  tenorMonths: number;

  @ApiProperty({ example: 'Business expansion', required: false })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty({
    required: false,
    description:
      'Savings account to receive loan. If not provided, uses first active account.',
  })
  @IsUUID()
  @IsOptional()
  savingsAccountId?: string;
}
