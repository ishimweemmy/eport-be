import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { Repayment } from '@customer-service/modules/loan/entities/repayment.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { ERepaymentStatus } from '@customer-service/modules/loan/enums/repayment-status.enum';
import { NotificationPreProcessor } from '@crons-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@customer-service/configs/email-template-configs/email-templates.config';
import { RepaymentQueries } from '@crons-service/modules/banking/repositories/repayment.queries';
import { calculateDaysBetween } from '@crons-service/modules/banking/helpers/banking.helpers';
import { calculateLateFee } from '@crons-service/modules/banking/helpers/late-fee.helper';
import {
  LATE_FEE,
  CREDIT_SCORE,
  REPAYMENT_REMINDER,
} from '@crons-service/modules/banking/constants/banking.constants';

@Injectable()
export class LoanCronService {
  private readonly logger = new Logger(LoanCronService.name);
  private readonly repaymentQueries: RepaymentQueries;

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Repayment)
    private readonly repaymentRepository: Repository<Repayment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationPreProcessor: NotificationPreProcessor,
  ) {
    this.repaymentQueries = new RepaymentQueries(repaymentRepository);
  }

  async markOverdueRepayments(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueRepayments =
      await this.repaymentQueries.findOverdueRepayments(today);

    this.logger.log(
      `[INFO] Found ${overdueRepayments.length} overdue repayments`,
    );

    for (const repayment of overdueRepayments) {
      repayment.status = ERepaymentStatus.OVERDUE;
      await this.repaymentRepository.save(repayment);

      await this.sendGracePeriodEmail(
        repayment.loan.user,
        repayment,
        repayment.loan,
      );
    }

    this.logger.log(
      `[SUCCESS] Marked ${overdueRepayments.length} repayments as overdue`,
    );
  }

  async applyLateFees(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueRepayments =
      await this.repaymentQueries.findOverdueRepaymentsWithStatus();

    this.logger.log(
      `[INFO] Checking ${overdueRepayments.length} overdue repayments for late fees`,
    );

    let appliedCount = 0;
    for (const repayment of overdueRepayments) {
      const dueDate = new Date(repayment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = calculateDaysBetween(dueDate, today);

      const lateFee = calculateLateFee(
        daysOverdue,
        Number(repayment.dueAmount),
        Number(repayment.loan.principalAmount),
      );

      if (lateFee > 0) {
        repayment.lateFee = lateFee;
        await this.repaymentRepository.save(repayment);

        await this.sendLateFeeEmail(
          repayment.loan.user,
          repayment,
          repayment.loan,
          lateFee,
          daysOverdue,
        );

        appliedCount++;
      }
    }

    this.logger.log(
      `[SUCCESS] Applied late fees to ${appliedCount} repayments`,
    );
  }

  async defaultLoans(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueRepayments =
      await this.repaymentQueries.findOverdueRepaymentsWithStatus();

    const loansToDefault = new Map<
      string,
      { loan: Loan; daysOverdue: number }
    >();

    for (const repayment of overdueRepayments) {
      const dueDate = new Date(repayment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysOverdue = calculateDaysBetween(dueDate, today);

      if (
        daysOverdue >= LATE_FEE.DEFAULT_THRESHOLD_DAYS &&
        repayment.loan.status !== ELoanStatus.DEFAULTED
      ) {
        if (!loansToDefault.has(repayment.loan.id)) {
          loansToDefault.set(repayment.loan.id, {
            loan: repayment.loan,
            daysOverdue,
          });
        }
      }
    }

    this.logger.log(
      `[INFO] Found ${loansToDefault.size} loans to mark as defaulted`,
    );

    let defaultedCount = 0;
    for (const { loan } of loansToDefault.values()) {
      loan.status = ELoanStatus.DEFAULTED;
      await this.loanRepository.save(loan);

      if (
        loan.user.creditScore !== null &&
        loan.user.creditScore !== undefined
      ) {
        loan.user.creditScore = Math.max(
          CREDIT_SCORE.MIN_SCORE,
          loan.user.creditScore - CREDIT_SCORE.DEFAULT_PENALTY,
        );
        await this.userRepository.save(loan.user);
      }

      await this.sendDefaultEmail(loan.user, loan);
      defaultedCount++;
    }

    this.logger.log(`[SUCCESS] Marked ${defaultedCount} loans as defaulted`);
  }

  async sendRepaymentReminders(): Promise<void> {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(
      targetDate.getDate() + REPAYMENT_REMINDER.DAYS_BEFORE_DUE,
    );

    const upcomingRepayments =
      await this.repaymentQueries.findUpcomingRepayments(targetDate);

    this.logger.log(
      `[INFO] Sending reminders for ${upcomingRepayments.length} upcoming repayments`,
    );

    let sentCount = 0;
    for (const repayment of upcomingRepayments) {
      await this.sendRepaymentReminderEmail(
        repayment.loan.user,
        repayment,
        repayment.loan,
      );
      sentCount++;
    }

    this.logger.log(`[SUCCESS] Sent ${sentCount} repayment reminders`);
  }

  private async sendGracePeriodEmail(
    user: User,
    repayment: Repayment,
    loan: Loan,
  ): Promise<void> {
    const daysOverdue = calculateDaysBetween(
      new Date(repayment.dueDate),
      new Date(),
    );

    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.PAYMENT_OVERDUE,
      [user.email],
      {
        customerName: `${user.firstName} ${user.lastName}`,
        loanNumber: loan.loanNumber,
        dueAmount: Number(repayment.dueAmount),
        daysOverdue,
        lateFee: 0,
        totalDue: Number(repayment.dueAmount),
        scheduleNumber: repayment.scheduleNumber,
        outstandingAmount: Number(loan.outstandingAmount),
      },
    );
  }

  private async sendLateFeeEmail(
    user: User,
    repayment: Repayment,
    loan: Loan,
    lateFee: number,
    daysOverdue: number,
  ): Promise<void> {
    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.LATE_FEE_APPLIED,
      [user.email],
      {
        customerName: `${user.firstName} ${user.lastName}`,
        loanNumber: loan.loanNumber,
        dueAmount: Number(repayment.dueAmount),
        lateFee,
        totalDue: Number(repayment.dueAmount) + lateFee,
        dueDate: new Date(repayment.dueDate).toISOString(),
        daysOverdue,
      },
    );
  }

  private async sendDefaultEmail(user: User, loan: Loan): Promise<void> {
    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.LOAN_DEFAULTED,
      [user.email],
      {
        customerName: `${user.firstName} ${user.lastName}`,
        loanNumber: loan.loanNumber,
        daysOverdue: LATE_FEE.DEFAULT_THRESHOLD_DAYS,
        totalDue: Number(loan.outstandingAmount),
        outstandingAmount: Number(loan.outstandingAmount),
        defaultDate: new Date().toISOString(),
        creditScoreImpact: CREDIT_SCORE.DEFAULT_PENALTY,
      },
    );
  }

  private async sendRepaymentReminderEmail(
    user: User,
    repayment: Repayment,
    loan: Loan,
  ): Promise<void> {
    await this.notificationPreProcessor.sendTemplateEmail(
      EmailTemplates.REPAYMENT_DUE,
      [user.email],
      {
        customerName: `${user.firstName} ${user.lastName}`,
        loanNumber: loan.loanNumber,
        dueAmount: Number(repayment.dueAmount),
        dueDate: new Date(repayment.dueDate).toISOString(),
        scheduleNumber: repayment.scheduleNumber,
        outstandingAmount: Number(loan.outstandingAmount),
        gracePeriod: LATE_FEE.GRACE_PERIOD_DAYS,
      },
    );
  }
}
