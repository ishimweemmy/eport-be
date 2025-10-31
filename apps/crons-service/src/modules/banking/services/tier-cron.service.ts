import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { DailyBalanceSnapshot } from '@customer-service/modules/savings/entities/daily-balance-snapshot.entity';
import { EAccountTier } from '@customer-service/modules/savings/enums/account-tier.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';
import { NotificationPreProcessor } from '@crons-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@customer-service/configs/email-template-configs/email-templates.config';
import {
  TIER_LIMITS,
  TIER_UPGRADE,
} from '@crons-service/modules/banking/constants/banking.constants';
import { SavingsAccountQueries } from '@crons-service/modules/banking/repositories/savings-account.queries';
import { calculateMonthsBetween } from '@crons-service/modules/banking/helpers/banking.helpers';
import { calculateAverageBalance } from '@crons-service/modules/banking/helpers/interest.helper';

@Injectable()
export class TierCronService {
  private readonly logger = new Logger(TierCronService.name);
  private readonly savingsAccountQueries: SavingsAccountQueries;

  constructor(
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    @InjectRepository(DailyBalanceSnapshot)
    private readonly dailyBalanceSnapshotRepository: Repository<DailyBalanceSnapshot>,
    private readonly notificationPreProcessor: NotificationPreProcessor,
  ) {
    this.savingsAccountQueries = new SavingsAccountQueries(
      savingsAccountRepository,
    );
  }

  async evaluateUpgrades(): Promise<void> {
    const activeAccounts =
      await this.savingsAccountQueries.findActiveSavingsAccounts();

    this.logger.log(
      `[INFO] Evaluating ${activeAccounts.length} accounts for tier upgrades`,
    );

    const today = new Date();
    const evaluationStartDate = new Date(today);
    evaluationStartDate.setDate(
      evaluationStartDate.getDate() - TIER_UPGRADE.EVALUATION_PERIOD_DAYS,
    );

    let upgradedCount = 0;

    for (const account of activeAccounts) {
      const snapshots = await this.dailyBalanceSnapshotRepository.find({
        where: {
          savingsAccount: { id: account.id },
          snapshotDate: MoreThan(evaluationStartDate),
        },
      });

      if (snapshots.length === 0) continue;

      const avgBalance = calculateAverageBalance(
        snapshots.map((s) => Number(s.balance)),
      );
      const accountAge = calculateMonthsBetween(account.createdAt, today);
      const isKycVerified = account.user.kycStatus === EKYCStatus.VERIFIED;

      const newTier = this.determineNewTier(
        avgBalance,
        accountAge,
        isKycVerified,
      );

      if (newTier !== account.tier) {
        await this.upgradeTier(account, newTier);
        upgradedCount++;
      }
    }

    this.logger.log(`[SUCCESS] Upgraded ${upgradedCount} accounts`);
  }

  private determineNewTier(
    avgBalance: number,
    accountAge: number,
    isKycVerified: boolean,
  ): EAccountTier {
    if (
      avgBalance >= TIER_UPGRADE.PLATINUM.MIN_BALANCE &&
      isKycVerified &&
      accountAge >= TIER_UPGRADE.PLATINUM.MIN_ACCOUNT_AGE_MONTHS
    ) {
      return EAccountTier.PLATINUM;
    } else if (
      avgBalance >= TIER_UPGRADE.GOLD.MIN_BALANCE &&
      isKycVerified &&
      accountAge >= TIER_UPGRADE.GOLD.MIN_ACCOUNT_AGE_MONTHS
    ) {
      return EAccountTier.GOLD;
    } else if (avgBalance >= TIER_UPGRADE.SILVER.MIN_BALANCE && isKycVerified) {
      return EAccountTier.SILVER;
    }
    return EAccountTier.BASIC;
  }

  private async upgradeTier(
    account: SavingsAccount,
    newTier: EAccountTier,
  ): Promise<void> {
    const oldTier = account.tier;
    account.tier = newTier;
    account.interestRate = TIER_LIMITS[newTier].interestRate;
    await this.savingsAccountRepository.save(account);

    await this.sendTierUpgradeEmail(account.user, account, oldTier, newTier);
  }

  private async sendTierUpgradeEmail(
    user: any,
    account: SavingsAccount,
    oldTier: EAccountTier,
    newTier: EAccountTier,
  ): Promise<void> {
    const previousLimits = TIER_LIMITS[oldTier];
    const newLimits = TIER_LIMITS[newTier];

    const tierOrder = [
      EAccountTier.BASIC,
      EAccountTier.SILVER,
      EAccountTier.GOLD,
      EAccountTier.PLATINUM,
    ];
    const currentIndex = tierOrder.indexOf(newTier);
    const nextTier =
      currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.TIER_UPGRADE,
      [user.email],
      {
        customerName: `${user.firstName} ${user.lastName}`,
        accountNumber: account.accountNumber,
        previousTier: oldTier.toString(),
        newTier: newTier.toString(),
        upgradeDate: new Date().toISOString(),
        interestRate: newLimits.interestRate,
        dailyDepositLimit: newLimits.dailyDeposit,
        dailyWithdrawalLimit: newLimits.dailyWithdrawal,
        monthlyWithdrawalLimit: newLimits.monthlyWithdrawal,
        currentBalance: Number(account.balance),
        previousInterestRate: previousLimits.interestRate,
        previousDailyDeposit: previousLimits.dailyDeposit,
        previousDailyWithdrawal: previousLimits.dailyWithdrawal,
        previousMonthlyWithdrawal: previousLimits.monthlyWithdrawal,
        tierClass: newTier.toLowerCase(),
        ...(nextTier && { nextTier: nextTier.toString() }),
      },
    );
  }
}
