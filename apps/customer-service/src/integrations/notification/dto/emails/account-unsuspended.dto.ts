import { IsString } from 'class-validator';
import { BaseEmailDto } from './base-email.dto';

export class AccountUnsuspendedDto extends BaseEmailDto {
  @IsString()
  customerName: string;

  @IsString()
  reactivatedAt: string;
}
