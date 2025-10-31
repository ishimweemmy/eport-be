import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankingCronService } from '@crons-service/modules/banking/banking.cron.service';
import { SavingsCronService } from '@crons-service/modules/banking/services/savings-cron.service';
import { LoanCronService } from '@crons-service/modules/banking/services/loan-cron.service';
import { TierCronService } from '@crons-service/modules/banking/services/tier-cron.service';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { DailyBalanceSnapshot } from '@customer-service/modules/savings/entities/daily-balance-snapshot.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { Repayment } from '@customer-service/modules/loan/entities/repayment.entity';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { TransactionService } from '@customer-service/modules/transaction/transaction.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingsAccount,
      DailyBalanceSnapshot,
      Loan,
      Repayment,
      Transaction,
      User,
    ]),
    ExceptionModule,
  ],
  providers: [
    BankingCronService,
    SavingsCronService,
    LoanCronService,
    TierCronService,
    TransactionService,
  ],
})
export class BankingModule {}
