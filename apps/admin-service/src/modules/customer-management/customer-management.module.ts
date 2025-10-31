import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { CustomerManagementService } from '@admin-service/modules/customer-management/customer-management.service';
import { CustomerManagementController } from '@admin-service/modules/customer-management/customer-management.controller';
import { AdminActionLogModule } from '@admin-service/modules/admin-action-log/admin-action-log.module';
import { NotificationGrpcModule } from '@admin-service/integrations/notification/notification-grpc.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { CreditService } from '@customer-service/modules/credit/credit.service';
import { NotificationModule } from '@customer-service/integrations/notification/notification.module';
import { CoreServiceConfigModule } from '@customer-service/configs/customer-service-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CreditAccount, Loan, SavingsAccount]),
    JwtModule,
    CoreServiceConfigModule,
    AdminActionLogModule,
    NotificationGrpcModule,
    NotificationModule,
    ExceptionModule,
  ],
  controllers: [CustomerManagementController],
  providers: [CustomerManagementService, CreditService],
  exports: [CustomerManagementService],
})
export class CustomerManagementModule {}
