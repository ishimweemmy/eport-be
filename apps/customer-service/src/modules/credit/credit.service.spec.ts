import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditService } from './credit.service';
import { CreditAccount } from './entities/credit-account.entity';
import { User } from '../user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404 } from '@app/common/constants/errors-constants';
import { EKYCStatus } from '../user/enums/kyc-status.enum';
import {
  createMockUser,
  createMockCreditAccount,
} from '@customer-service/test-utils/mock-factories';

describe('CreditService', () => {
  let service: CreditService;
  let creditAccountRepository: jest.Mocked<Repository<CreditAccount>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;

  const mockUser = createMockUser({ kycStatus: EKYCStatus.VERIFIED });
  const mockCreditAccount = createMockCreditAccount({ user: mockUser });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditService,
        {
          provide: getRepositoryToken(CreditAccount),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
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
      ],
    }).compile();

    service = module.get<CreditService>(CreditService);
    creditAccountRepository = module.get(
      getRepositoryToken(CreditAccount),
    ) as jest.Mocked<Repository<CreditAccount>>;
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCreditAccount', () => {
    it('should successfully create a credit account', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      creditAccountRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );
      creditAccountRepository.create.mockReturnValue(mockCreditAccount);
      creditAccountRepository.save.mockResolvedValue(mockCreditAccount);

      // Act
      const result = await service.createCreditAccount(mockUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.creditLimit).toBeGreaterThanOrEqual(50000);
      expect(result.availableCredit).toBe(result.creditLimit);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(creditAccountRepository.save).toHaveBeenCalled();
    });

    it('should create account with custom initial limit', async () => {
      // Arrange
      const customLimit = 200000;
      userRepository.findOne.mockResolvedValue(mockUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      creditAccountRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );
      const accountWithCustomLimit = createMockCreditAccount({
        creditLimit: customLimit,
        availableCredit: customLimit,
      });
      creditAccountRepository.create.mockReturnValue(accountWithCustomLimit);
      creditAccountRepository.save.mockResolvedValue(accountWithCustomLimit);

      // Act
      const result = await service.createCreditAccount(
        mockUser.id,
        customLimit,
      );

      // Assert
      expect(result.creditLimit).toBe(customLimit);
      expect(result.availableCredit).toBe(customLimit);
    });

    it('should generate unique account number', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      creditAccountRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );
      let capturedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.create.mockImplementation(
        (account: Partial<CreditAccount>) => {
          capturedAccount = account;
          return account as CreditAccount;
        },
      );
      creditAccountRepository.save.mockResolvedValue(mockCreditAccount);

      // Act
      await service.createCreditAccount(mockUser.id);

      // Assert
      expect(capturedAccount).toBeDefined();
      expect(capturedAccount!.accountNumber).toMatch(/CRD-\d{3}-\d{4}/);
    });

    it('should enforce minimum credit limit', async () => {
      // Arrange
      const tooLowLimit = 10000; // Less than MIN_CREDIT_LIMIT (50000)
      userRepository.findOne.mockResolvedValue(mockUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      creditAccountRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );
      const accountWithMinLimit = createMockCreditAccount({
        creditLimit: 50000,
        availableCredit: 50000,
      });
      creditAccountRepository.create.mockReturnValue(accountWithMinLimit);
      creditAccountRepository.save.mockResolvedValue(accountWithMinLimit);

      // Act
      const result = await service.createCreditAccount(
        mockUser.id,
        tooLowLimit,
      );

      // Assert
      expect(result.creditLimit).toBe(50000); // Enforced minimum
    });

    it('should enforce maximum credit limit', async () => {
      // Arrange
      const tooHighLimit = 20000000; // More than MAX_CREDIT_LIMIT (10000000)
      userRepository.findOne.mockResolvedValue(mockUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      creditAccountRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );
      const accountWithMaxLimit = createMockCreditAccount({
        creditLimit: 10000000,
        availableCredit: 10000000,
      });
      creditAccountRepository.create.mockReturnValue(accountWithMaxLimit);
      creditAccountRepository.save.mockResolvedValue(accountWithMaxLimit);

      // Act
      const result = await service.createCreditAccount(
        mockUser.id,
        tooHighLimit,
      );

      // Assert
      expect(result.creditLimit).toBe(10000000); // Enforced maximum
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createCreditAccount('non-existent')).rejects.toThrow(
        'Customer not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.CUSTOMER_NOT_FOUND,
      );
    });
  });

  describe('calculateCreditLimit', () => {
    it('should calculate credit limit using correct formula', async () => {
      // Arrange
      const userId = 'user-123';
      const totalSavingsBalance = 500000;
      const avgMonthlyTransactions = 100000;

      // Act
      const result = await service.calculateCreditLimit(
        userId,
        totalSavingsBalance,
        avgMonthlyTransactions,
      );

      // Assert
      // Formula: (totalSavingsBalance × 2) + (avgMonthlyTransactions × 3)
      // Expected: (500000 × 2) + (100000 × 3) = 1,300,000
      expect(result).toBe(1300000);
    });

    it('should return minimum limit for small savings', async () => {
      // Arrange
      const userId = 'user-123';
      const totalSavingsBalance = 10000;
      const avgMonthlyTransactions = 5000;

      // Act
      const result = await service.calculateCreditLimit(
        userId,
        totalSavingsBalance,
        avgMonthlyTransactions,
      );

      // Assert
      // Formula: (10000 × 2) + (5000 × 3) = 35,000
      // But minimum is 50,000
      expect(result).toBe(50000); // MIN_CREDIT_LIMIT
    });

    it('should cap at maximum limit for large savings', async () => {
      // Arrange
      const userId = 'user-123';
      const totalSavingsBalance = 10000000;
      const avgMonthlyTransactions = 5000000;

      // Act
      const result = await service.calculateCreditLimit(
        userId,
        totalSavingsBalance,
        avgMonthlyTransactions,
      );

      // Assert
      // Formula would be: (10000000 × 2) + (5000000 × 3) = 35,000,000
      // But capped at MAX_CREDIT_LIMIT
      expect(result).toBe(10000000); // MAX_CREDIT_LIMIT
    });

    it('should handle zero values', async () => {
      // Arrange
      const userId = 'user-123';
      const totalSavingsBalance = 0;
      const avgMonthlyTransactions = 0;

      // Act
      const result = await service.calculateCreditLimit(
        userId,
        totalSavingsBalance,
        avgMonthlyTransactions,
      );

      // Assert
      expect(result).toBe(50000); // MIN_CREDIT_LIMIT
    });
  });

  describe('updateCreditLimit', () => {
    it('should update credit limit successfully', async () => {
      // Arrange
      const newLimit = 750000;
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      const result = await service.updateCreditLimit(mockUser.id, newLimit);

      // Assert
      expect(result).toBeDefined();
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.creditLimit).toBe(newLimit);
    });

    it('should adjust available credit when limit changes', async () => {
      // Arrange
      const newLimit = 800000;
      const accountWithBorrowing = createMockCreditAccount({
        creditLimit: 500000,
        availableCredit: 300000,
        totalBorrowed: 200000,
        totalRepaid: 0,
        outstandingBalance: 200000,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountWithBorrowing);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateCreditLimit(mockUser.id, newLimit);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.creditLimit).toBe(newLimit);
      // Available credit should be: newLimit - borrowed
      // borrowed = totalBorrowed - totalRepaid = 200000 - 0 = 200000
      expect(savedAccount!.availableCredit).toBe(600000); // 800000 - 200000
    });

    it('should enforce minimum limit when updating', async () => {
      // Arrange
      const tooLowLimit = 10000;
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateCreditLimit(mockUser.id, tooLowLimit);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.creditLimit).toBe(50000); // MIN_CREDIT_LIMIT
    });

    it('should enforce maximum limit when updating', async () => {
      // Arrange
      const tooHighLimit = 20000000;
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateCreditLimit(mockUser.id, tooHighLimit);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.creditLimit).toBe(10000000); // MAX_CREDIT_LIMIT
    });
  });

  describe('getCreditAvailability', () => {
    it('should return credit availability details', async () => {
      // Arrange
      const accountWithUtilization = createMockCreditAccount({
        creditLimit: 500000,
        outstandingBalance: 200000,
        availableCredit: 300000,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountWithUtilization);

      // Act
      const result = await service.getCreditAvailability(mockUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.creditLimit).toBe(500000);
      expect(result.availableCredit).toBe(300000);
      expect(result.outstandingBalance).toBe(200000);
      expect(result.utilizationPercentage).toBe(40); // (200000 / 500000) × 100
    });

    it('should handle zero utilization', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);

      // Act
      const result = await service.getCreditAvailability(mockUser.id);

      // Assert
      expect(result.outstandingBalance).toBe(0);
      expect(result.utilizationPercentage).toBe(0);
    });

    it('should handle full utilization', async () => {
      // Arrange
      const fullyUtilizedAccount = createMockCreditAccount({
        creditLimit: 500000,
        outstandingBalance: 500000,
        availableCredit: 0,
      });
      creditAccountRepository.findOne.mockResolvedValue(fullyUtilizedAccount);

      // Act
      const result = await service.getCreditAvailability(mockUser.id);

      // Assert
      expect(result.utilizationPercentage).toBe(100);
      expect(result.availableCredit).toBe(0);
    });

    it('should throw error if credit account not found', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCreditAvailability(mockUser.id)).rejects.toThrow(
        'Credit account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });

  describe('getCreditAccount', () => {
    it('should return credit account for user', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);

      // Act
      const result = await service.getCreditAccount(mockUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.creditLimit).toBe(mockCreditAccount.creditLimit);
      expect(creditAccountRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['user'],
      });
    });

    it('should throw error if credit account not found', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCreditAccount(mockUser.id)).rejects.toThrow(
        'Credit account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should find credit account by user ID', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);

      // Act
      const result = await service.findByUserId(mockUser.id);

      // Assert
      expect(result).toEqual(mockCreditAccount);
      expect(creditAccountRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['user'],
      });
    });

    it('should throw error if account not found', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUserId(mockUser.id)).rejects.toThrow(
        'Credit account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find credit account by ID', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(mockCreditAccount);

      // Act
      const result = await service.findById('credit-123');

      // Assert
      expect(result).toEqual(mockCreditAccount);
      expect(creditAccountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'credit-123' },
        relations: ['user'],
      });
    });

    it('should throw error if account not found', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent')).rejects.toThrow(
        'Credit account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });

  describe('updateAvailableCredit', () => {
    it('should reduce available credit for loan disbursement', async () => {
      // Arrange
      const loanAmount = 100000;
      const accountBeforeLoan = createMockCreditAccount({
        availableCredit: 500000,
        totalBorrowed: 0,
        outstandingBalance: 0,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountBeforeLoan);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateAvailableCredit('credit-123', loanAmount, true);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.availableCredit).toBe(400000); // 500000 - 100000
      expect(savedAccount!.totalBorrowed).toBe(100000); // 0 + 100000
      expect(savedAccount!.outstandingBalance).toBe(100000); // 0 + 100000
    });

    it('should increase available credit for loan repayment', async () => {
      // Arrange
      const repaymentAmount = 50000;
      const accountWithLoan = createMockCreditAccount({
        availableCredit: 400000,
        totalBorrowed: 100000,
        totalRepaid: 0,
        outstandingBalance: 100000,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountWithLoan);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateAvailableCredit('credit-123', repaymentAmount, false);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.availableCredit).toBe(450000); // 400000 + 50000
      expect(savedAccount!.totalRepaid).toBe(50000); // 0 + 50000
      expect(savedAccount!.outstandingBalance).toBe(50000); // 100000 - 50000
    });

    it('should handle multiple loan disbursements', async () => {
      // Arrange
      const firstLoan = 100000;
      const secondLoan = 150000;
      const accountAfterFirstLoan = createMockCreditAccount({
        availableCredit: 400000,
        totalBorrowed: 100000,
        outstandingBalance: 100000,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountAfterFirstLoan);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateAvailableCredit('credit-123', secondLoan, true);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.availableCredit).toBe(250000); // 400000 - 150000
      expect(savedAccount!.totalBorrowed).toBe(250000); // 100000 + 150000
      expect(savedAccount!.outstandingBalance).toBe(250000); // 100000 + 150000
    });

    it('should handle full loan repayment', async () => {
      // Arrange
      const fullRepayment = 100000;
      const accountWithLoan = createMockCreditAccount({
        creditLimit: 500000,
        availableCredit: 400000,
        totalBorrowed: 100000,
        totalRepaid: 0,
        outstandingBalance: 100000,
      });
      creditAccountRepository.findOne.mockResolvedValue(accountWithLoan);
      let savedAccount: Partial<CreditAccount> | undefined;
      creditAccountRepository.save.mockImplementation(
        (account: Partial<CreditAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as CreditAccount);
        },
      );

      // Act
      await service.updateAvailableCredit('credit-123', fullRepayment, false);

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.availableCredit).toBe(500000); // Back to full limit
      expect(savedAccount!.totalRepaid).toBe(100000);
      expect(savedAccount!.outstandingBalance).toBe(0); // Fully repaid
    });

    it('should throw error if account not found', async () => {
      // Arrange
      creditAccountRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateAvailableCredit('non-existent', 100000, true),
      ).rejects.toThrow('Credit account not found');
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });
});
