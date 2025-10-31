import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SavingsCronService } from '@crons-service/modules/banking/services/savings-cron.service';
import { LoanCronService } from '@crons-service/modules/banking/services/loan-cron.service';
import { TierCronService } from '@crons-service/modules/banking/services/tier-cron.service';
import { CRON_JOBS } from '@crons-service/modules/banking/constants/cron-jobs.config';
import { runCronJob } from '@crons-service/modules/banking/helpers/cron-runner.helper';

@Injectable()
export class BankingCronService {
  private readonly logger = new Logger(BankingCronService.name);

  constructor(
    private readonly savingsService: SavingsCronService,
    private readonly loanService: LoanCronService,
    private readonly tierService: TierCronService,
  ) {}

  @Cron(CRON_JOBS.INTEREST_ACCRUAL.schedule, {
    name: CRON_JOBS.INTEREST_ACCRUAL.name,
    timeZone: CRON_JOBS.INTEREST_ACCRUAL.timeZone,
  })
  async handleInterestAccrual() {
    await runCronJob('InterestAccrualJob', this.logger, async () => {
      await this.savingsService.applyDailyInterest();
    });
  }

  @Cron(CRON_JOBS.LOAN_OVERDUE_CHECK.schedule, {
    name: CRON_JOBS.LOAN_OVERDUE_CHECK.name,
    timeZone: CRON_JOBS.LOAN_OVERDUE_CHECK.timeZone,
  })
  async handleLoanOverdueCheck() {
    await runCronJob('LoanOverdueCheckJob', this.logger, async () => {
      await this.loanService.markOverdueRepayments();
    });
  }

  @Cron(CRON_JOBS.LATE_FEE_APPLICATION.schedule, {
    name: CRON_JOBS.LATE_FEE_APPLICATION.name,
    timeZone: CRON_JOBS.LATE_FEE_APPLICATION.timeZone,
  })
  async handleLateFeeApplication() {
    await runCronJob('LateFeeApplicationJob', this.logger, async () => {
      await this.loanService.applyLateFees();
    });
  }

  @Cron(CRON_JOBS.LOAN_DEFAULTING.schedule, {
    name: CRON_JOBS.LOAN_DEFAULTING.name,
    timeZone: CRON_JOBS.LOAN_DEFAULTING.timeZone,
  })
  async handleLoanDefaulting() {
    await runCronJob('LoanDefaultingJob', this.logger, async () => {
      await this.loanService.defaultLoans();
    });
  }

  @Cron(CRON_JOBS.TIER_UPGRADE_EVALUATION.schedule, {
    name: CRON_JOBS.TIER_UPGRADE_EVALUATION.name,
    timeZone: CRON_JOBS.TIER_UPGRADE_EVALUATION.timeZone,
  })
  async handleTierUpgradeEvaluation() {
    await runCronJob('TierUpgradeEvaluationJob', this.logger, async () => {
      await this.tierService.evaluateUpgrades();
    });
  }

  @Cron(CRON_JOBS.REPAYMENT_REMINDER.schedule, {
    name: CRON_JOBS.REPAYMENT_REMINDER.name,
    timeZone: CRON_JOBS.REPAYMENT_REMINDER.timeZone,
  })
  async handleRepaymentReminder() {
    await runCronJob('RepaymentReminderJob', this.logger, async () => {
      await this.loanService.sendRepaymentReminders();
    });
  }
}
