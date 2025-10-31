import { ApiProperty } from '@nestjs/swagger';
import { ETransactionType } from '@customer-service/modules/transaction/enums/transaction-type.enum';
import { ETransactionStatus } from '@customer-service/modules/transaction/enums/transaction-status.enum';

export class TransactionAdminResponseDto {
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

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ nullable: true })
  processedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Customer information
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty({ nullable: true })
  customerPhone?: string;

  // Savings account information
  @ApiProperty({ nullable: true })
  savingsAccountId?: string;

  @ApiProperty({ nullable: true })
  savingsAccountNumber?: string;
}
