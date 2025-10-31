import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CustomerManagementService } from './customer-management.service';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { CreditService } from '@customer-service/modules/credit/credit.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { AdminActionLogService } from '@admin-service/modules/admin-action-log/admin-action-log.service';
import { NotificationGrpcService } from '@admin-service/integrations/notification/notification-grpc.service';
import { QueryCustomersDto } from '@admin-service/modules/customer-management/dto/query-customers.dto';
import {
  SuspendCustomerDto,
  UnsuspendCustomerDto,
  UpdateCreditLimitDto,
  UpdateCreditScoreDto,
} from '@admin-service/modules/customer-management/dto/update-customer.dto';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';
import { _404, _400 } from '@app/common/constants/errors-constants';

describe('CustomerManagementService', () => {
  let service: CustomerManagementService;
  let userRepository: jest.Mocked<Repository<User>>;
  let creditAccountRepository: jest.Mocked<Repository<CreditAccount>>;
  let creditService: jest.Mocked<CreditService>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let adminActionLogService: jest.Mocked<AdminActionLogService>;
  let notificationGrpcService: jest.Mocked<NotificationGrpcService>;

  const mockCustomer = {
    id: 'user-123',
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    customerId: 'CJ000001',
    role: EUserRole.CUSTOMER,
    status: EUserStatus.ACTIVE,
    kycStatus: EKYCStatus.VERIFIED,
    creditScore: 750,
    phoneNumber: '+250788000000',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreditAccount = {
    id: 'credit-123',
    user: mockCustomer,
    creditLimit: 500000,
    availableCredit: 500000,
    utilizedCredit: 0,
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerManagementService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(CreditAccount),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CreditService,
          useValue: {
            updateCreditLimit: jest.fn(),
          },
        },
        {
          provide: ExceptionHandler,
          useValue: {
            throwNotFound: jest.fn().mockImplementation((error) => {
              throw new Error(error.message);
            }),
            throwBadRequest: jest.fn().mockImplementation((error) => {
              throw new Error(error.message);
            }),
          },
        },
        {
          provide: AdminActionLogService,
          useValue: {
            logAction: jest.fn(),
            findByTarget: jest.fn(),
          },
        },
        {
          provide: NotificationGrpcService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerManagementService>(CustomerManagementService);
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
    creditAccountRepository = module.get(
      getRepositoryToken(CreditAccount),
    ) as jest.Mocked<Repository<CreditAccount>>;
    creditService = module.get(CreditService) as jest.Mocked<CreditService>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    adminActionLogService = module.get(
      AdminActionLogService,
    ) as jest.Mocked<AdminActionLogService>;
    notificationGrpcService = module.get(
      NotificationGrpcService,
    ) as jest.Mocked<NotificationGrpcService>;

    // Re-setup exception handler mocks to ensure they throw
    exceptionHandler.throwNotFound.mockImplementation((error: any) => {
      throw new Error(error.message || error.messagee);
    });
    exceptionHandler.throwBadRequest.mockImplementation((error: any) => {
      throw new Error(error.message || error.messagee);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCustomers', () => {
    const query: QueryCustomersDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated customers with no filters', async () => {
      // Arrange
      const customers = [mockCustomer, { ...mockCustomer, id: 'user-456' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([customers, 2]);

      // Act
      const result = await service.getCustomers(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.role = :role', {
        role: EUserRole.CUSTOMER,
      });
    });

    it('should filter customers by status', async () => {
      // Arrange
      const queryWithStatus = { ...query, status: EUserStatus.SUSPENDED };
      const suspendedCustomers = [
        { ...mockCustomer, status: EUserStatus.SUSPENDED },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        suspendedCustomers,
        1,
      ]);

      // Act
      const result = await service.getCustomers(queryWithStatus);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.status = :status',
        { status: EUserStatus.SUSPENDED },
      );
    });

    it('should filter customers by KYC status', async () => {
      // Arrange
      const queryWithKycStatus = { ...query, kycStatus: EKYCStatus.PENDING };
      const pendingKycCustomers = [
        { ...mockCustomer, kycStatus: EKYCStatus.PENDING },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        pendingKycCustomers,
        1,
      ]);

      // Act
      const result = await service.getCustomers(queryWithKycStatus);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.kycStatus = :kycStatus',
        { kycStatus: EKYCStatus.PENDING },
      );
    });

    it('should search customers by name, email, or customerId', async () => {
      // Arrange
      const queryWithSearch = { ...query, search: 'John' };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockCustomer], 1]);

      // Act
      const result = await service.getCustomers(queryWithSearch);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.customerId ILIKE :search)',
        { search: '%John%' },
      );
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const queryPage2 = { page: 2, limit: 10 };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      // Act
      await service.getCustomers(queryPage2);

      // Assert
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (page 2 - 1) * 10
    });
  });

  describe('getCustomerById', () => {
    it('should return customer details with credit account and recent actions', async () => {
      // Arrange
      const mockActionLogs = [
        { id: '1', actionType: 'CUSTOMER_SUSPENDED' },
        { id: '2', actionType: 'CREDIT_LIMIT_UPDATED' },
      ];
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      creditAccountRepository.findOne.mockResolvedValue(
        mockCreditAccount as any,
      );
      adminActionLogService.findByTarget.mockResolvedValue(
        mockActionLogs as any,
      );

      // Act
      const result = await service.getCustomerById('user-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.customer).toEqual(mockCustomer);
      expect(result.creditAccount).toEqual(mockCreditAccount);
      expect(result.recentActions).toEqual(mockActionLogs.slice(0, 10));
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123', role: EUserRole.CUSTOMER },
      });
      expect(creditAccountRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-123' } },
      });
      expect(adminActionLogService.findByTarget).toHaveBeenCalledWith(
        'user-123',
        'User',
      );
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCustomerById('non-existent')).rejects.toThrow(
        _404.CUSTOMER_NOT_FOUND.message,
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.CUSTOMER_NOT_FOUND,
      );
    });
  });

  describe('suspendCustomer', () => {
    const adminId = 'admin-123';
    const suspendDto: SuspendCustomerDto = {
      reason: 'Suspicious activity detected',
      notes: 'Account suspended for review',
    };

    it('should successfully suspend an active customer', async () => {
      // Arrange
      const activeCustomer = { ...mockCustomer, status: EUserStatus.ACTIVE };
      userRepository.findOne.mockResolvedValue(activeCustomer as any);
      userRepository.save.mockResolvedValue({
        ...activeCustomer,
        status: EUserStatus.SUSPENDED,
      } as any);

      // Act
      const result = await service.suspendCustomer(
        'user-123',
        adminId,
        suspendDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(EUserStatus.SUSPENDED);
      expect(userRepository.save).toHaveBeenCalled();
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'account-suspended',
        [mockCustomer.email],
        expect.any(Object),
        'admin',
        mockCustomer.id,
      );
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.suspendCustomer('non-existent', adminId, suspendDto),
      ).rejects.toThrow(_404.CUSTOMER_NOT_FOUND.message);
    });

    it('should throw error if customer already suspended', async () => {
      // Arrange
      const suspendedCustomer = {
        ...mockCustomer,
        status: EUserStatus.SUSPENDED,
      };
      userRepository.findOne.mockResolvedValue(suspendedCustomer as any);

      // Act & Assert
      await expect(
        service.suspendCustomer('user-123', adminId, suspendDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.CUSTOMER_ALREADY_SUSPENDED,
      );
    });

    it('should log admin action with correct details', async () => {
      // Arrange
      const activeCustomer = { ...mockCustomer, status: EUserStatus.ACTIVE };
      userRepository.findOne.mockResolvedValue(activeCustomer as any);
      userRepository.save.mockResolvedValue({
        ...activeCustomer,
        status: EUserStatus.SUSPENDED,
      } as any);

      // Act
      await service.suspendCustomer('user-123', adminId, suspendDto);

      // Assert
      expect(adminActionLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId,
          targetId: 'user-123',
          targetType: 'User',
          metadata: expect.objectContaining({
            customerId: mockCustomer.customerId,
            previousStatus: EUserStatus.ACTIVE,
            reason: suspendDto.reason,
          }),
          notes: suspendDto.notes,
        }),
      );
    });
  });

  describe('unsuspendCustomer', () => {
    const adminId = 'admin-123';
    const unsuspendDto: UnsuspendCustomerDto = {
      notes: 'Issue resolved, account restored',
    };

    it('should successfully unsuspend a suspended customer', async () => {
      // Arrange
      const suspendedCustomer = {
        ...mockCustomer,
        status: EUserStatus.SUSPENDED,
      };
      userRepository.findOne.mockResolvedValue(suspendedCustomer as any);
      userRepository.save.mockResolvedValue({
        ...suspendedCustomer,
        status: EUserStatus.ACTIVE,
      } as any);

      // Act
      const result = await service.unsuspendCustomer(
        'user-123',
        adminId,
        unsuspendDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(EUserStatus.ACTIVE);
      expect(userRepository.save).toHaveBeenCalled();
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'account-unsuspended',
        [mockCustomer.email],
        expect.any(Object),
        'admin',
        mockCustomer.id,
      );
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.unsuspendCustomer('non-existent', adminId, unsuspendDto),
      ).rejects.toThrow(_404.CUSTOMER_NOT_FOUND.message);
    });

    it('should throw error if customer is not suspended', async () => {
      // Arrange
      const activeCustomer = { ...mockCustomer, status: EUserStatus.ACTIVE };
      userRepository.findOne.mockResolvedValue(activeCustomer as any); // ACTIVE status

      // Act & Assert
      await expect(
        service.unsuspendCustomer('user-123', adminId, unsuspendDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.CUSTOMER_NOT_SUSPENDED,
      );
    });
  });

  describe('updateCreditLimit', () => {
    const adminId = 'admin-123';
    const updateDto: UpdateCreditLimitDto = {
      newLimit: 750000,
      reason: 'Increased due to good payment history',
      notes: 'Credit limit adjustment',
    };

    it('should successfully update customer credit limit', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      creditAccountRepository.findOne.mockResolvedValue(
        mockCreditAccount as any,
      );
      const updatedCreditAccount = {
        ...mockCreditAccount,
        creditLimit: 750000,
        availableCredit: 750000,
      };
      creditService.updateCreditLimit.mockResolvedValue(
        updatedCreditAccount as any,
      );

      // Act
      const result = await service.updateCreditLimit(
        'user-123',
        adminId,
        updateDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.customer).toEqual(mockCustomer);
      expect(result.creditAccount).toEqual(updatedCreditAccount);
      expect(creditService.updateCreditLimit).toHaveBeenCalledWith(
        'user-123',
        750000,
      );
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'credit-limit-updated',
        [mockCustomer.email],
        expect.any(Object),
        'admin',
        mockCustomer.id,
      );
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateCreditLimit('non-existent', adminId, updateDto),
      ).rejects.toThrow(_404.CUSTOMER_NOT_FOUND.message);
    });

    it('should throw error if credit account not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateCreditLimit('user-123', adminId, updateDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.CREDIT_ACCOUNT_NOT_FOUND,
      );
    });

    it('should delegate validation to CreditService', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      creditAccountRepository.findOne.mockResolvedValue(
        mockCreditAccount as any,
      );
      creditService.updateCreditLimit.mockRejectedValue(
        new Error('New credit limit cannot be less than borrowed amount'),
      );

      // Act & Assert
      await expect(
        service.updateCreditLimit('user-123', adminId, updateDto),
      ).rejects.toThrow('New credit limit cannot be less than borrowed amount');
      expect(creditService.updateCreditLimit).toHaveBeenCalledWith(
        'user-123',
        750000,
      );
    });

    it('should log admin action with old and new limits', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      creditAccountRepository.findOne.mockResolvedValue(
        mockCreditAccount as any,
      );
      const updatedCreditAccount = {
        ...mockCreditAccount,
        creditLimit: 750000,
      };
      creditService.updateCreditLimit.mockResolvedValue(
        updatedCreditAccount as any,
      );

      // Act
      await service.updateCreditLimit('user-123', adminId, updateDto);

      // Assert
      expect(adminActionLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId,
          targetId: mockCreditAccount.id,
          targetType: 'CreditAccount',
          metadata: expect.objectContaining({
            customerId: mockCustomer.customerId,
            oldLimit: '500000',
            newLimit: '750000',
            reason: updateDto.reason,
          }),
          notes: updateDto.notes,
        }),
      );
    });
  });

  describe('updateCreditScore', () => {
    const adminId = 'admin-123';
    const updateDto: UpdateCreditScoreDto = {
      newScore: 800,
      reason: 'Updated after successful loan repayment',
      notes: 'Credit score adjustment',
    };

    it('should successfully update customer credit score', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockCustomer as any);
      userRepository.save.mockResolvedValue({
        ...mockCustomer,
        creditScore: 800,
      } as any);

      // Act
      const result = await service.updateCreditScore(
        'user-123',
        adminId,
        updateDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.creditScore).toBe(800);
      expect(userRepository.save).toHaveBeenCalled();
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'credit-score-updated',
        [mockCustomer.email],
        expect.any(Object),
        'admin',
        mockCustomer.id,
      );
    });

    it('should throw error if customer not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateCreditScore('non-existent', adminId, updateDto),
      ).rejects.toThrow(_404.CUSTOMER_NOT_FOUND.message);
    });

    it('should log admin action with score change details', async () => {
      // Arrange
      const customerBeforeUpdate = { ...mockCustomer, creditScore: 750 };
      userRepository.findOne.mockResolvedValue(customerBeforeUpdate as any);
      userRepository.save.mockResolvedValue({
        ...customerBeforeUpdate,
        creditScore: 800,
      } as any);

      // Act
      await service.updateCreditScore('user-123', adminId, updateDto);

      // Assert
      expect(adminActionLogService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId,
          targetId: 'user-123',
          targetType: 'User',
          metadata: expect.objectContaining({
            customerId: mockCustomer.customerId,
            oldScore: '750',
            newScore: '800',
            reason: updateDto.reason,
          }),
          notes: updateDto.notes,
        }),
      );
    });
  });
});
