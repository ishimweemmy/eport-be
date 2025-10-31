import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class InterestCreditedDto extends BaseEmailDto {
  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsNumber()
  interestAmount: number;

  @ApiProperty()
  @IsNumber()
  newBalance: number;

  @ApiProperty()
  @IsNumber()
  interestRate: number;

  @ApiProperty()
  @IsString()
  accountTier: string;

  @ApiProperty()
  @IsString()
  month: string;
}
