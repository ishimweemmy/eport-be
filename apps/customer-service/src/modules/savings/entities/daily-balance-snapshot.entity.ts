import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SavingsAccount } from './savings-account.entity';

@Entity('daily_balance_snapshot')
@Index(['savingsAccount', 'snapshotDate'], { unique: true })
export class DailyBalanceSnapshot extends BaseEntity {
  @ManyToOne(() => SavingsAccount, { nullable: false })
  @JoinColumn({ name: 'savings_account_id' })
  @ApiProperty()
  savingsAccount: SavingsAccount;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @ApiProperty()
  balance: number;

  @Column({ type: 'date', name: 'snapshot_date' })
  @ApiProperty()
  snapshotDate: Date;
}
