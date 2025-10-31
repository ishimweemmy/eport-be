import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionAdminResponseDto } from './dto/transaction-admin-response.dto';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';

@Injectable()
export class TransactionManagementService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  async getTransactions(query: QueryTransactionsDto) {
    const {
      page,
      limit,
      search,
      type,
      status,
      startDate,
      endDate,
      customerId,
      savingsAccountId,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.savingsAccount', 'savingsAccount')
      .where('user.role = :role', { role: EUserRole.CUSTOMER });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    }

    if (customerId) {
      queryBuilder.andWhere('transaction.user_id = :customerId', {
        customerId,
      });
    }

    if (savingsAccountId) {
      queryBuilder.andWhere(
        'transaction.savings_account_id = :savingsAccountId',
        { savingsAccountId },
      );
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR transaction.transactionReference ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    if (transactions.length === 0) {
      return createPaginatedResponse([], total, page, limit);
    }

    // Map transactions with customer info (user and savingsAccount already loaded)
    const mappedTransactions = transactions.map((transaction) => ({
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
      customerId: transaction.user.id,
      customerName: `${transaction.user.firstName} ${transaction.user.lastName}`,
      customerEmail: transaction.user.email,
      customerPhone: transaction.user.phoneNumber,
      savingsAccountId: transaction.savingsAccount?.id,
      savingsAccountNumber: transaction.savingsAccount?.accountNumber,
    }));

    return createPaginatedResponse(mappedTransactions, total, page, limit);
  }

  async getTransactionById(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'savingsAccount'],
    });

    if (!transaction) {
      this.exceptionHandler.throwNotFound({
        message: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

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
      customerId: transaction.user.id,
      customerName: `${transaction.user.firstName} ${transaction.user.lastName}`,
      customerEmail: transaction.user.email,
      customerPhone: transaction.user.phoneNumber,
      savingsAccountId: transaction.savingsAccount?.id,
      savingsAccountNumber: transaction.savingsAccount?.accountNumber,
    } as TransactionAdminResponseDto;
  }
}
