import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: 'uuid-of-savings-account' })
  @IsUUID()
  @IsNotEmpty()
  savingsAccountId: string;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Cash withdrawal', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
