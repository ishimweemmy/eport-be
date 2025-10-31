import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { ELoanStatus } from '../enums/loan-status.enum';
import { EApprovalStatus } from '../enums/approval-status.enum';

@Entity('loan')
@Index(['loanNumber'], { unique: true, where: '"deleted_at" IS NULL' })
export class Loan extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;

  @ManyToOne(() => CreditAccount, { nullable: false })
  @JoinColumn({ name: 'credit_account_id' })
  @ApiProperty()
  creditAccount: CreditAccount;

  @ManyToOne(() => SavingsAccount, { nullable: true })
  @JoinColumn({ name: 'savings_account_id' })
  @ApiProperty()
  savingsAccount: SavingsAccount;

  @Column({ unique: true, name: 'loan_number' })
  @Index({ unique: true })
  @ApiProperty()
  loanNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  principalAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @ApiProperty()
  interestRate: number;

  @Column({ type: 'int' })
  @ApiProperty()
  tenorMonths: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  outstandingAmount: number;

  @Column({
    type: 'enum',
    enum: ELoanStatus,
    default: ELoanStatus.PENDING,
  })
  @ApiProperty({ enum: ELoanStatus, example: ELoanStatus.PENDING })
  status: ELoanStatus;

  @Column({
    type: 'enum',
    enum: EApprovalStatus,
    default: EApprovalStatus.PENDING_REVIEW,
  })
  @ApiProperty({
    enum: EApprovalStatus,
    example: EApprovalStatus.PENDING_REVIEW,
  })
  approvalStatus: EApprovalStatus;

  @Column({ name: 'requested_at' })
  @ApiProperty()
  requestedAt: Date;

  @Column({ nullable: true, name: 'approved_at' })
  @ApiProperty()
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  @ApiProperty()
  approvedBy: User;

  @Column({ nullable: true, name: 'disbursed_at' })
  @ApiProperty()
  disbursedAt: Date;

  @Column({ name: 'due_date' })
  @ApiProperty()
  dueDate: Date;

  @Column({ nullable: true })
  @ApiProperty()
  purpose: string;
}
