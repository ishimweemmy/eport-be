import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { Repayment } from './entities/repayment.entity';
import { User } from '../user/entities/user.entity';
import { CreditAccount } from '../credit/entities/credit-account.entity';
import { SavingsAccount } from '../savings/entities/savings-account.entity';
import { LoanRequestDto } from './dto/loan-request.dto';
import { LoanResponseDto } from './dto/loan-response.dto';
import { RepaymentDto } from './dto/repayment.dto';
import {
  RepaymentScheduleDto,
  RepaymentScheduleItemDto,
} from './dto/repayment-schedule.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _404 } from '@app/common/constants/errors-constants';
import { ELoanStatus } from './enums/loan-status.enum';
import { EApprovalStatus } from './enums/approval-status.enum';
import { ERepaymentStatus } from './enums/repayment-status.enum';
import { EKYCStatus } from '../user/enums/kyc-status.enum';
import { EAccountStatus } from '../savings/enums/account-status.enum';
import { TransactionService } from '../transaction/transaction.service';
import { SavingsService } from '../savings/savings.service';
import { CreditService } from '../credit/credit.service';
import { ETransactionType } from '../transaction/enums/transaction-type.enum';
import { NotificationPreProcessor } from '../../integrations/notification/notification.preprocessor';
import { EmailTemplates } from '../../configs/email-template-configs/email-templates.config';
import { formatCurrency } from '../../common/helpers/currency.helper';

// Interest rates by tenor (flat rate)
const INTEREST_RATES = {
  3: 5.0, // 3 months: 5%
  6: 8.0, // 6 months: 8%
  12: 12.0, // 12 months: 12%
  24: 18.0, // 24 months: 18%
};

