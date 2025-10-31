import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditAccount } from './entities/credit-account.entity';
import { User } from '../user/entities/user.entity';
import { CreditAccountResponseDto } from './dto/credit-account-response.dto';
import { CreditAvailabilityDto } from './dto/credit-availability.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';

const MIN_CREDIT_LIMIT = 50000; // RWF
const MAX_CREDIT_LIMIT = 10000000; // RWF

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(CreditAccount)
    private readonly creditRepository: Repository<CreditAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createCreditAccount(
    userId: string,
    initialLimit: number = MIN_CREDIT_LIMIT,
  ): Promise<CreditAccountResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Generate account number
    const accountNumber = await this.generateAccountNumber();

    // Ensure limit is within bounds
    const creditLimit = Math.max(
      MIN_CREDIT_LIMIT,
      Math.min(initialLimit, MAX_CREDIT_LIMIT),
    );

    const creditAccount = this.creditRepository.create({
      user,
      accountNumber,
      creditLimit,
      availableCredit: creditLimit,
      totalBorrowed: 0,
      totalRepaid: 0,
      outstandingBalance: 0,
      status: EAccountStatus.ACTIVE,
    });

    const savedAccount = await this.creditRepository.save(creditAccount);

    return this.mapToResponseDto(savedAccount);
  }

  async calculateCreditLimit(
    userId: string,
    totalSavingsBalance: number,
    avgMonthlyTransactions: number,
  ): Promise<number> {
    // Risk-based formula: (totalSavingsBalance × 2) + (avgMonthlyTransactions × 3)
    const calculatedLimit =
      totalSavingsBalance * 2 + avgMonthlyTransactions * 3;

    // Apply min/max bounds
    return Math.max(
      MIN_CREDIT_LIMIT,
      Math.min(calculatedLimit, MAX_CREDIT_LIMIT),
    );
  }

  async updateCreditLimit(
    userId: string,
    newLimit: number,
  ): Promise<CreditAccountResponseDto> {
    const creditAccount = await this.findByUserId(userId);

    // Calculate currently borrowed/utilized amount
    const borrowed =
      Number(creditAccount.totalBorrowed) - Number(creditAccount.totalRepaid);

    // Validate new limit is not less than borrowed amount
    if (newLimit < borrowed) {
      this.exceptionHandler.throwBadRequest({
        message: `New credit limit (${newLimit}) cannot be less than currently borrowed amount (${borrowed})`,
        code: 'INVALID_CREDIT_LIMIT',
      });
    }

    // Ensure limit is within bounds
    const boundedLimit = Math.max(
      MIN_CREDIT_LIMIT,
      Math.min(newLimit, MAX_CREDIT_LIMIT),
    );

    creditAccount.creditLimit = boundedLimit;

    // Update available credit (maintain the same borrowed amount)
    creditAccount.availableCredit = boundedLimit - borrowed;

    const savedAccount = await this.creditRepository.save(creditAccount);

    return this.mapToResponseDto(savedAccount);
  }

  async getCreditAvailability(userId: string): Promise<CreditAvailabilityDto> {
    const creditAccount = await this.findByUserId(userId);

    const utilizationPercentage =
      Number(creditAccount.creditLimit) > 0
        ? (Number(creditAccount.outstandingBalance) /
            Number(creditAccount.creditLimit)) *
          100
        : 0;

    return {
      accountNumber: creditAccount.accountNumber,
      creditLimit: Number(creditAccount.creditLimit),
      availableCredit: Number(creditAccount.availableCredit),
      outstandingBalance: Number(creditAccount.outstandingBalance),
      utilizationPercentage: Number(utilizationPercentage.toFixed(2)),
    };
  }

  async getCreditAccount(userId: string): Promise<CreditAccountResponseDto> {
    const creditAccount = await this.findByUserId(userId);
    return this.mapToResponseDto(creditAccount);
  }

  async findByUserId(userId: string): Promise<CreditAccount> {
    const creditAccount = await this.creditRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!creditAccount) {
      this.exceptionHandler.throwNotFound({
        message: 'Credit account not found',
        code: 'CREDIT_ACCOUNT_NOT_FOUND',
      });
    }

    return creditAccount;
  }

  async findById(id: string): Promise<CreditAccount> {
    const creditAccount = await this.creditRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!creditAccount) {
      this.exceptionHandler.throwNotFound({
        message: 'Credit account not found',
        code: 'CREDIT_ACCOUNT_NOT_FOUND',
      });
    }

    return creditAccount;
  }

  async updateAvailableCredit(
    accountId: string,
    amount: number,
    isLoan: boolean,
  ): Promise<void> {
    const account = await this.findById(accountId);

    if (isLoan) {
      // Loan disbursement - reduce available credit, increase borrowed and outstanding
      account.availableCredit = Number(account.availableCredit) - amount;
      account.totalBorrowed = Number(account.totalBorrowed) + amount;
      account.outstandingBalance = Number(account.outstandingBalance) + amount;
    } else {
      // Loan repayment - increase available credit, increase repaid, decrease outstanding
      account.availableCredit = Number(account.availableCredit) + amount;
      account.totalRepaid = Number(account.totalRepaid) + amount;
      account.outstandingBalance = Number(account.outstandingBalance) - amount;
    }

    await this.creditRepository.save(account);
  }

  private async generateAccountNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Get the last account number for this year
    const lastAccount = await this.creditRepository
      .createQueryBuilder('account')
      .where('account.accountNumber LIKE :pattern', {
        pattern: `CRD-%-${year}`,
      })
      .orderBy('account.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastAccount) {
      const parts = lastAccount.accountNumber.split('-');
      const lastSequence = parseInt(parts[1]);
      sequence = lastSequence + 1;
    }

    return `CRD-${sequence.toString().padStart(3, '0')}-${year}`;
  }

  private mapToResponseDto(account: CreditAccount): CreditAccountResponseDto {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      creditLimit: Number(account.creditLimit),
      availableCredit: Number(account.availableCredit),
      totalBorrowed: Number(account.totalBorrowed),
      totalRepaid: Number(account.totalRepaid),
      outstandingBalance: Number(account.outstandingBalance),
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
