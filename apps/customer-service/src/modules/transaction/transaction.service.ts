import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { SavingsAccount } from '../savings/entities/savings-account.entity';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { ETransactionType } from './enums/transaction-type.enum';
import { ETransactionStatus } from './enums/transaction-status.enum';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { PaginatedResponse } from '@app/common/dtos/pagination.response';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async createTransaction(
    userId: string,
    savingsAccountId: string | null,
    type: ETransactionType,
    amount: number,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<Transaction> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    let savingsAccount = null;
    let balanceBefore = 0;
    let balanceAfter = 0;

    if (savingsAccountId) {
      savingsAccount = await this.savingsAccountRepository.findOne({
        where: { id: savingsAccountId },
      });

      if (!savingsAccount) {
        this.exceptionHandler.throwNotFound({
          message: 'Savings account not found',
          code: 'SAVINGS_ACCOUNT_NOT_FOUND',
        });
      }

      balanceBefore = Number(savingsAccount.balance);

      // Calculate balance after based on transaction type
      if (
        type === ETransactionType.DEPOSIT ||
        type === ETransactionType.LOAN_DISBURSEMENT ||
        type === ETransactionType.INTEREST_CREDIT
      ) {
        balanceAfter = balanceBefore + amount;
      } else if (
        type === ETransactionType.WITHDRAWAL ||
        type === ETransactionType.FEE_CHARGE
      ) {
        balanceAfter = balanceBefore - amount;
      } else {
        balanceAfter = balanceBefore;
      }
    }

    const transactionReference = await this.generateTransactionReference();

    const transaction = this.transactionRepository.create({
      user,
      savingsAccount,
      transactionReference,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      status: ETransactionStatus.PENDING,
      description,
      metadata,
    });

    return await this.transactionRepository.save(transaction);
  }

  async completeTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.exceptionHandler.throwNotFound({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    transaction.status = ETransactionStatus.COMPLETED;
    transaction.processedAt = new Date();

    return await this.transactionRepository.save(transaction);
  }

  async failTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      this.exceptionHandler.throwNotFound({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    transaction.status = ETransactionStatus.FAILED;
    transaction.processedAt = new Date();

    return await this.transactionRepository.save(transaction);
  }

  async getTransactionHistory(
    userId: string,
    filter?: TransactionFilterDto,
  ): Promise<PaginatedResponse<TransactionResponseDto>> {
    const whereClause: FindOptionsWhere<Transaction> = {
      user: { id: userId },
    };

    if (filter?.type) {
      whereClause.type = filter.type;
    }

    if (filter?.status) {
      whereClause.status = filter.status;
    }

    if (filter?.startDate && filter?.endDate) {
      whereClause.createdAt = Between(
        new Date(filter.startDate),
        new Date(filter.endDate),
      );
    }

    if (filter?.savingsAccountId) {
      whereClause.savingsAccount = { id: filter.savingsAccountId };
    }

    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: whereClause,
        relations: ['user', 'savingsAccount'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      },
    );

    const data = transactions.map((t) => this.mapToResponseDto(t));
    return createPaginatedResponse(data, total, page, limit);
  }

  async getTransactionByReference(
    userId: string,
    reference: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        transactionReference: reference,
        user: { id: userId },
      },
      relations: ['user', 'savingsAccount'],
    });

    if (!transaction) {
      this.exceptionHandler.throwNotFound({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    return this.mapToResponseDto(transaction);
  }

  async getDailyTransactionTotal(
    accountId: string,
    type: ETransactionType,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.amount)', 'total')
      .where('txn.savings_account_id = :accountId', { accountId })
      .andWhere('txn.type = :type', { type })
      .andWhere('txn.status = :status', {
        status: ETransactionStatus.COMPLETED,
      })
      .andWhere('txn.created_at >= :today', { today })
      .andWhere('txn.created_at < :tomorrow', { tomorrow })
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getMonthlyTransactionTotal(
    accountId: string,
    type: ETransactionType,
  ): Promise<number> {
    const firstDay = new Date();
    firstDay.setDate(1);
    firstDay.setHours(0, 0, 0, 0);

    const nextMonth = new Date(firstDay);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.amount)', 'total')
      .where('txn.savings_account_id = :accountId', { accountId })
      .andWhere('txn.type = :type', { type })
      .andWhere('txn.status = :status', {
        status: ETransactionStatus.COMPLETED,
      })
      .andWhere('txn.created_at >= :firstDay', { firstDay })
      .andWhere('txn.created_at < :nextMonth', { nextMonth })
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getAverageMonthlyTransactions(userId: string): Promise<number> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('AVG(txn.amount)', 'average')
      .where('txn.user_id = :userId', { userId })
      .andWhere('txn.status = :status', {
        status: ETransactionStatus.COMPLETED,
      })
      .andWhere('txn.created_at >= :threeMonthsAgo', { threeMonthsAgo })
      .getRawOne();

    return Number(result?.average || 0);
  }

  private async generateTransactionReference(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    // Get count of transactions today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const count = await this.transactionRepository.count({
      where: {
        createdAt: Between(todayStart, todayEnd),
      },
    });

    const sequence = (count + 1).toString().padStart(5, '0');

    return `TXN-${dateStr}-${sequence}`;
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      transactionReference: transaction.transactionReference,
      type: transaction.type,
      amount: Number(transaction.amount),
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      status: transaction.status,
      description: transaction.description,
      metadata: transaction.metadata,
      processedAt: transaction.processedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
