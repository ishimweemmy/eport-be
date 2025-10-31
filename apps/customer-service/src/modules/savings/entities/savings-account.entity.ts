import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { ESavingsAccountType } from '../enums/savings-account-type.enum';
import { EAccountStatus } from '../enums/account-status.enum';
import { EAccountTier } from '../enums/account-tier.enum';

@Entity('savings_account')
@Index(['accountNumber'], { unique: true, where: '"deleted_at" IS NULL' })
export class SavingsAccount extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty()
  user: User;

  @Column({ unique: true, name: 'account_number' })
  @Index({ unique: true })
  @ApiProperty()
  accountNumber: string;

  @Column({
    type: 'enum',
    enum: ESavingsAccountType,
    default: ESavingsAccountType.REGULAR,
  })
  @ApiProperty({
    enum: ESavingsAccountType,
    example: ESavingsAccountType.REGULAR,
  })
  accountType: ESavingsAccountType;

  @Column({
    type: 'enum',
    enum: EAccountTier,
    default: EAccountTier.BASIC,
  })
  @ApiProperty({ enum: EAccountTier, example: EAccountTier.BASIC })
  tier: EAccountTier;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @ApiProperty()
  accruedInterest: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  @ApiProperty()
  interestRate: number;

  @Column({ default: 'RWF' })
  @ApiProperty()
  currency: string;

  @Column({
    type: 'enum',
    enum: EAccountStatus,
    default: EAccountStatus.ACTIVE,
  })
  @ApiProperty({ enum: EAccountStatus, example: EAccountStatus.ACTIVE })
  status: EAccountStatus;

  @Column({ nullable: true, name: 'last_interest_calculation_date' })
  @ApiProperty()
  lastInterestCalculationDate: Date;
}
