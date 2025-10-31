import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { Repayment } from '@customer-service/modules/loan/entities/repayment.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { LoanManagementService } from '@admin-service/modules/loan-management/loan-management.service';
import { LoanManagementController } from '@admin-service/modules/loan-management/loan-management.controller';
import { AdminActionLogModule } from '@admin-service/modules/admin-action-log/admin-action-log.module';
import { NotificationGrpcModule } from '@admin-service/integrations/notification/notification-grpc.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { LoanService } from '@customer-service/modules/loan/loan.service';
import { TransactionService } from '@customer-service/modules/transaction/transaction.service';
import { SavingsService } from '@customer-service/modules/savings/savings.service';
import { CreditService } from '@customer-service/modules/credit/credit.service';
import { NotificationModule } from '@customer-service/integrations/notification/notification.module';
import { CoreServiceConfigModule } from '@customer-service/configs/customer-service-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      User,
      CreditAccount,
      Repayment,
      SavingsAccount,
      Transaction,
    ]),
    JwtModule,
    CoreServiceConfigModule,
    AdminActionLogModule,
    NotificationGrpcModule,
    NotificationModule,
    ExceptionModule,
  ],
  controllers: [LoanManagementController],
  providers: [
    LoanManagementService,
    LoanService,
    TransactionService,
    SavingsService,
    CreditService,
  ],
  exports: [LoanManagementService],
})
export class LoanManagementModule {}
