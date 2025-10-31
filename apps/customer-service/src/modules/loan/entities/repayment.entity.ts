import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Loan } from './loan.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { ERepaymentStatus } from '../enums/repayment-status.enum';

@Entity('repayment')
export class Repayment extends BaseEntity {
  @ManyToOne(() => Loan, { nullable: false })
  @JoinColumn({ name: 'loan_id' })
  @ApiProperty()
  loan: Loan;

  @ManyToOne(() => SavingsAccount, { nullable: true })
  @JoinColumn({ name: 'savings_account_id' })
  @ApiProperty()
  savingsAccount: SavingsAccount;

  @OneToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  @ApiProperty()
  transaction: Transaction;

  @Column({ type: 'int', name: 'schedule_number' })
  @ApiProperty()
  scheduleNumber: number;

  @Column({ name: 'due_date' })
  @ApiProperty()
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'due_amount' })
  @ApiProperty()
  dueAmount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    name: 'amount_paid',
  })
  @ApiProperty()
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: ERepaymentStatus,
    default: ERepaymentStatus.SCHEDULED,
  })
  @ApiProperty({ enum: ERepaymentStatus, example: ERepaymentStatus.SCHEDULED })
  status: ERepaymentStatus;

  @Column({ nullable: true, name: 'paid_at' })
  @ApiProperty()
  paidAt: Date;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    name: 'late_fee',
  })
  @ApiProperty()
  lateFee: number;
}
