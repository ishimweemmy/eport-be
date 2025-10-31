import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionManagementController } from './transaction-management.controller';
import { TransactionManagementService } from './transaction-management.service';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User, SavingsAccount])],
  controllers: [TransactionManagementController],
  providers: [TransactionManagementService, ExceptionHandler],
  exports: [TransactionManagementService],
})
export class TransactionManagementModule {}
