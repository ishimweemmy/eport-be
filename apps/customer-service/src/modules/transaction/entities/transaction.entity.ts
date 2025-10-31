import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { ETransactionType } from '../enums/transaction-type.enum';
import { ETransactionStatus } from '../enums/transaction-status.enum';

@Entity('transaction')
@Index(['transactionReference'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;

  @ManyToOne(() => SavingsAccount, { nullable: true })
  @JoinColumn({ name: 'savings_account_id' })
  @ApiProperty()
  savingsAccount: SavingsAccount;

  @Column({ unique: true, name: 'transaction_reference' })
  @Index({ unique: true })
  @ApiProperty()
  transactionReference: string;

  @Column({
    type: 'enum',
    enum: ETransactionType,
  })
  @ApiProperty({ enum: ETransactionType, example: ETransactionType.DEPOSIT })
  type: ETransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: ETransactionStatus,
    default: ETransactionStatus.PENDING,
  })
  @ApiProperty({
    enum: ETransactionStatus,
    example: ETransactionStatus.COMPLETED,
  })
  status: ETransactionStatus;

  @Column({ nullable: true })
  @ApiProperty()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty()
  metadata: Record<string, any>;

  @Column({ nullable: true, name: 'processed_at' })
  @ApiProperty()
  processedAt: Date;
}
