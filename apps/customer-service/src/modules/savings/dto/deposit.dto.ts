import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 'uuid-of-savings-account' })
  @IsUUID()
  @IsNotEmpty()
  savingsAccountId: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Salary deposit', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
