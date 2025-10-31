import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty()
  totalCustomers: number;

  @ApiProperty()
  activeCustomers: number;

  @ApiProperty()
  suspendedCustomers: number;

  @ApiProperty()
  totalLoans: number;

  @ApiProperty()
  pendingLoans: number;

  @ApiProperty()
  activeLoans: number;

  @ApiProperty()
  defaultedLoans: number;

  @ApiProperty()
  totalLoansDisbursed: number;

  @ApiProperty()
  totalLoansRepaid: number;

  @ApiProperty()
  totalOutstanding: number;

  @ApiProperty()
  averageCreditScore: number;

  @ApiProperty()
  totalSavingsBalance: number;

  @ApiProperty()
  totalTransactions: number;

  @ApiProperty()
  totalTransactionVolume: number;
}

export class TransactionAdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  transactionReference: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty({ nullable: true })
  savingsAccountId?: string;

  @ApiProperty({ nullable: true })
  savingsAccountNumber?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  completedAt?: Date;

  @ApiProperty({ nullable: true })
  metadata?: Record<string, any>;
}
