import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { SavingsAccount } from './entities/savings-account.entity';
import { User } from '../user/entities/user.entity';
import { CreateSavingsAccountDto } from './dto/create-savings-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { SavingsAccountResponseDto } from './dto/savings-account-response.dto';
import { BalanceInquiryDto } from './dto/balance-inquiry.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _404 } from '@app/common/constants/errors-constants';
import { EAccountTier } from './enums/account-tier.enum';
import { ESavingsAccountType } from './enums/savings-account-type.enum';
import { EAccountStatus } from './enums/account-status.enum';
import { TransactionService } from '../transaction/transaction.service';
import { ETransactionType } from '../transaction/enums/transaction-type.enum';
import { NotificationPreProcessor } from '../../integrations/notification/notification.preprocessor';
import { EmailTemplates } from '../../configs/email-template-configs/email-templates.config';
import { formatCurrency } from '../../common/helpers/currency.helper';
import { Loan } from '../loan/entities/loan.entity';
import { ELoanStatus } from '../loan/enums/loan-status.enum';
import { TIER_LIMITS } from './constants/tier.constants';

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(SavingsAccount)
    private readonly savingsRepository: Repository<SavingsAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private readonly notificationProcessor: NotificationPreProcessor,
  ) {}

  async createSavingsAccount(
    userId: string,
    dto: CreateSavingsAccountDto,
  ): Promise<SavingsAccountResponseDto> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Generate account number
    const accountNumber = await this.generateAccountNumber();

    const accountType = dto.accountType || ESavingsAccountType.REGULAR;
    const tier = EAccountTier.BASIC;

    // Create savings account
    const savingsAccount = this.savingsRepository.create({
      user,
      accountNumber,
      accountType,
      tier,
      balance: 0,
      interestRate: TIER_LIMITS[tier].interestRate,
      currency: 'RWF',
      status: EAccountStatus.ACTIVE,
    });

    const savedAccount = await this.savingsRepository.save(savingsAccount);

    return this.mapToResponseDto(savedAccount);
  }

  async deposit(
    userId: string,
    dto: DepositDto,
  ): Promise<SavingsAccountResponseDto> {
    const account = await this.findAccountByIdAndUserId(
      dto.savingsAccountId,
      userId,
    );

    // Check account status
    if (account.status !== EAccountStatus.ACTIVE) {
      this.exceptionHandler.throwBadRequest({
        message: 'Account is not active',
        code: 'ACCOUNT_NOT_ACTIVE',
      });
    }

    // Check daily deposit limit
    const dailyDepositTotal =
      await this.transactionService.getDailyTransactionTotal(
        account.id,
        ETransactionType.DEPOSIT,
      );
    const tierLimit = TIER_LIMITS[account.tier].dailyDeposit;

    if (dailyDepositTotal + dto.amount > tierLimit) {
      this.exceptionHandler.throwBadRequest({
        message: `Daily deposit limit of ${tierLimit} RWF exceeded for ${account.tier} tier`,
        code: 'DAILY_DEPOSIT_LIMIT_EXCEEDED',
      });
    }

    // Update balance and create transaction using database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balanceBefore = Number(account.balance);

      // Create transaction record
      const transaction = await this.transactionService.createTransaction(
        account.user.id,
        account.id,
        ETransactionType.DEPOSIT,
        dto.amount,
        dto.description || 'Deposit',
      );

      // Update balance
      account.balance = Number(account.balance) + dto.amount;
      await queryRunner.manager.save(account);

      // Complete transaction
      await this.transactionService.completeTransaction(transaction.id);

      await queryRunner.commitTransaction();

      // Send deposit success email
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        const timestamp = new Date().toLocaleString('en-RW', {
          timeZone: 'Africa/Kigali',
          dateStyle: 'medium',
          timeStyle: 'medium',
        });

        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.DEPOSIT_SUCCESS,
          [user.email],
          {
            customerName: `${user.firstName} ${user.lastName}`,
            amount: formatCurrency(dto.amount),
            transactionReference: transaction.transactionReference,
            accountNumber: account.accountNumber,
            balanceBefore: formatCurrency(balanceBefore),
            balanceAfter: formatCurrency(Number(account.balance)),
            timestamp,
          },
        );
      }

      return this.mapToResponseDto(account);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(
    userId: string,
    dto: WithdrawDto,
  ): Promise<SavingsAccountResponseDto> {
    const account = await this.findAccountByIdAndUserId(
      dto.savingsAccountId,
      userId,
    );

    // Check account status
    if (account.status !== EAccountStatus.ACTIVE) {
      this.exceptionHandler.throwBadRequest({
        message: 'Account is not active',
        code: 'ACCOUNT_NOT_ACTIVE',
      });
    }

    // Check sufficient balance
    if (Number(account.balance) < dto.amount) {
      this.exceptionHandler.throwBadRequest(_400.INSUFFICIENT_BALANCE);
    }

    // Check daily withdrawal limit
    const dailyWithdrawalTotal =
      await this.transactionService.getDailyTransactionTotal(
        account.id,
        ETransactionType.WITHDRAWAL,
      );
    const dailyLimit = TIER_LIMITS[account.tier].dailyWithdrawal;

    if (dailyWithdrawalTotal + dto.amount > dailyLimit) {
      this.exceptionHandler.throwBadRequest({
        message: `Daily withdrawal limit of ${dailyLimit} RWF exceeded for ${account.tier} tier`,
        code: 'DAILY_WITHDRAWAL_LIMIT_EXCEEDED',
      });
    }

    // Check monthly withdrawal limit
    const monthlyWithdrawalTotal =
      await this.transactionService.getMonthlyTransactionTotal(
        account.id,
        ETransactionType.WITHDRAWAL,
      );
    const monthlyLimit = TIER_LIMITS[account.tier].monthlyWithdrawal;

    if (monthlyWithdrawalTotal + dto.amount > monthlyLimit) {
      this.exceptionHandler.throwBadRequest({
        message: `Monthly withdrawal limit of ${monthlyLimit} RWF exceeded for ${account.tier} tier`,
        code: 'MONTHLY_WITHDRAWAL_LIMIT_EXCEEDED',
      });
    }

    // Update balance and create transaction using database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const balanceBefore = Number(account.balance);

      // Create transaction record
      const transaction = await this.transactionService.createTransaction(
        account.user.id,
        account.id,
        ETransactionType.WITHDRAWAL,
        dto.amount,
        dto.description || 'Withdrawal',
      );

      // Update balance
      account.balance = Number(account.balance) - dto.amount;
      await queryRunner.manager.save(account);

      // Complete transaction
      await this.transactionService.completeTransaction(transaction.id);

      await queryRunner.commitTransaction();

      // Send withdrawal success email
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (user) {
        const timestamp = new Date().toLocaleString('en-RW', {
          timeZone: 'Africa/Kigali',
          dateStyle: 'medium',
          timeStyle: 'medium',
        });

        await this.notificationProcessor.sendTemplateEmail(
          EmailTemplates.WITHDRAWAL_SUCCESS,
          [user.email],
          {
            customerName: `${user.firstName} ${user.lastName}`,
            amount: formatCurrency(dto.amount),
            transactionReference: transaction.transactionReference,
            accountNumber: account.accountNumber,
            balanceBefore: formatCurrency(balanceBefore),
            balanceAfter: formatCurrency(Number(account.balance)),
            timestamp,
          },
        );
      }

      return this.mapToResponseDto(account);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(
    userId: string,
    accountId: string,
  ): Promise<BalanceInquiryDto> {
    const account = await this.findAccountByIdAndUserId(accountId, userId);

    return {
      accountNumber: account.accountNumber,
      balance: Number(account.balance),
      availableBalance: Number(account.balance),
      currency: account.currency,
    };
  }

  async getAccountsByUserId(
    userId: string,
  ): Promise<SavingsAccountResponseDto[]> {
    const accounts = await this.savingsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return accounts.map((account) => this.mapToResponseDto(account));
  }

  async getAccountById(
    userId: string,
    accountId: string,
  ): Promise<SavingsAccountResponseDto> {
    const account = await this.findAccountByIdAndUserId(accountId, userId);
    return this.mapToResponseDto(account);
  }

  async findAccountById(accountId: string): Promise<SavingsAccount> {
    const account = await this.savingsRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      this.exceptionHandler.throwNotFound({
        message: 'Savings account not found',
        code: 'SAVINGS_ACCOUNT_NOT_FOUND',
      });
    }

    return account;
  }

  async updateBalance(
    accountId: string,
    amount: number,
    isDebit: boolean,
  ): Promise<void> {
    const account = await this.findAccountById(accountId);

    if (isDebit) {
      if (Number(account.balance) < amount) {
        this.exceptionHandler.throwBadRequest(_400.INSUFFICIENT_BALANCE);
      }
      account.balance = Number(account.balance) - amount;
    } else {
      account.balance = Number(account.balance) + amount;
    }

    await this.savingsRepository.save(account);
  }

  async getTotalSavingsBalance(userId: string): Promise<number> {
    const result = await this.savingsRepository
      .createQueryBuilder('sa')
      .select('SUM(sa.balance)', 'total')
      .where('sa.user_id = :userId', { userId })
      .andWhere('sa.status = :status', { status: EAccountStatus.ACTIVE })
      .getRawOne();

    return Number(result?.total || 0);
  }

  async closeSavingsAccount(userId: string, accountId: string): Promise<void> {
    const account = await this.findAccountByIdAndUserId(accountId, userId);

    // CHECK 1: Cannot close last active account
    const activeAccountCount = await this.savingsRepository.count({
      where: {
        user: { id: userId },
        status: EAccountStatus.ACTIVE,
      },
    });

    if (activeAccountCount <= 1) {
      this.exceptionHandler.throwBadRequest({
        message: 'Cannot close your only active account',
        code: 'CANNOT_CLOSE_LAST_ACCOUNT',
      });
    }

    // CHECK 2: No active loans on this account
    const activeLoans = await this.dataSource.getRepository(Loan).count({
      where: {
        savingsAccount: { id: accountId },
        status: In([
          ELoanStatus.PENDING,
          ELoanStatus.APPROVED,
          ELoanStatus.DISBURSED,
          ELoanStatus.ACTIVE,
        ]),
      },
    });

    if (activeLoans > 0) {
      this.exceptionHandler.throwBadRequest({
        message: 'Cannot close account with active loans',
        code: 'ACCOUNT_HAS_ACTIVE_LOANS',
      });
    }

    // CHECK 3: Balance must be zero
    if (Number(account.balance) > 0) {
      this.exceptionHandler.throwBadRequest({
        message:
          'Cannot close account with remaining balance. Withdraw funds first.',
        code: 'ACCOUNT_HAS_BALANCE',
      });
    }

    account.status = EAccountStatus.CLOSED;
    await this.savingsRepository.save(account);
  }

  private async findAccountByIdAndUserId(
    accountId: string,
    userId: string,
  ): Promise<SavingsAccount> {
    const account = await this.savingsRepository.findOne({
      where: {
        id: accountId,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!account) {
      this.exceptionHandler.throwNotFound({
        message: 'Savings account not found',
        code: 'SAVINGS_ACCOUNT_NOT_FOUND',
      });
    }

    return account;
  }

  private async generateAccountNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Get the last account number for this year
    const lastAccount = await this.savingsRepository
      .createQueryBuilder('account')
      .where('account.accountNumber LIKE :pattern', {
        pattern: `SAV-%-${year}`,
      })
      .orderBy('account.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastAccount) {
      const parts = lastAccount.accountNumber.split('-');
      const lastSequence = parseInt(parts[1]);
      sequence = lastSequence + 1;
    }

    return `SAV-${sequence.toString().padStart(3, '0')}-${year}`;
  }

  private mapToResponseDto(account: SavingsAccount): SavingsAccountResponseDto {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      tier: account.tier,
      balance: Number(account.balance),
      interestRate: Number(account.interestRate),
      currency: account.currency,
      status: account.status,
      lastInterestCalculationDate: account.lastInterestCalculationDate,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
