import { ApiProperty } from '@nestjs/swagger';
import { ETransactionType } from '../enums/transaction-type.enum';
import { ETransactionStatus } from '../enums/transaction-status.enum';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transactionReference: string;

  @ApiProperty({ enum: ETransactionType })
  type: ETransactionType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceBefore: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty({ enum: ETransactionStatus })
  status: ETransactionStatus;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  processedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
