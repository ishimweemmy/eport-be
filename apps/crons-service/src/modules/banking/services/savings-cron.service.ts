import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { DailyBalanceSnapshot } from '@customer-service/modules/savings/entities/daily-balance-snapshot.entity';
import { TransactionService } from '@customer-service/modules/transaction/transaction.service';
import { ETransactionType } from '@customer-service/modules/transaction/enums/transaction-type.enum';
import { NotificationPreProcessor } from '@crons-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@customer-service/configs/email-template-configs/email-templates.config';
import { SavingsAccountQueries } from '@crons-service/modules/banking/repositories/savings-account.queries';
import { calculateDailyInterest } from '@crons-service/modules/banking/helpers/interest.helper';
import {
  isLastDayOfMonth,
  getMonthName,
} from '@crons-service/modules/banking/helpers/banking.helpers';

@Injectable()
export class SavingsCronService {
  private readonly logger = new Logger(SavingsCronService.name);
  private readonly savingsAccountQueries: SavingsAccountQueries;

  constructor(
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    @InjectRepository(DailyBalanceSnapshot)
    private readonly dailyBalanceSnapshotRepository: Repository<DailyBalanceSnapshot>,
    private readonly transactionService: TransactionService,
    private readonly notificationPreProcessor: NotificationPreProcessor,
  ) {
    this.savingsAccountQueries = new SavingsAccountQueries(
      savingsAccountRepository,
    );
  }

  async applyDailyInterest(): Promise<void> {
    const activeAccounts =
      await this.savingsAccountQueries.findActiveSavingsAccounts();

    this.logger.log(
      `[INFO] Processing ${activeAccounts.length} active savings accounts`,
    );

    const today = new Date();
    const lastDayOfMonth = isLastDayOfMonth(today);
    let accruedCount = 0;
    let compoundedCount = 0;

    for (const account of activeAccounts) {
      const balance = Number(account.balance);
      const rate = Number(account.interestRate);

      const dailyInterest = calculateDailyInterest(balance, rate);
      const currentAccrued = Number(account.accruedInterest) || 0;
      const newAccrued = currentAccrued + dailyInterest;

      account.accruedInterest = newAccrued;

      if (lastDayOfMonth && newAccrued > 0) {
        await this.compoundInterest(account, newAccrued, today);
        compoundedCount++;
      }

      await this.savingsAccountRepository.save(account);
      accruedCount++;

      await this.dailyBalanceSnapshotRepository.save({
        savingsAccount: account,
        balance: Number(account.balance),
        snapshotDate: today,
      });
    }

    this.logger.log(`[SUCCESS] Applied interest to ${accruedCount} accounts`);
    this.logger.log(
      `[INFO] ${compoundedCount} accounts compounded (end of month)`,
    );
  }

  private async compoundInterest(
    account: SavingsAccount,
    interestAmount: number,
    today: Date,
  ): Promise<void> {
    const balance = Number(account.balance);
    account.balance = balance + interestAmount;
    account.accruedInterest = 0;
    account.lastInterestCalculationDate = today;

    const month = getMonthName(today);

    const transaction = await this.transactionService.createTransaction(
      account.user.id,
      account.id,
      ETransactionType.INTEREST_CREDIT,
      interestAmount,
      `Monthly interest credit for ${month}`,
    );
    await this.transactionService.completeTransaction(transaction.id);

    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.INTEREST_CREDITED,
      [account.user.email],
      {
        customerName: `${account.user.firstName} ${account.user.lastName}`,
        accountNumber: account.accountNumber,
        interestAmount,
        newBalance: Number(account.balance),
        interestRate: Number(account.interestRate),
        accountTier: account.tier,
        month,
      },
    );
  }
}
