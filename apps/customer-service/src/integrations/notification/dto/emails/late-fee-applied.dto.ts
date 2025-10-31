import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class LateFeeAppliedDto extends BaseEmailDto {
  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsString()
  loanNumber: string;

  @ApiProperty()
  @IsNumber()
  dueAmount: number;

  @ApiProperty()
  @IsNumber()
  lateFee: number;

  @ApiProperty()
  @IsNumber()
  totalDue: number;

  @ApiProperty()
  @IsString()
  dueDate: string;

  @ApiProperty()
  @IsNumber()
  daysOverdue: number;
}
