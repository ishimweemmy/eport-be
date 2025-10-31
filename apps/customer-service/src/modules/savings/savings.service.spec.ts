import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SavingsService } from './savings.service';
import { SavingsAccount } from './entities/savings-account.entity';
import { User } from '../user/entities/user.entity';
import { TransactionService } from '../transaction/transaction.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { NotificationPreProcessor } from '../../integrations/notification/notification.preprocessor';
import { CreateSavingsAccountDto } from './dto/create-savings-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { EAccountStatus } from './enums/account-status.enum';
import { ESavingsAccountType } from './enums/savings-account-type.enum';
import { _404, _400 } from '@app/common/constants/errors-constants';
import {
  createMockUser,
  createMockSavingsAccount,
} from '@customer-service/test-utils/mock-factories';

describe('SavingsService', () => {
  let service: SavingsService;
  let savingsRepository: jest.Mocked<Repository<SavingsAccount>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let transactionService: jest.Mocked<TransactionService>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let notificationProcessor: jest.Mocked<NotificationPreProcessor>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser = createMockUser();
  const mockSavingsAccount = createMockSavingsAccount({
    user: mockUser,
    balance: 100000,
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
        SavingsService,
        {
          provide: getRepositoryToken(SavingsAccount),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            getDailyTransactionTotal: jest.fn(),
            getMonthlyTransactionTotal: jest.fn(),
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
          provide: NotificationPreProcessor,
          useValue: {
            sendTemplateEmail: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<SavingsService>(SavingsService);
    savingsRepository = module.get(
      getRepositoryToken(SavingsAccount),
    ) as jest.Mocked<Repository<SavingsAccount>>;
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
    transactionService = module.get(
      TransactionService,
    ) as jest.Mocked<TransactionService>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    notificationProcessor = module.get(
      NotificationPreProcessor,
    ) as jest.Mocked<NotificationPreProcessor>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSavingsAccount', () => {
    const createDto: CreateSavingsAccountDto = {
      accountType: ESavingsAccountType.REGULAR,
    };

    it('should successfully create a savings account', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      savingsRepository.count.mockResolvedValue(0); // First account
      savingsRepository.create.mockReturnValue(mockSavingsAccount);
      savingsRepository.save.mockResolvedValue(mockSavingsAccount);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.createSavingsAccount(mockUser.id, createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.accountType).toBe(createDto.accountType);
      expect(result.balance).toBe(0); // Initial balance is always 0
      expect(savingsRepository.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createSavingsAccount(mockUser.id, createDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.USER_NOT_FOUND,
      );
    });

    it('should generate unique account number', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      savingsRepository.count.mockResolvedValue(5); // 6th account
      let capturedAccount: Partial<SavingsAccount> | undefined;
      savingsRepository.create.mockImplementation(
        (account: Partial<SavingsAccount>) => {
          capturedAccount = account;
          return account as SavingsAccount;
        },
      );
      savingsRepository.save.mockResolvedValue(mockSavingsAccount);

      // Act
      await service.createSavingsAccount(mockUser.id, createDto);

      // Assert
      expect(capturedAccount).toBeDefined();
      expect(capturedAccount!.accountNumber).toMatch(/SA\d{6}/);
    });

    it('should set correct interest rate for account type', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      savingsRepository.count.mockResolvedValue(0);
      let capturedAccount: Partial<SavingsAccount> | undefined;
      savingsRepository.create.mockImplementation(
        (account: Partial<SavingsAccount>) => {
          capturedAccount = account;
          return account as SavingsAccount;
        },
      );
      savingsRepository.save.mockResolvedValue(mockSavingsAccount);

      // Act
      await service.createSavingsAccount(mockUser.id, createDto);

      // Assert
      expect(capturedAccount).toBeDefined();
      expect(capturedAccount!.interestRate).toBeGreaterThan(0);
    });
  });

  describe('deposit', () => {
    const depositDto: DepositDto = {
      savingsAccountId: 'savings-123',
      amount: 50000,
    };

    it('should successfully deposit funds', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(0);
      const mockQueryRunner = dataSource.createQueryRunner();
      let savedAccount: Partial<SavingsAccount> | undefined;
      (mockQueryRunner.manager.save as jest.Mock).mockImplementation(
        (entity: SavingsAccount | unknown) => {
          if (
            entity &&
            typeof entity === 'object' &&
            'balance' in entity &&
            'accountNumber' in entity
          ) {
            savedAccount = entity as Partial<SavingsAccount>;
          }
          return Promise.resolve(entity);
        },
      );

      // Act
      const result = await service.deposit(mockUser.id, depositDto);

      // Assert
      expect(result).toBeDefined();
      expect(savedAccount).toBeDefined();
      expect(Number(savedAccount!.balance)).toBe(150000); // 100000 + 50000
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error if account not found', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deposit(mockUser.id, depositDto)).rejects.toThrow(
        'Savings account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });

    it('should throw error if account is not active', async () => {
      // Arrange
      const inactiveAccount = createMockSavingsAccount({
        status: EAccountStatus.CLOSED,
        user: mockUser,
      });
      savingsRepository.findOne.mockResolvedValue(inactiveAccount);

      // Act & Assert
      await expect(service.deposit(mockUser.id, depositDto)).rejects.toThrow(
        'Account is not active',
      );
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith({
        message: 'Account is not active',
        code: 'ACCOUNT_NOT_ACTIVE',
      });
    });

    it('should rollback transaction if daily deposit limit exceeded', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(1000000); // Already at high limit

      // Act & Assert
      await expect(service.deposit(mockUser.id, depositDto)).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(0);
      const mockQueryRunner = dataSource.createQueryRunner();
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.deposit(mockUser.id, depositDto)).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    const withdrawDto: WithdrawDto = {
      savingsAccountId: 'savings-123',
      amount: 30000,
    };

    it('should successfully withdraw funds', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(0);
      transactionService.getMonthlyTransactionTotal.mockResolvedValue(0);
      const mockQueryRunner = dataSource.createQueryRunner();
      let savedAccount: Partial<SavingsAccount> | undefined;
      (mockQueryRunner.manager.save as jest.Mock).mockImplementation(
        (entity: SavingsAccount | unknown) => {
          if (
            entity &&
            typeof entity === 'object' &&
            'balance' in entity &&
            'accountNumber' in entity
          ) {
            savedAccount = entity as Partial<SavingsAccount>;
          }
          return Promise.resolve(entity);
        },
      );

      // Act
      const result = await service.withdraw(mockUser.id, withdrawDto);

      // Assert
      expect(result).toBeDefined();
      expect(savedAccount).toBeDefined();
      expect(Number(savedAccount!.balance)).toBe(70000); // 100000 - 30000
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error if insufficient balance', async () => {
      // Arrange
      const largeWithdrawDto = { ...withdrawDto, amount: 200000 };
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(0);
      transactionService.getMonthlyTransactionTotal.mockResolvedValue(0);

      // Act & Assert
      await expect(
        service.withdraw(mockUser.id, largeWithdrawDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.INSUFFICIENT_BALANCE,
      );
    });

    it('should throw error if account not found', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.withdraw(mockUser.id, withdrawDto)).rejects.toThrow(
        'Savings account not found',
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });

    it('should throw error if account is not active', async () => {
      // Arrange
      const inactiveAccount = createMockSavingsAccount({
        status: EAccountStatus.FROZEN,
        user: mockUser,
      });
      savingsRepository.findOne.mockResolvedValue(inactiveAccount);

      // Act & Assert
      await expect(service.withdraw(mockUser.id, withdrawDto)).rejects.toThrow(
        'Account is not active',
      );
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith({
        message: 'Account is not active',
        code: 'ACCOUNT_NOT_ACTIVE',
      });
    });

    it('should rollback transaction if daily withdrawal limit exceeded', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      transactionService.getDailyTransactionTotal.mockResolvedValue(1000000); // Already at high limit
      transactionService.getMonthlyTransactionTotal.mockResolvedValue(0);

      // Act & Assert
      await expect(
        service.withdraw(mockUser.id, withdrawDto),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalled();
    });
  });

  describe('getAccountsByUserId', () => {
    it('should return all savings accounts for user', async () => {
      // Arrange
      const accounts = [
        mockSavingsAccount,
        { ...mockSavingsAccount, id: 'savings-456' },
      ];
      savingsRepository.find.mockResolvedValue(accounts);

      // Act
      const result = await service.getAccountsByUserId(mockUser.id);

      // Assert
      expect(result).toHaveLength(2);
      expect(savingsRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
        relations: ['user'],
      });
    });

    it('should return empty array if no accounts found', async () => {
      // Arrange
      savingsRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getAccountsByUserId(mockUser.id);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getAccountById', () => {
    it('should return specific savings account', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Act
      const result = await service.getAccountById(mockUser.id, 'savings-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('savings-123');
      expect(savingsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'savings-123', user: { id: mockUser.id } },
        relations: ['user'],
      });
    });

    it('should throw error if account not found', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getAccountById(mockUser.id, 'non-existent'),
      ).rejects.toThrow('Savings account not found');
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return account balance', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);

      // Act
      const result = await service.getBalance(mockUser.id, 'savings-123');

      // Assert
      expect(result).toBeDefined();
      expect(result.balance).toBe(100000);
      expect(result.accountNumber).toBe('SA000001');
    });
  });

  describe('getTotalSavingsBalance', () => {
    it('should return total balance across all accounts', async () => {
      // Arrange
      const accounts = [
        { ...mockSavingsAccount, balance: 100000 },
        { ...mockSavingsAccount, id: 'savings-456', balance: 200000 },
        { ...mockSavingsAccount, id: 'savings-789', balance: 150000 },
      ];
      savingsRepository.find.mockResolvedValue(accounts);

      // Act
      const result = await service.getTotalSavingsBalance(mockUser.id);

      // Assert
      expect(result).toBe(450000); // 100000 + 200000 + 150000
    });

    it('should return 0 if no accounts', async () => {
      // Arrange
      savingsRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getTotalSavingsBalance(mockUser.id);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('closeSavingsAccount', () => {
    it('should successfully close account with zero balance', async () => {
      // Arrange
      const zeroBalanceAccount = createMockSavingsAccount({
        balance: 0,
        user: mockUser,
      });
      savingsRepository.findOne.mockResolvedValue(zeroBalanceAccount);
      savingsRepository.count.mockResolvedValue(2); // User has 2 active accounts
      let savedAccount: Partial<SavingsAccount> | undefined;
      savingsRepository.save.mockImplementation(
        (account: Partial<SavingsAccount>) => {
          savedAccount = account;
          return Promise.resolve(account as SavingsAccount);
        },
      );

      // Act
      await service.closeSavingsAccount(mockUser.id, 'savings-123');

      // Assert
      expect(savedAccount).toBeDefined();
      expect(savedAccount!.status).toBe(EAccountStatus.CLOSED);
      expect(savingsRepository.save).toHaveBeenCalled();
    });

    it('should throw error if account has balance', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(mockSavingsAccount);
      savingsRepository.count.mockResolvedValue(2); // User has 2 active accounts

      // Act & Assert
      await expect(
        service.closeSavingsAccount(mockUser.id, 'savings-123'),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalled();
    });

    it('should throw error if trying to close last active account', async () => {
      // Arrange
      const zeroBalanceAccount = createMockSavingsAccount({
        balance: 0,
        user: mockUser,
      });
      savingsRepository.findOne.mockResolvedValue(zeroBalanceAccount);
      savingsRepository.count.mockResolvedValue(1); // Only 1 active account

      // Act & Assert
      await expect(
        service.closeSavingsAccount(mockUser.id, 'savings-123'),
      ).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith({
        message: 'Cannot close your only active account',
        code: 'CANNOT_CLOSE_LAST_ACCOUNT',
      });
    });

    it('should throw error if account not found', async () => {
      // Arrange
      savingsRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.closeSavingsAccount(mockUser.id, 'non-existent'),
      ).rejects.toThrow('Savings account not found');
      expect(exceptionHandler.throwNotFound).toHaveBeenCalled();
    });
  });
});
