import { ApiProperty } from '@nestjs/swagger';
import { ERepaymentStatus } from '../enums/repayment-status.enum';

export class RepaymentScheduleItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  scheduleNumber: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  dueAmount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty({ enum: ERepaymentStatus })
  status: ERepaymentStatus;

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty()
  lateFee: number;
}

export class RepaymentScheduleDto {
  @ApiProperty()
  loanNumber: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  outstandingAmount: number;

  @ApiProperty({ type: [RepaymentScheduleItemDto] })
  schedule: RepaymentScheduleItemDto[];
}
