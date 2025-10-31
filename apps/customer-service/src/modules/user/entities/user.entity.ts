import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@app/common/database/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '../enums/user-role.enum';
import { EUserStatus } from '../enums/user-status.enum';
import { EKYCStatus } from '../enums/kyc-status.enum';
import { Exclude } from 'class-transformer';

@Entity('user')
@Index(['email'], { unique: true, where: '"deleted_at" IS NULL' })
@Index(['customerId'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "customer_id" IS NOT NULL',
})
export class User extends BaseEntity {
  @Column({ nullable: false })
  @ApiProperty()
  firstName: string;

  @Column({ nullable: false })
  @ApiProperty()
  lastName: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ nullable: false })
  @Exclude()
  password: string;

  @Column({ nullable: false })
  @ApiProperty()
  phoneNumber: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.INACTIVE,
  })
  @ApiProperty()
  status: EUserStatus;

  @Column({ type: 'enum', enum: EUserRole, nullable: false })
  @ApiProperty({ enum: EUserRole })
  role: EUserRole;

  @Column({ nullable: true })
  @ApiProperty()
  lastLogin: Date;

  // Customer-specific fields
  @Column({ nullable: true, unique: true, name: 'customer_id' })
  @ApiProperty()
  customerId: string;

  @Column({
    type: 'enum',
    enum: EKYCStatus,
    nullable: true,
    default: EKYCStatus.PENDING,
  })
  @ApiProperty()
  kycStatus: EKYCStatus;

  @Column({ nullable: true, name: 'kyc_verified_at' })
  @ApiProperty()
  kycVerifiedAt: Date;

  @Column({ type: 'int', nullable: true, default: 300 })
  @ApiProperty()
  creditScore: number;
}
