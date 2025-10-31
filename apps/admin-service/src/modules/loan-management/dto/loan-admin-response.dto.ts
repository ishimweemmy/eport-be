import { ApiProperty } from '@nestjs/swagger';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';

export class LoanAdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  loanNumber: string;

  @ApiProperty()
  principalAmount: number;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  tenorMonths: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  outstandingAmount: number;

  @ApiProperty({ enum: ELoanStatus })
  status: ELoanStatus;

  @ApiProperty({ enum: EApprovalStatus })
  approvalStatus: EApprovalStatus;

  @ApiProperty()
  requestedAt: Date;

  @ApiProperty({ nullable: true })
  approvedAt?: Date | null;

  @ApiProperty({ nullable: true })
  rejectedAt?: Date | null;

  @ApiProperty({ nullable: true })
  disbursedAt?: Date | null;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ nullable: true })
  purpose?: string;

  // Customer information
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty({ nullable: true })
  customerPhone?: string;

  @ApiProperty()
  customerCreditScore: number;

  // Account information
  @ApiProperty({ nullable: true })
  creditAccountId?: string;

  @ApiProperty({ nullable: true })
  savingsAccountId?: string;

  @ApiProperty({ nullable: true })
  savingsAccountNumber?: string;

  // Admin action information
  @ApiProperty({ nullable: true })
  approvedBy?: string;

  @ApiProperty({ nullable: true })
  rejectedBy?: string;

  @ApiProperty({ nullable: true })
  rejectionReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LoanActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  loan: LoanAdminResponseDto;
}
