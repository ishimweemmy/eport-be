import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { ETransactionStatus } from '@customer-service/modules/transaction/enums/transaction-status.enum';
import { QueryTransactionsDto } from '@admin-service/modules/analytics/dto/query-transactions.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditAccount)
    private readonly creditAccountRepository: Repository<CreditAccount>,
  ) {}

  async getTransactions(query: QueryTransactionsDto) {
    const { page, limit, type, status, userId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.savingsAccount', 'savingsAccount');

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('transaction.user_id = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('transaction.created_at >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.created_at <= :endDate', { endDate });
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.created_at', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return createPaginatedResponse(transactions, total, page, limit);
  }

  async getDashboardStats() {
    // Get total customers
    const totalCustomers = await this.userRepository.count({
      where: { role: EUserRole.CUSTOMER },
    });

    // Get pending loans
    const pendingLoans = await this.loanRepository.count({
      where: { approvalStatus: EApprovalStatus.PENDING_REVIEW },
    });

    // Get active loans
    const activeLoans = await this.loanRepository.count({
      where: { status: ELoanStatus.ACTIVE },
    });

    // Get defaulted loans
    const defaultedLoans = await this.loanRepository.count({
      where: { status: ELoanStatus.DEFAULTED },
    });

    // Get total loan amount disbursed (all time)
    const loanStatsResult = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.principal_amount)', 'totalDisbursed')
      .addSelect('SUM(loan.outstanding_amount)', 'totalOutstanding')
      .where('loan.status IN (:...statuses)', {
        statuses: [
          ELoanStatus.DISBURSED,
          ELoanStatus.ACTIVE,
          ELoanStatus.DEFAULTED,
        ],
      })
      .getRawOne();

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactionsResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where('transaction.status = :status', {
        status: ETransactionStatus.COMPLETED,
      })
      .andWhere('transaction.created_at >= :startDate', {
        startDate: thirtyDaysAgo,
      })
      .getRawOne();

    // Get credit utilization stats
    const creditStatsResult = await this.creditAccountRepository
      .createQueryBuilder('credit_account')
      .select('SUM(credit_account.credit_limit)', 'totalCreditLimit')
      .addSelect('SUM(credit_account.available_credit)', 'totalAvailableCredit')
      .addSelect(
        'SUM(credit_account.outstanding_balance)',
        'totalOutstandingBalance',
      )
      .getRawOne();

    // Get recent loan applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLoanApplications = await this.loanRepository
      .createQueryBuilder('loan')
      .select('DATE(loan.requested_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('loan.requested_at >= :startDate', { startDate: sevenDaysAgo })
      .groupBy('DATE(loan.requested_at)')
      .orderBy('DATE(loan.requested_at)', 'ASC')
      .getRawMany();

    return {
      customers: {
        total: totalCustomers,
      },
      loans: {
        pending: pendingLoans,
        active: activeLoans,
        defaulted: defaultedLoans,
        totalDisbursed: parseFloat(loanStatsResult?.totalDisbursed || '0'),
        totalOutstanding: parseFloat(loanStatsResult?.totalOutstanding || '0'),
      },
      transactions: {
        last30Days: {
          count: parseInt(recentTransactionsResult?.count || '0'),
          totalAmount: parseFloat(recentTransactionsResult?.totalAmount || '0'),
        },
      },
      credit: {
        totalCreditLimit: parseFloat(
          creditStatsResult?.totalCreditLimit || '0',
        ),
        totalAvailableCredit: parseFloat(
          creditStatsResult?.totalAvailableCredit || '0',
        ),
        totalOutstandingBalance: parseFloat(
          creditStatsResult?.totalOutstandingBalance || '0',
        ),
        utilizationRate:
          parseFloat(creditStatsResult?.totalCreditLimit || '0') > 0
            ? (
                ((parseFloat(creditStatsResult?.totalCreditLimit || '0') -
                  parseFloat(creditStatsResult?.totalAvailableCredit || '0')) /
                  parseFloat(creditStatsResult?.totalCreditLimit || '0')) *
                100
              ).toFixed(2)
            : '0',
      },
      recentActivity: {
        loanApplications: recentLoanApplications,
      },
    };
  }
}