const AUTO_APPROVAL_THRESHOLD = 50000; // RWF
const MIN_CREDIT_SCORE_AUTO = 300;
const MIN_CREDIT_SCORE_REJECT = 200;

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Repayment)
    private readonly repaymentRepository: Repository<Repayment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditAccount)
    private readonly creditAccountRepository: Repository<CreditAccount>,
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly dataSource: DataSource,
    private readonly transactionService: TransactionService,
    private readonly savingsService: SavingsService,
    private readonly creditService: CreditService,
    private readonly notificationProcessor: NotificationPreProcessor,
  ) {}

  /**
   * Resolves active savings account for loan operations
   * Priority: 1) Specified account 2) Loan's account 3) First active account
   */
  private async resolveActiveSavingsAccount(
    userId: string,
    specifiedAccountId?: string,
    loanSavingsAccount?: SavingsAccount,
  ): Promise<string> {
    // 1. User specified account - validate ownership and status
    if (specifiedAccountId) {
      const account = await this.savingsAccountRepository.findOne({
        where: { id: specifiedAccountId, user: { id: userId } },
      });
      if (!account) {
        this.exceptionHandler.throwBadRequest({
          message: 'Invalid savings account',
          code: 'INVALID_SAVINGS_ACCOUNT',
        });
      }
      if (account.status !== EAccountStatus.ACTIVE) {
        this.exceptionHandler.throwBadRequest({
          message: 'Savings account is not active',
          code: 'SAVINGS_ACCOUNT_INACTIVE',
        });
      }
      return account.id;
    }

    // 2. Loan's savings account - verify still active
    if (loanSavingsAccount) {
      const account = await this.savingsAccountRepository.findOne({
        where: { id: loanSavingsAccount.id },
      });

      if (account && account.status === EAccountStatus.ACTIVE) {
        return account.id;
      }
      // Fall through to find alternative if closed
    }

    // 3. Fallback: first active account
    const activeAccounts = await this.savingsAccountRepository.find({
      where: {
        user: { id: userId },
        status: EAccountStatus.ACTIVE,
      },
      order: { createdAt: 'ASC' },
    });

    if (!activeAccounts || activeAccounts.length === 0) {
      this.exceptionHandler.throwNotFound({
        message: 'No active savings account found',
        code: 'SAVINGS_ACCOUNT_NOT_FOUND',
      });
    }

    return activeAccounts[0].id;
  }

  async requestLoan(
    userId: string,
    dto: LoanRequestDto,
  ): Promise<LoanResponseDto> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Get credit account
    const creditAccount = await this.creditAccountRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!creditAccount) {
      this.exceptionHandler.throwNotFound({
        message: 'Credit account not found',
        code: 'CREDIT_ACCOUNT_NOT_FOUND',
      });
    }

    // Validate available credit
    if (Number(creditAccount.availableCredit) < dto.principalAmount) {
      this.exceptionHandler.throwBadRequest({
        message: 'Insufficient credit limit',
        code: 'INSUFFICIENT_CREDIT',
      });
    }

    // Check for existing defaulted loans
    const hasDefaultedLoans = await this.loanRepository.findOne({
      where: {
        user: { id: user.id },
        status: ELoanStatus.DEFAULTED,
      },
    });

    if (hasDefaultedLoans) {
      this.exceptionHandler.throwBadRequest({
        message: 'Cannot request loan with existing defaulted loans',
        code: 'EXISTING_DEFAULTED_LOANS',
      });
    }

    // Resolve savings account
    const savingsAccountId = await this.resolveActiveSavingsAccount(
      userId,
      dto.savingsAccountId,
    );

    // Calculate interest and total amount
    const interestRate = INTEREST_RATES[dto.tenorMonths];
    const totalAmount = dto.principalAmount * (1 + interestRate / 100);

    // Generate loan number
    const loanNumber = await this.generateLoanNumber();

    // Calculate due date (based on tenor)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + dto.tenorMonths);

    // Determine approval status
    const approvalStatus = this.determineApprovalStatus(
      dto.principalAmount,
      user.creditScore,
      user.kycStatus,
      hasDefaultedLoans !== null,
    );

    // Create loan
    const loan = this.loanRepository.create({
      user,
      creditAccount,
      savingsAccount: { id: savingsAccountId },
      loanNumber,
      principalAmount: dto.principalAmount,
      interestRate,
      tenorMonths: dto.tenorMonths,
      totalAmount,
      outstandingAmount: totalAmount,
      status:
        approvalStatus === EApprovalStatus.AUTO_APPROVED
          ? ELoanStatus.APPROVED
          : approvalStatus === EApprovalStatus.REJECTED
            ? ELoanStatus.REJECTED
            : ELoanStatus.PENDING,
      approvalStatus,
      requestedAt: new Date(),
      approvedAt:
        approvalStatus === EApprovalStatus.AUTO_APPROVED ? new Date() : null,
      dueDate,
      purpose: dto.purpose,
    });

    const savedLoan = await this.loanRepository.save(loan);

    // If auto-approved, generate repayment schedule and disburse immediately
    if (approvalStatus === EApprovalStatus.AUTO_APPROVED) {
      await this.generateRepaymentSchedule(savedLoan);

      // Auto-disburse by reusing existing disburseLoan method
      return this.disburseLoan(savedLoan.id);
    }

    return this.mapToResponseDto(savedLoan);
  }

  async disburseLoan(loanId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount', 'savingsAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound({
        message: 'Loan not found',
        code: 'LOAN_NOT_FOUND',
      });
    }

    if (loan.status !== ELoanStatus.APPROVED) {
      this.exceptionHandler.throwBadRequest({
        message: 'Loan is not approved',
        code: 'LOAN_NOT_APPROVED',
      });
    }

    // Resolve savings account (handles closed accounts)
    const savingsAccountId = await this.resolveActiveSavingsAccount(
      loan.user.id,
      undefined,
      loan.savingsAccount,
    );

    // Update loan if account changed (e.g., closed during manual review)
    if (loan.savingsAccount?.id !== savingsAccountId) {
      loan.savingsAccount = { id: savingsAccountId } as SavingsAccount;
      await this.loanRepository.save(loan);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create loan disbursement transaction
      const transaction = await this.transactionService.createTransaction(
        loan.user.id,
        savingsAccountId,
        ETransactionType.LOAN_DISBURSEMENT,
        Number(loan.principalAmount),
        `Loan disbursement - ${loan.loanNumber}`,
        { loanId: loan.id, loanNumber: loan.loanNumber },
      );

      // Credit savings account
      await this.savingsService.updateBalance(
        savingsAccountId,
        Number(loan.principalAmount),
        false, // credit (not debit)
      );

      // Update credit account - reduce available credit
      await this.creditService.updateAvailableCredit(
        loan.creditAccount.id,
        Number(loan.principalAmount),
        true, // is loan disbursement
      );

      // Update loan status
      loan.status = ELoanStatus.DISBURSED;
      loan.disbursedAt = new Date();
      await queryRunner.manager.save(loan);

      // Complete transaction
      await this.transactionService.completeTransaction(transaction.id);

      await queryRunner.commitTransaction();

      // Send loan disbursement email
      const repayments = await this.repaymentRepository.find({
        where: { loan: { id: loan.id } },
        order: { dueDate: 'ASC' },
      });

      if (repayments.length > 0) {
        const firstRepayment = repayments[0];
        const monthlyInstallment = Number(loan.totalAmount) / loan.tenorMonths;
        // Re-fetch account AFTER transaction to get updated balance
        const savingsAccount = await this.savingsAccountRepository.findOne({
          where: { id: savingsAccountId },
        });

        if (savingsAccount) {
          const disbursedAt = new Date().toLocaleString('en-RW', {
            timeZone: 'Africa/Kigali',
            dateStyle: 'medium',
            timeStyle: 'medium',
          });

          const firstPaymentDate = firstRepayment.dueDate.toLocaleString(
            'en-RW',
            {
              timeZone: 'Africa/Kigali',
              dateStyle: 'medium',
            },
          );

          await this.notificationProcessor.sendTemplateEmail(
            EmailTemplates.LOAN_DISBURSED,
            [loan.user.email],
            {
              customerName: `${loan.user.firstName} ${loan.user.lastName}`,
              loanNumber: loan.loanNumber,
              amount: formatCurrency(Number(loan.principalAmount)),
              accountNumber: savingsAccount.accountNumber,
              transactionReference: transaction.transactionReference,
              newBalance: formatCurrency(Number(savingsAccount.balance)),
              disbursedAt,
              firstPaymentDate,
              monthlyInstallment: formatCurrency(monthlyInstallment),
            },
          );
        }
      }

      return this.mapToResponseDto(loan);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async repayLoan(
    userId: string,
    dto: RepaymentDto,
  ): Promise<{ message: string; repaymentId: string }> {
    const loan = await this.loanRepository.findOne({
      where: {
        id: dto.loanId,
        user: { id: userId },
      },
      relations: ['user', 'creditAccount', 'savingsAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound({
        message: 'Loan not found',
        code: 'LOAN_NOT_FOUND',
      });
    }

    if (
      loan.status !== ELoanStatus.ACTIVE &&
      loan.status !== ELoanStatus.DISBURSED
    ) {
      this.exceptionHandler.throwBadRequest({
        message: 'Loan is not active',
        code: 'LOAN_NOT_ACTIVE',
      });
    }

    if (dto.amount > Number(loan.outstandingAmount)) {
      this.exceptionHandler.throwBadRequest({
        message: 'Repayment amount exceeds outstanding balance',
        code: 'AMOUNT_EXCEEDS_OUTSTANDING',
      });
    }

    // Resolve savings account for repayment
    const savingsAccountId = await this.resolveActiveSavingsAccount(
      userId,
      dto.savingsAccountId,
      loan.savingsAccount,
    );

    // Find next scheduled repayment
    let targetRepayment = await this.repaymentRepository.findOne({
      where: {
        loan: { id: loan.id },
        status: ERepaymentStatus.SCHEDULED,
      },
      order: { scheduleNumber: 'ASC' },
    });

    // If no scheduled, find overdue repayment
    if (!targetRepayment) {
      targetRepayment = await this.repaymentRepository.findOne({
        where: {
          loan: { id: loan.id },
          status: ERepaymentStatus.OVERDUE,
        },
        order: { dueDate: 'ASC' },
      });

      if (!targetRepayment) {
        this.exceptionHandler.throwBadRequest({
          message: 'No pending repayments found',
          code: 'NO_PENDING_REPAYMENTS',
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create loan repayment transaction
      const transaction = await this.transactionService.createTransaction(
        loan.user.id,
        savingsAccountId,
        ETransactionType.LOAN_REPAYMENT,
        dto.amount,
        `Loan repayment - ${loan.loanNumber}`,
        {
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          repaymentId: targetRepayment.id,
          scheduleNumber: targetRepayment.scheduleNumber,
        },
      );

      // Link transaction to repayment
      targetRepayment.transaction = transaction;

      // Track which account was used for this repayment
      targetRepayment.savingsAccount = {
        id: savingsAccountId,
      } as SavingsAccount;

      // Update repayment
      const totalDue =
        Number(targetRepayment.dueAmount) + Number(targetRepayment.lateFee);
      const currentPaid = Number(targetRepayment.amountPaid);
      const newPaid = currentPaid + dto.amount;

      targetRepayment.amountPaid = newPaid;

      if (newPaid >= totalDue) {
        targetRepayment.status = ERepaymentStatus.PAID;
        targetRepayment.paidAt = new Date();
      } else {
        targetRepayment.status = ERepaymentStatus.PARTIALLY_PAID;
      }

      await queryRunner.manager.save(targetRepayment);

      // Update loan outstanding amount
      loan.outstandingAmount = Number(loan.outstandingAmount) - dto.amount;

      // Check if loan is fully paid
      if (loan.outstandingAmount <= 0) {
        loan.status = ELoanStatus.FULLY_PAID;
      } else {
        loan.status = ELoanStatus.ACTIVE;
      }

      await queryRunner.manager.save(loan);

      // Debit savings account
      await this.savingsService.updateBalance(
        savingsAccountId,
        dto.amount,
        true, // debit
      );

      // Update credit account - increase available credit
      await this.creditService.updateAvailableCredit(
        loan.creditAccount.id,
        dto.amount,
        false, // is repayment (not loan)
      );

      // Complete transaction
      await this.transactionService.completeTransaction(transaction.id);

      await queryRunner.commitTransaction();

      // Send repayment received email
      const allRepayments = await this.repaymentRepository.find({
        where: { loan: { id: loan.id } },
        order: { scheduleNumber: 'ASC' },
      });

      const paidCount = allRepayments.filter(
        (r) => r.status === ERepaymentStatus.PAID,
      ).length;
      const totalCount = allRepayments.length;
      const progressPercentage = Math.round((paidCount / totalCount) * 100);
      const fullyPaid = Number(loan.outstandingAmount) <= 0;

      let nextPaymentDate: string | undefined;
      let nextInstallmentAmount: number | undefined;

      if (!fullyPaid) {
        const nextScheduledRepayment = await this.repaymentRepository.findOne({
          where: {
            loan: { id: loan.id },
            status: ERepaymentStatus.SCHEDULED,
          },
          order: { scheduleNumber: 'ASC' },
        });

        if (nextScheduledRepayment) {
          nextPaymentDate = nextScheduledRepayment.dueDate.toLocaleString(
            'en-RW',
            {
              timeZone: 'Africa/Kigali',
              dateStyle: 'medium',
            },
          );
          nextInstallmentAmount = Number(nextScheduledRepayment.dueAmount);
        }
      }

      const paymentDate = new Date().toLocaleString('en-RW', {
        timeZone: 'Africa/Kigali',
        dateStyle: 'medium',
        timeStyle: 'medium',
      });

      await this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.REPAYMENT_RECEIVED,
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: formatCurrency(dto.amount),
          scheduleNumber: targetRepayment.scheduleNumber,
          totalInstallments: totalCount,
          transactionReference: transaction.transactionReference,
          paymentDate,
          paymentStatus:
            targetRepayment.status === ERepaymentStatus.PAID
              ? 'PAID'
              : 'PARTIALLY PAID',
          outstandingAmount: formatCurrency(Number(loan.outstandingAmount)),
          progressPercentage,
          fullyPaid,
          nextPaymentDate,
          nextInstallmentAmount: nextInstallmentAmount
            ? formatCurrency(nextInstallmentAmount)
            : undefined,
        },
      );

      return {
        message: 'Repayment processed successfully',
        repaymentId: targetRepayment.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyLoans(userId: string): Promise<LoanResponseDto[]> {
    const loans = await this.loanRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'savingsAccount'],
      order: { createdAt: 'DESC' },
    });

    return loans.map((loan) => this.mapToResponseDto(loan));
  }

  async getLoanById(userId: string, loanId: string): Promise<LoanResponseDto> {
    const loan = await this.loanRepository.findOne({
      where: {
        id: loanId,
        user: { id: userId },
      },
      relations: ['user', 'savingsAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound({
        message: 'Loan not found',
        code: 'LOAN_NOT_FOUND',
      });
    }

    return this.mapToResponseDto(loan);
  }

  async getRepaymentSchedule(
    userId: string,
    loanId: string,
  ): Promise<RepaymentScheduleDto> {
    const loan = await this.loanRepository.findOne({
      where: {
        id: loanId,
        user: { id: userId },
      },
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound({
        message: 'Loan not found',
        code: 'LOAN_NOT_FOUND',
      });
    }

    const repayments = await this.repaymentRepository.find({
      where: { loan: { id: loan.id } },
      order: { scheduleNumber: 'ASC' },
    });

    return {
      loanNumber: loan.loanNumber,
      totalAmount: Number(loan.totalAmount),
      outstandingAmount: Number(loan.outstandingAmount),
      schedule: repayments.map((r) => this.mapToScheduleItemDto(r)),
    };
  }

  private async generateRepaymentSchedule(loan: Loan): Promise<void> {
    const monthlyInstallment = Number(loan.totalAmount) / loan.tenorMonths;

    const repayments: Repayment[] = [];

    for (let i = 1; i <= loan.tenorMonths; i++) {
      const dueDate = new Date(loan.requestedAt);
      dueDate.setMonth(dueDate.getMonth() + i);

      const repayment = this.repaymentRepository.create({
        loan,
        scheduleNumber: i,
        dueDate,
        dueAmount: monthlyInstallment,
        amountPaid: 0,
        status: ERepaymentStatus.SCHEDULED,
        lateFee: 0,
      });

      repayments.push(repayment);
    }

    await this.repaymentRepository.save(repayments);
  }

  private determineApprovalStatus(
    amount: number,
    creditScore: number,
    kycStatus: EKYCStatus,
    hasDefaulted: boolean,
  ): EApprovalStatus {
    // Auto-rejection criteria
    if (creditScore < MIN_CREDIT_SCORE_REJECT || hasDefaulted) {
      return EApprovalStatus.REJECTED;
    }

    // Auto-approval criteria
    if (
      amount <= AUTO_APPROVAL_THRESHOLD &&
      creditScore >= MIN_CREDIT_SCORE_AUTO &&
      kycStatus === EKYCStatus.VERIFIED &&
      !hasDefaulted
    ) {
      return EApprovalStatus.AUTO_APPROVED;
    }

    // Manual review required
    return EApprovalStatus.PENDING_REVIEW;
  }

  private async generateLoanNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const lastLoan = await this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.loanNumber LIKE :pattern', { pattern: `LN-${year}-%` })
      .orderBy('loan.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastLoan) {
      const lastSequence = parseInt(lastLoan.loanNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `LN-${year}-${sequence.toString().padStart(5, '0')}`;
  }

  private mapToResponseDto(loan: Loan): LoanResponseDto {
    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      principalAmount: Number(loan.principalAmount),
      interestRate: Number(loan.interestRate),
      tenorMonths: loan.tenorMonths,
      totalAmount: Number(loan.totalAmount),
      outstandingAmount: Number(loan.outstandingAmount),
      status: loan.status,
      approvalStatus: loan.approvalStatus,
      requestedAt: loan.requestedAt,
      approvedAt: loan.approvedAt,
      disbursedAt: loan.disbursedAt,
      dueDate: loan.dueDate,
      purpose: loan.purpose,
      savingsAccountId: loan.savingsAccount?.id,
      savingsAccountNumber: loan.savingsAccount?.accountNumber,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }

  private mapToScheduleItemDto(repayment: Repayment): RepaymentScheduleItemDto {
    return {
      id: repayment.id,
      scheduleNumber: repayment.scheduleNumber,
      dueDate: repayment.dueDate,
      dueAmount: Number(repayment.dueAmount),
      amountPaid: Number(repayment.amountPaid),
      status: repayment.status,
      paidAt: repayment.paidAt,
      lateFee: Number(repayment.lateFee),
    };
  }
}
