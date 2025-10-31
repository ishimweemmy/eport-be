import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanManagementService } from './loan-management.service';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { LoanService } from '@customer-service/modules/loan/loan.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { AdminActionLogService } from '@admin-service/modules/admin-action-log/admin-action-log.service';
import { NotificationGrpcService } from '@admin-service/integrations/notification/notification-grpc.service';
import { QueryLoansDto } from '@admin-service/modules/loan-management/dto/query-loans.dto';
import {
  ApproveLoanDto,
  RejectLoanDto,
} from '@admin-service/modules/loan-management/dto/approve-loan.dto';
import { DisburseLoanDto } from '@admin-service/modules/loan-management/dto/disburse-loan.dto';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { _404, _400 } from '@app/common/constants/errors-constants';

describe('LoanManagementService', () => {
  let service: LoanManagementService;
  let loanRepository: jest.Mocked<Repository<Loan>>;
  let loanService: jest.Mocked<LoanService>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let adminActionLogService: jest.Mocked<AdminActionLogService>;
  let notificationGrpcService: jest.Mocked<NotificationGrpcService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockCreditAccount = {
    id: 'credit-123',
    creditLimit: 500000,
    availableCredit: 500000,
  };

  const mockSavingsAccount = {
    id: 'savings-123',
    accountNumber: 'SA000001',
    balance: 10000,
  };

  const mockLoan = {
    id: 'loan-123',
    loanNumber: 'LN000001',
    user: mockUser,
    creditAccount: mockCreditAccount,
    savingsAccount: mockSavingsAccount,
    principalAmount: 100000,
    interestRate: 8.0,
    totalAmount: 108000,
    tenorMonths: 6,
    status: ELoanStatus.PENDING,
    approvalStatus: EApprovalStatus.PENDING_REVIEW,
    outstandingAmount: 108000,
    requestedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanManagementService,
        {
          provide: getRepositoryToken(Loan),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: LoanService,
          useValue: {
            disburseLoan: jest.fn(),
          },
        },
        {
          provide: ExceptionHandler,
          useValue: {
            throwNotFound: jest.fn((error) => {
              throw new Error(error.message);
            }),
            throwBadRequest: jest.fn((error) => {
              throw new Error(error.message);
            }),
          },
        },
        {
          provide: AdminActionLogService,
          useValue: {
            logAction: jest.fn(),
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

    service = module.get<LoanManagementService>(LoanManagementService);
    loanRepository = module.get(getRepositoryToken(Loan)) as jest.Mocked<
      Repository<Loan>
    >;
    loanService = module.get(LoanService) as jest.Mocked<LoanService>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    adminActionLogService = module.get(
      AdminActionLogService,
    ) as jest.Mocked<AdminActionLogService>;
    notificationGrpcService = module.get(
      NotificationGrpcService,
    ) as jest.Mocked<NotificationGrpcService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLoans', () => {
    const query: QueryLoansDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated loans with no filters', async () => {
      // Arrange
      const loans = [mockLoan, { ...mockLoan, id: 'loan-456' }];
      loanRepository.findAndCount.mockResolvedValue([loans as any, 2]);

      // Act
      const result = await service.getLoans(query);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(loanRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter loans by status', async () => {
      // Arrange
      const queryWithStatus = { ...query, status: ELoanStatus.ACTIVE };
      const activeLoans = [{ ...mockLoan, status: ELoanStatus.ACTIVE }];
      loanRepository.findAndCount.mockResolvedValue([activeLoans as any, 1]);

      // Act
      const result = await service.getLoans(queryWithStatus);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(loanRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ELoanStatus.ACTIVE }),
        }),
      );
    });

    it('should filter loans by approval status', async () => {
      // Arrange
      const queryWithApprovalStatus = {
        ...query,
        approvalStatus: EApprovalStatus.PENDING_REVIEW,
      };
      const pendingLoans = [mockLoan];
      loanRepository.findAndCount.mockResolvedValue([pendingLoans as any, 1]);

      // Act
      const result = await service.getLoans(queryWithApprovalStatus);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(loanRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            approvalStatus: EApprovalStatus.PENDING_REVIEW,
          }),
        }),
      );
    });
  });

  describe('getLoanById', () => {
    it('should return loan details by ID', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(mockLoan as any);

      // Act
      const result = await service.getLoanById('loan-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('loan-123');
      expect(loanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'loan-123' },
        relations: ['user', 'creditAccount', 'savingsAccount'],
      });
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getLoanById('non-existent')).rejects.toThrow(
        _404.LOAN_NOT_FOUND.message,
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.LOAN_NOT_FOUND,
      );
    });
  });

  describe('approveLoan', () => {
    const adminId = 'admin-123';
    const approveDto: ApproveLoanDto = {
      notes: 'Approved based on good credit history',
    };

    it('should successfully approve a pending loan', async () => {
      // Arrange
      const pendingLoan = {
        ...mockLoan,
        approvalStatus: EApprovalStatus.PENDING_REVIEW,
      };
      loanRepository.findOne.mockResolvedValue(pendingLoan as any);
      loanRepository.save.mockResolvedValue({
        ...pendingLoan,
        approvalStatus: EApprovalStatus.MANUAL_APPROVED,
        status: ELoanStatus.APPROVED,
      } as any);

      // Act
      const result = await service.approveLoan('loan-123', adminId, approveDto);

      // Assert
      expect(result).toBeDefined();
      expect(loanRepository.save).toHaveBeenCalled();
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'loan-approved',
        [mockUser.email],
        expect.any(Object),
        'admin',
        'loan-123',
      );
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.approveLoan('non-existent', adminId, approveDto),
      ).rejects.toThrow(_404.LOAN_NOT_FOUND.message);
    });

    it('should throw error if loan not in pending review status', async () => {
      // Arrange
      const approvedLoan = {
        ...mockLoan,
        approvalStatus: EApprovalStatus.MANUAL_APPROVED,
      };
      loanRepository.findOne.mockResolvedValue(approvedLoan as any);

      // Act & Assert
      await expect(
        service.approveLoan('loan-123', adminId, approveDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.LOAN_NOT_PENDING_REVIEW,
      );
    });
  });

  describe('rejectLoan', () => {
    const adminId = 'admin-123';
    const rejectDto: RejectLoanDto = {
      reason: 'Insufficient credit score',
      notes: 'Rejected after review',
    };

    it('should successfully reject a pending loan', async () => {
      // Arrange
      const pendingLoan = {
        ...mockLoan,
        approvalStatus: EApprovalStatus.PENDING_REVIEW,
      };
      loanRepository.findOne.mockResolvedValue(pendingLoan as any);
      loanRepository.save.mockResolvedValue({
        ...pendingLoan,
        approvalStatus: EApprovalStatus.REJECTED,
        status: ELoanStatus.REJECTED,
      } as any);

      // Act
      const result = await service.rejectLoan('loan-123', adminId, rejectDto);

      // Assert
      expect(result).toBeDefined();
      expect(loanRepository.save).toHaveBeenCalled();
      expect(adminActionLogService.logAction).toHaveBeenCalled();
      expect(notificationGrpcService.sendEmail).toHaveBeenCalledWith(
        'loan-rejected',
        [mockUser.email],
        expect.objectContaining({
          reason: rejectDto.reason,
        }),
        'admin',
        'loan-123',
      );
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.rejectLoan('non-existent', adminId, rejectDto),
      ).rejects.toThrow(_404.LOAN_NOT_FOUND.message);
    });

    it('should throw error if loan not in pending review status', async () => {
      // Arrange
      const rejectedLoan = {
        ...mockLoan,
        approvalStatus: EApprovalStatus.REJECTED,
      };
      loanRepository.findOne.mockResolvedValue(rejectedLoan as any);

      // Act & Assert
      await expect(
        service.rejectLoan('loan-123', adminId, rejectDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.LOAN_NOT_PENDING_REVIEW,
      );
    });
  });

  describe('disburseLoan', () => {
    const adminId = 'admin-123';
    const disburseDto: DisburseLoanDto = {
      notes: 'Disbursed via bank transfer',
    };

    it('should successfully disburse an approved loan', async () => {
      // Arrange
      const approvedLoan = {
        ...mockLoan,
        approvalStatus: EApprovalStatus.MANUAL_APPROVED,
        status: ELoanStatus.APPROVED,
      };
      loanRepository.findOne.mockResolvedValue(approvedLoan as any);
      const disbursedLoan = {
        ...approvedLoan,
        status: ELoanStatus.DISBURSED,
        disbursedAt: new Date(),
      };
      loanService.disburseLoan.mockResolvedValue(disbursedLoan as any);

      // Act
      const result = await service.disburseLoan('loan-123', adminId, disburseDto);

      // Assert
      expect(result).toBeDefined();
      expect(loanService.disburseLoan).toHaveBeenCalledWith('loan-123');
      expect(adminActionLogService.logAction).toHaveBeenCalled();
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.disburseLoan('non-existent', adminId, disburseDto),
      ).rejects.toThrow(_404.LOAN_NOT_FOUND.message);
    });

    it('should throw error if loan not approved', async () => {
      // Arrange
      const pendingLoan = {
        ...mockLoan,
        status: ELoanStatus.PENDING,
      };
      loanRepository.findOne.mockResolvedValue(pendingLoan as any);

      // Act & Assert
      await expect(
        service.disburseLoan('loan-123', adminId, disburseDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.LOAN_NOT_APPROVED,
      );
    });
  });
});
