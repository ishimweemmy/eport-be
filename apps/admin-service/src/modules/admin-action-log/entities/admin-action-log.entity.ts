import { BaseEntity } from '@app/common/database/base.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum EAdminActionType {
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  LOAN_DISBURSED = 'LOAN_DISBURSED',
  CUSTOMER_SUSPENDED = 'CUSTOMER_SUSPENDED',
  CUSTOMER_UNSUSPENDED = 'CUSTOMER_UNSUSPENDED',
  CREDIT_LIMIT_UPDATED = 'CREDIT_LIMIT_UPDATED',
  CREDIT_SCORE_UPDATED = 'CREDIT_SCORE_UPDATED',
}

@Entity('admin_actions_log')
@Index(['adminId', 'createdAt'])
@Index(['actionType', 'createdAt'])
@Index(['targetId', 'createdAt'])
export class AdminActionLog extends BaseEntity {
  @Column({
    type: 'enum',
    enum: EAdminActionType,
    nullable: false,
  })
  actionType: EAdminActionType;

  @Column({ type: 'uuid', nullable: false })
  adminId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column({ type: 'uuid', nullable: true })
  targetId: string; // ID of the resource being acted upon (loan, customer, etc.)

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetType: string; // Type of resource (Loan, User, CreditAccount, etc.)

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional data like old/new values, reason, etc.

  @Column({ type: 'text', nullable: true })
  notes: string; // Admin's notes or reason for the action

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;
}
