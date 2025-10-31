import { IsString, IsNumber } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class CreditScoreUpdatedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsNumber()
  previousScore: number;

  @IsNumber()
  newScore: number;

  @IsString()
  reason: string;

  @IsString()
  updatedAt: string;
}
