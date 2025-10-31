import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class CreditLimitUpdatedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsNumber()
  previousLimit: number;

  @IsNumber()
  newLimit: number;

  @IsString()
  reason: string;

  @IsString()
  updatedAt: string;
}
