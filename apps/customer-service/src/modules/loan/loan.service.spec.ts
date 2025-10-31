import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoanService } from './loan.service';
import { Loan } from './entities/loan.entity';
import { Repayment } from './entities/repayment.entity';
import { User } from '../user/entities/user.entity';
import { CreditAccount } from '../credit/entities/credit-account.entity';
import { SavingsAccount } from '../savings/entities/savings-account.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { TransactionService } from '../transaction/transaction.service';
import { SavingsService } from '../savings/savings.service';
import { CreditService } from '../credit/credit.service';
import { NotificationPreProcessor } from '../../integrations/notification/notification.preprocessor';
import { LoanRequestDto } from './dto/loan-request.dto';
import { RepaymentDto } from './dto/repayment.dto';
import { ELoanStatus } from './enums/loan-status.enum';
import { ERepaymentStatus } from './enums/repayment-status.enum';
import { EKYCStatus } from '../user/enums/kyc-status.enum';
import { EAccountStatus } from '../savings/enums/account-status.enum';
import { _404 } from '@app/common/constants/errors-constants';
import {
  createMockUser,
  createMockCreditAccount,
  createMockSavingsAccount,
  createMockLoan,
  createMockRepayment,
} from '@customer-service/test-utils/mock-factories';

describe('LoanService', () => {
  let service: LoanService;
  let loanRepository: jest.Mocked<Repository<Loan>>;
  let repaymentRepository: jest.Mocked<Repository<Repayment>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let creditAccountRepository: jest.Mocked<Repository<CreditAccount>>;
  let savingsAccountRepository: jest.Mocked<Repository<SavingsAccount>>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let notificationProcessor: jest.Mocked<NotificationPreProcessor>;
  let dataSource: jest.Mocked<DataSource>;
  let transactionService: jest.Mocked<TransactionService>;
  let creditService: jest.Mocked<CreditService>;

  const mockUser = createMockUser({ kycStatus: EKYCStatus.VERIFIED });
  const mockCreditAccount = createMockCreditAccount({ user: mockUser });
  const mockSavingsAccount = createMockSavingsAccount({ user: mockUser });
  const mockLoan = createMockLoan({
    user: mockUser,
    creditAccount: mockCreditAccount,
    savingsAccount: mockSavingsAccount,
  });

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        {
          provide: getRepositoryToken(Loan),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Repayment),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CreditAccount),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SavingsAccount),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ExceptionHandler,
          useValue: {
            throwBadRequest: jest.fn((error) => {
              throw new Error(error.message);
            }),
            throwNotFound: jest.fn((error) => {
              throw new Error(error.message);
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            completeTransaction: jest.fn(),
          },
        },
        {
          provide: SavingsService,
          useValue: {
            getAccountById: jest.fn(),
          },
        },
        {
          provide: CreditService,
          useValue: {
            getCreditAccount: jest.fn(),
          },
        },
        {
          provide: NotificationPreProcessor,
          useValue: {
            sendTemplateEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
    loanRepository = module.get(getRepositoryToken(Loan)) as jest.Mocked<
      Repository<Loan>
    >;
    repaymentRepository = module.get(
      getRepositoryToken(Repayment),
    ) as jest.Mocked<Repository<Repayment>>;
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
    creditAccountRepository = module.get(
      getRepositoryToken(CreditAccount),
    ) as jest.Mocked<Repository<CreditAccount>>;
    savingsAccountRepository = module.get(
      getRepositoryToken(SavingsAccount),
    ) as jest.Mocked<Repository<SavingsAccount>>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    notificationProcessor = module.get(
      NotificationPreProcessor,
    ) as jest.Mocked<NotificationPreProcessor>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
    transactionService = module.get(
      TransactionService,
    ) as jest.Mocked<TransactionService>;
    creditService = module.get(CreditService) as jest.Mocked<CreditService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestLoan', () => {
    const loanRequestDto: LoanRequestDto = {
      principalAmount: 100000,
      tenorMonths: 6,
      savingsAccountId: 'savings-123',
      purpose: 'Business expansion',
    };

    it('should successfully request a loan for eligible customer', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Mock createQueryBuilder for loan number generation
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      loanRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      loanRepository.count.mockResolvedValue(0);
      loanRepository.create.mockReturnValue(mockLoan);
      loanRepository.save.mockResolvedValue(mockLoan);

      // Mock repayment repository for schedule finding
      repaymentRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.requestLoan(mockUser.id, loanRequestDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.principalAmount).toBe(loanRequestDto.principalAmount);
      expect(result.tenorMonths).toBe(loanRequestDto.tenorMonths);
      expect(loanRepository.save).toHaveBeenCalled();
      // Note: No notification sent during request - only sent during disbursement
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.requestLoan(mockUser.id, loanRequestDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });

    it('should handle unverified KYC (manual review instead of auto-approval)', async () => {
      // Arrange: Unverified KYC goes to manual review, not rejection
      const unverifiedUser = createMockUser({ kycStatus: EKYCStatus.PENDING });
      userRepository.findOne.mockResolvedValue(unverifiedUser);
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Mock createQueryBuilder for loan number generation
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      loanRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
      repaymentRepository.findOne.mockResolvedValue(null);

      loanRepository.count.mockResolvedValue(0);
      loanRepository.create.mockReturnValue(mockLoan);
      loanRepository.save.mockResolvedValue(mockLoan);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.requestLoan(mockUser.id, loanRequestDto);

      // Assert: Should create loan for manual review (not auto-approved)
      expect(result).toBeDefined();
      expect(loanRepository.save).toHaveBeenCalled();
    });

    it('should throw error if credit account not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.requestLoan(mockUser.id, loanRequestDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });

    it('should throw error if loan amount exceeds available credit', async () => {
      // Arrange
      const limitedCreditAccount = {
        ...mockCreditAccount,
        availableCredit: 50000,
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      creditAccountRepository.findOne.mockResolvedValue(limitedCreditAccount);

      // Act & Assert
      await expect(
        service.requestLoan(mockUser.id, loanRequestDto),
      ).rejects.toThrow('Insufficient credit limit');
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith({
        message: 'Insufficient credit limit',
        code: 'INSUFFICIENT_CREDIT',
      });
    });

    it('should throw error if savings account is inactive', async () => {
      // Arrange
      const inactiveSavingsAccount = {
        ...mockSavingsAccount,
        status: EAccountStatus.CLOSED,
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      savingsAccountRepository.findOne.mockResolvedValue(
        inactiveSavingsAccount,
      );

      // Act & Assert
      await expect(
        service.requestLoan(mockUser.id, loanRequestDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalled();
    });

    it('should calculate correct interest and total amount', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Mock createQueryBuilder for loan number generation
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      loanRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
      repaymentRepository.findOne.mockResolvedValue(null);

      loanRepository.count.mockResolvedValue(0);
      let capturedLoan: Partial<Loan> | undefined;
      loanRepository.create.mockImplementation((loan: Partial<Loan>) => {
        capturedLoan = loan;
        return loan as Loan;
      });
      loanRepository.save.mockResolvedValue(mockLoan);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      await service.requestLoan(mockUser.id, loanRequestDto);

      // Assert
      // For 6 months at 8% flat rate
      const expectedInterest = 100000 * 0.08; // 8000
      const expectedTotal = 100000 + expectedInterest; // 108000
      expect(capturedLoan).toBeDefined();
      expect(capturedLoan!.principalAmount).toBe(100000);
      expect(capturedLoan!.totalAmount).toBe(expectedTotal);
    });
  });

  describe('getMyLoans', () => {
    it('should return all loans for a user', async () => {
      // Arrange
      const loans = [mockLoan, { ...mockLoan, id: 'loan-456' }];
      loanRepository.find.mockResolvedValue(loans);

      // Act
      const result = await service.getMyLoans(mockUser.id);

      // Assert
      expect(result).toHaveLength(2);
      expect(loanRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['user', 'savingsAccount'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array if no loans found', async () => {
      // Arrange
      loanRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getMyLoans(mockUser.id);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getLoanById', () => {
    it('should return loan by ID if owned by user', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(mockLoan);

      // Act
      const result = await service.getLoanById(mockUser.id, 'loan-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('loan-123');
      expect(loanRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'loan-123',
          user: { id: mockUser.id },
        },
        relations: ['user', 'savingsAccount'],
      });
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getLoanById(mockUser.id, 'non-existent'),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.LOAN_NOT_FOUND,
      );
    });
  });

  describe('getRepaymentSchedule', () => {
    it('should return repayment schedule for a loan', async () => {
      // Arrange
      const activeLoan = { ...mockLoan, status: ELoanStatus.ACTIVE };
      loanRepository.findOne.mockResolvedValue(activeLoan);

      // Create 6 repayment installments
      const repayments = Array.from({ length: 6 }, (_, i) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return createMockRepayment({
          scheduleNumber: i + 1,
          dueDate,
          dueAmount: 18000, // 108000 / 6
          status: ERepaymentStatus.SCHEDULED,
        });
      });
      repaymentRepository.find.mockResolvedValue(repayments);

      // Act
      const result = await service.getRepaymentSchedule(
        mockUser.id,
        'loan-123',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.loanNumber).toBe('LN000001');
      expect(result.schedule).toHaveLength(6); // 6 months
      expect(result.totalAmount).toBe(108000);
      expect(repaymentRepository.find).toHaveBeenCalledWith({
        where: { loan: { id: 'loan-123' } },
        order: { scheduleNumber: 'ASC' },
      });
    });

    it('should throw error if loan not found', async () => {
      // Arrange
      loanRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getRepaymentSchedule(mockUser.id, 'non-existent'),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.LOAN_NOT_FOUND,
      );
    });

    it('should mark overdue installments', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2);
      const activeLoan = {
        ...mockLoan,
        status: ELoanStatus.ACTIVE,
        disbursedAt: pastDate,
      };
      loanRepository.findOne.mockResolvedValue(activeLoan);

      // Create repayments with some overdue
      const overdueDate = new Date();
      overdueDate.setMonth(overdueDate.getMonth() - 1);
      const repayments = [
        createMockRepayment({
          scheduleNumber: 1,
          dueDate: overdueDate,
          status: ERepaymentStatus.OVERDUE,
        }),
        createMockRepayment({
          scheduleNumber: 2,
          dueDate: new Date(),
          status: ERepaymentStatus.SCHEDULED,
        }),
      ];
      repaymentRepository.find.mockResolvedValue(repayments);

      // Act
      const result = await service.getRepaymentSchedule(
        mockUser.id,
        'loan-123',
      );

      // Assert
      const overdueInstallments = result.schedule.filter(
        (item) => item.status === ERepaymentStatus.OVERDUE,
      );
      expect(overdueInstallments.length).toBeGreaterThan(0);
    });
  });

  describe('repayLoan', () => {
    const repaymentDto: RepaymentDto = {
      loanId: 'loan-123',
      amount: 18000,
      savingsAccountId: 'savings-123',
    };

    it('should successfully process loan repayment', async () => {
      // Arrange
      const activeLoan = {
        ...mockLoan,
        status: ELoanStatus.ACTIVE,
        outstandingAmount: 108000,
      };
      loanRepository.findOne.mockResolvedValue(activeLoan);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Mock next scheduled repayment
      const scheduledRepayment = createMockRepayment({
        scheduleNumber: 1,
        dueAmount: 18000,
        amountPaid: 0,
        status: ERepaymentStatus.SCHEDULED,
      });
      repaymentRepository.findOne.mockResolvedValue(scheduledRepayment);

      // Mock transaction creation
      const mockTransaction = { id: 'transaction-123' };
      transactionService.createTransaction.mockResolvedValue(
        mockTransaction as any,
      );
      transactionService.completeTransaction.mockResolvedValue(undefined);

      // Mock queryRunner operations
      const mockQueryRunner = dataSource.createQueryRunner();
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue({});

      // Mock credit service
      creditService.updateAvailableCredit.mockResolvedValue(undefined);

      // Mock repayments for notification
      repaymentRepository.find.mockResolvedValue([scheduledRepayment]);

      // Mock notification
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.repayLoan(mockUser.id, repaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toContain('successfully');
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(transactionService.createTransaction).toHaveBeenCalled();
      expect(transactionService.completeTransaction).toHaveBeenCalled();
      expect(creditService.updateAvailableCredit).toHaveBeenCalled();
    });

    it('should throw error if loan not active', async () => {
      // Arrange
      const pendingLoan = { ...mockLoan, status: ELoanStatus.PENDING };
      loanRepository.findOne.mockResolvedValue(pendingLoan);

      // Act & Assert
      await expect(
        service.repayLoan(mockUser.id, repaymentDto),
      ).rejects.toThrow('Loan is not active');
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith({
        message: 'Loan is not active',
        code: 'LOAN_NOT_ACTIVE',
      });
    });

    it('should throw error if insufficient balance in savings account', async () => {
      // Arrange
      const activeLoan = {
        ...mockLoan,
        status: ELoanStatus.ACTIVE,
        outstandingAmount: 108000,
      };
      loanRepository.findOne.mockResolvedValue(activeLoan);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Mock next scheduled repayment
      const scheduledRepayment = createMockRepayment({
        scheduleNumber: 1,
        dueAmount: 18000,
        status: ERepaymentStatus.SCHEDULED,
      });
      repaymentRepository.findOne.mockResolvedValue(scheduledRepayment);

      // Mock transaction creation to throw insufficient balance error
      transactionService.createTransaction.mockRejectedValue(
        new Error('Insufficient balance'),
      );

      const mockQueryRunner = dataSource.createQueryRunner();

      // Act & Assert
      await expect(
        service.repayLoan(mockUser.id, repaymentDto),
      ).rejects.toThrow('Insufficient balance');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should mark loan as paid when fully repaid', async () => {
      // Arrange
      const nearlyPaidLoan = {
        ...mockLoan,
        status: ELoanStatus.ACTIVE,
        outstandingBalance: 18000, // Last payment
      };
      loanRepository.findOne.mockResolvedValue(nearlyPaidLoan);
      savingsAccountRepository.findOne.mockResolvedValue(mockSavingsAccount);

      const mockQueryRunner = dataSource.createQueryRunner();
      let savedLoan: Loan | undefined;
      (mockQueryRunner.manager.save as jest.Mock).mockImplementation(
        (entity: Loan | Repayment) => {
          if (entity instanceof Loan || entity.constructor?.name === 'Loan') {
            savedLoan = entity as Loan;
          }
          return Promise.resolve(entity);
        },
      );

      const mockRepayment: Partial<Repayment> = {
        id: 'repayment-123',
        dueAmount: 18000,
        amountPaid: 18000,
        scheduleNumber: 1,
        status: ERepaymentStatus.PAID,
      };
      repaymentRepository.create.mockReturnValue(mockRepayment as Repayment);

      // Act
      await service.repayLoan(mockUser.id, repaymentDto);

      // Assert
      expect(savedLoan).toBeDefined();
      expect(savedLoan!.status).toBe(ELoanStatus.FULLY_PAID);
      expect(savedLoan!.outstandingAmount).toBe(0);
    });
  });
});
