import { IsString } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class AccountSuspendedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  reason: string;

  @IsString()
  suspendedAt: string;

  @IsString()
  contactEmail: string;

  @IsString()
  contactPhone: string;
}
