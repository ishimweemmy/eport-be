import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './entities/loan.entity';
import { Repayment } from './entities/repayment.entity';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { User } from '../user/entities/user.entity';
import { CreditAccount } from '../credit/entities/credit-account.entity';
import { SavingsAccount } from '../savings/entities/savings-account.entity';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { TransactionModule } from '../transaction/transaction.module';
import { SavingsModule } from '../savings/savings.module';
import { CreditModule } from '../credit/credit.module';
import { NotificationModule } from '../../integrations/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      Repayment,
      User,
      CreditAccount,
      SavingsAccount,
    ]),
    ExceptionModule,
    TransactionModule,
    SavingsModule,
    CreditModule,
    NotificationModule,
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService],
})
export class LoanModule {}
