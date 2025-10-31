import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400 } from '@app/common/constants/errors-constants';
import { AdminActionLogService } from '@admin-service/modules/admin-action-log/admin-action-log.service';
import { EAdminActionType } from '@admin-service/modules/admin-action-log/entities/admin-action-log.entity';
import { NotificationGrpcService } from '@admin-service/integrations/notification/notification-grpc.service';
import { QueryCustomersDto } from '@admin-service/modules/customer-management/dto/query-customers.dto';
import {
  SuspendCustomerDto,
  UnsuspendCustomerDto,
  UpdateCreditLimitDto,
  UpdateCreditScoreDto,
} from '@admin-service/modules/customer-management/dto/update-customer.dto';
import { createPaginatedResponse } from '@app/common/helpers/pagination.helper';
import { CreditService } from '@customer-service/modules/credit/credit.service';

@Injectable()
export class CustomerManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditAccount)
    private readonly creditAccountRepository: Repository<CreditAccount>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(SavingsAccount)
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly creditService: CreditService,
    private readonly adminActionLogService: AdminActionLogService,
    private readonly notificationGrpcService: NotificationGrpcService,
  ) {}

  async getCustomers(query: QueryCustomersDto) {
    const { page, limit, search, status, kycStatus } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: EUserRole.CUSTOMER });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.customerId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (kycStatus) {
      queryBuilder.andWhere('user.kycStatus = :kycStatus', { kycStatus });
    }

    const [customers, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // If no customers, return early
    if (customers.length === 0) {
      return createPaginatedResponse([], total, page, limit);
    }

    // Get user IDs for related queries
    const userIds = customers.map((c) => c.id);

    // Fetch credit accounts for these users
    const creditAccounts = await this.creditAccountRepository.find({
      where: { user: { id: In(userIds) } },
      relations: ['user'],
    });

    // Fetch loans for these users
    const loans = await this.loanRepository.find({
      where: { user: { id: In(userIds) } },
      relations: ['user'],
    });

    // Fetch savings accounts for these users
    const savingsAccounts = await this.savingsAccountRepository.find({
      where: { user: { id: In(userIds) } },
      relations: ['user'],
    });

    // Map customers to include credit account and aggregate data
    const mappedCustomers = customers.map((customer) => {
      const creditAccount = creditAccounts.find(
        (ca) => ca.user.id === customer.id,
      );
      const customerLoans = loans.filter((l) => l.user.id === customer.id);
      const customerSavings = savingsAccounts.filter(
        (sa) => sa.user.id === customer.id,
      );

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        status: customer.status,
        role: customer.role,
        creditScore: customer.creditScore,
        kycStatus: customer.kycStatus,
        creditAccountId: creditAccount?.id,
        creditLimit: creditAccount?.creditLimit,
        availableCredit: creditAccount?.availableCredit,
        usedCredit: creditAccount
          ? Number(creditAccount.totalBorrowed) -
            Number(creditAccount.totalRepaid)
          : 0,
        totalLoans: customerLoans.length,
        activeLoans: customerLoans.filter(
          (loan) => loan.status === 'ACTIVE' || loan.status === 'DISBURSED',
        ).length,
        defaultedLoans: customerLoans.filter(
          (loan) => loan.status === 'DEFAULTED',
        ).length,
        fullyPaidLoans: customerLoans.filter(
          (loan) => loan.status === 'FULLY_PAID',
        ).length,
        totalSavingsAccounts: customerSavings.length,
        totalSavingsBalance: customerSavings.reduce(
          (sum, acc) => sum + Number(acc.balance),
          0,
        ),
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };
    });

    return createPaginatedResponse(mappedCustomers, total, page, limit);
  }

  async getCustomerById(customerId: string) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Get credit account
    const creditAccount = await this.creditAccountRepository.findOne({
      where: { user: { id: customerId } },
    });

    // Get recent action logs
    const actionLogs = await this.adminActionLogService.findByTarget(
      customerId,
      'User',
    );

    return {
      customer,
      creditAccount,
      recentActions: actionLogs.slice(0, 10), // Last 10 actions
    };
  }

  async suspendCustomer(
    customerId: string,
    adminId: string,
    dto: SuspendCustomerDto,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    if (customer.status === EUserStatus.SUSPENDED) {
      this.exceptionHandler.throwBadRequest(_400.CUSTOMER_ALREADY_SUSPENDED);
    }

    // Update customer status
    customer.status = EUserStatus.SUSPENDED;
    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CUSTOMER_SUSPENDED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        previousStatus: EUserStatus.ACTIVE,
        reason: dto.reason,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'account-suspended',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          reason: dto.reason,
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send suspension notification:', error);
    }

    return customer;
  }

  async unsuspendCustomer(
    customerId: string,
    adminId: string,
    dto: UnsuspendCustomerDto,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    if (customer.status !== EUserStatus.SUSPENDED) {
      this.exceptionHandler.throwBadRequest(_400.CUSTOMER_NOT_SUSPENDED);
    }

    // Update customer status
    customer.status = EUserStatus.ACTIVE;
    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CUSTOMER_UNSUSPENDED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        previousStatus: EUserStatus.SUSPENDED,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'account-unsuspended',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send unsuspension notification:', error);
    }

    return customer;
  }

  async updateCreditLimit(
    customerId: string,
    adminId: string,
    dto: UpdateCreditLimitDto,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Get credit account to get old limit for logging
    const creditAccount = await this.creditAccountRepository.findOne({
      where: { user: { id: customerId } },
    });

    if (!creditAccount) {
      this.exceptionHandler.throwNotFound(_404.CREDIT_ACCOUNT_NOT_FOUND);
    }

    const oldLimit = Number(creditAccount.creditLimit);

    // Use customer-service CreditService to handle update (includes validation)
    const updatedCredit = await this.creditService.updateCreditLimit(
      customerId,
      dto.newLimit,
    );

    // Admin-specific: Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CREDIT_LIMIT_UPDATED,
      adminId,
      targetId: creditAccount.id,
      targetType: 'CreditAccount',
      metadata: {
        customerId: customer.customerId,
        oldLimit: oldLimit.toString(),
        newLimit: dto.newLimit.toString(),
        reason: dto.reason,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'credit-limit-updated',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          oldLimit: oldLimit.toString(),
          newLimit: dto.newLimit.toString(),
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send credit limit update notification:', error);
    }

    return { customer, creditAccount: updatedCredit };
  }

  async updateCreditScore(
    customerId: string,
    adminId: string,
    dto: UpdateCreditScoreDto,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    const oldScore = customer.creditScore;
    customer.creditScore = dto.newScore;

    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CREDIT_SCORE_UPDATED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        oldScore: oldScore.toString(),
        newScore: dto.newScore.toString(),
        reason: dto.reason,
      },
      notes: dto.notes,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'credit-score-updated',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          oldScore: oldScore.toString(),
          newScore: dto.newScore.toString(),
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send credit score update notification:', error);
    }

    return customer;
  }
}
