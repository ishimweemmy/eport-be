import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';

@Entity('credit_account')
@Index(['accountNumber'], { unique: true, where: '"deleted_at" IS NULL' })
export class CreditAccount extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;

  @Column({ unique: true, name: 'account_number' })
  @Index({ unique: true })
  @ApiProperty()
  accountNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  availableCredit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  totalBorrowed: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  totalRepaid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  outstandingBalance: number;

  @Column({
    type: 'enum',
    enum: EAccountStatus,
    default: EAccountStatus.ACTIVE,
  })
  @ApiProperty({ enum: EAccountStatus, example: EAccountStatus.ACTIVE })
  status: EAccountStatus;
}
