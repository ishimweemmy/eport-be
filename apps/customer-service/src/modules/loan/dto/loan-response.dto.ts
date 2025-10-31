import { ApiProperty } from '@nestjs/swagger';
import { ELoanStatus } from '../enums/loan-status.enum';
import { EApprovalStatus } from '../enums/approval-status.enum';

export class LoanResponseDto {
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

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  disbursedAt?: Date;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty({ required: false })
  purpose?: string;

  @ApiProperty({ required: false })
  savingsAccountId?: string;

  @ApiProperty({ required: false })
  savingsAccountNumber?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
