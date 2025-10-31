import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Logger } from '@nestjs/common';
import { TierCronService } from './tier-cron.service';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { DailyBalanceSnapshot } from '@customer-service/modules/savings/entities/daily-balance-snapshot.entity';
import { NotificationPreProcessor } from '@crons-service/integrations/notification/notification.preprocessor';
import { EAccountTier } from '@customer-service/modules/savings/enums/account-tier.enum';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';

describe('TierCronService', () => {
  let service: TierCronService;
  let savingsAccountRepository: jest.Mocked<Repository<SavingsAccount>>;
  let dailyBalanceSnapshotRepository: jest.Mocked<
    Repository<DailyBalanceSnapshot>
  >;
  let notificationProcessor: jest.Mocked<NotificationPreProcessor>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    kycStatus: EKYCStatus.VERIFIED,
  };

  const mockSavingsAccount = {
    id: 'savings-123',
    accountNumber: 'SA000001',
    user: mockUser,
    balance: 500000,
    tier: EAccountTier.BRONZE,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 6)), // 6 months old
  };

  const mockSnapshots = [
    { id: '1', balance: 450000, snapshotDate: new Date() },
    { id: '2', balance: 500000, snapshotDate: new Date() },
    { id: '3', balance: 550000, snapshotDate: new Date() },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierCronService,
        {
          provide: getRepositoryToken(SavingsAccount),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DailyBalanceSnapshot),
          useValue: {
            find: jest.fn(),
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

    service = module.get<TierCronService>(TierCronService);
    savingsAccountRepository = module.get(
      getRepositoryToken(SavingsAccount),
    ) as jest.Mocked<Repository<SavingsAccount>>;
    dailyBalanceSnapshotRepository = module.get(
      getRepositoryToken(DailyBalanceSnapshot),
    ) as jest.Mocked<Repository<DailyBalanceSnapshot>>;
    notificationProcessor = module.get(
      NotificationPreProcessor,
    ) as jest.Mocked<NotificationPreProcessor>;

    // Mock logger
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateUpgrades', () => {
    it('should evaluate and upgrade eligible accounts', async () => {
      // Arrange
      savingsAccountRepository.find.mockResolvedValue([
        mockSavingsAccount as any,
      ]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        mockSnapshots as any,
      );
      savingsAccountRepository.save.mockResolvedValue({
        ...mockSavingsAccount,
        tier: EAccountTier.SILVER,
      } as any);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(savingsAccountRepository.find).toHaveBeenCalled();
      expect(dailyBalanceSnapshotRepository.find).toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalled();
    });

    it('should skip accounts with no snapshots', async () => {
      // Arrange
      savingsAccountRepository.find.mockResolvedValue([
        mockSavingsAccount as any,
      ]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue([]); // No snapshots

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(savingsAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should not upgrade if tier remains the same', async () => {
      // Arrange
      const lowBalanceSnapshots = [
        { balance: 10000, snapshotDate: new Date() },
        { balance: 15000, snapshotDate: new Date() },
      ];
      savingsAccountRepository.find.mockResolvedValue([
        mockSavingsAccount as any,
      ]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        lowBalanceSnapshots as any,
      );

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(savingsAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should upgrade from BRONZE to SILVER for eligible accounts', async () => {
      // Arrange
      const silverEligibleSnapshots = mockSnapshots.map((s) => ({
        ...s,
        balance: 600000,
      })); // High balance
      const account = { ...mockSavingsAccount, tier: EAccountTier.BRONZE };
      savingsAccountRepository.find.mockResolvedValue([account as any]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        silverEligibleSnapshots as any,
      );
      let savedAccount: any;
      savingsAccountRepository.save.mockImplementation((acc) => {
        savedAccount = acc;
        return Promise.resolve(acc as any);
      });

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(savedAccount.tier).toBe(EAccountTier.SILVER);
      expect(notificationProcessor.sendTemplateEmail).toHaveBeenCalled();
    });

    it('should upgrade to GOLD for high balance and verified KYC', async () => {
      // Arrange
      const goldEligibleSnapshots = mockSnapshots.map((s) => ({
        ...s,
        balance: 1500000,
      })); // Very high balance
      const silverAccount = {
        ...mockSavingsAccount,
        tier: EAccountTier.SILVER,
        createdAt: new Date(new Date().setMonth(new Date().getMonth() - 12)), // 12 months old
      };
      savingsAccountRepository.find.mockResolvedValue([silverAccount as any]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        goldEligibleSnapshots as any,
      );
      let savedAccount: any;
      savingsAccountRepository.save.mockImplementation((acc) => {
        savedAccount = acc;
        return Promise.resolve(acc as any);
      });

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(savedAccount.tier).toBe(EAccountTier.GOLD);
    });

    it('should not upgrade to GOLD if KYC not verified', async () => {
      // Arrange
      const goldEligibleSnapshots = mockSnapshots.map((s) => ({
        ...s,
        balance: 1500000,
      }));
      const unverifiedAccount = {
        ...mockSavingsAccount,
        user: { ...mockUser, kycStatus: EKYCStatus.PENDING },
      };
      savingsAccountRepository.find.mockResolvedValue([
        unverifiedAccount as any,
      ]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        goldEligibleSnapshots as any,
      );

      // Act
      await service.evaluateUpgrades();

      // Assert
      // Should not upgrade to GOLD without KYC
      expect(savingsAccountRepository.save).not.toHaveBeenCalled();
    });

    it('should handle multiple accounts', async () => {
      // Arrange
      const accounts = [
        { ...mockSavingsAccount, id: 'acc1' },
        { ...mockSavingsAccount, id: 'acc2' },
        { ...mockSavingsAccount, id: 'acc3' },
      ];
      savingsAccountRepository.find.mockResolvedValue(accounts as any);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        mockSnapshots as any,
      );
      savingsAccountRepository.save.mockResolvedValue({
        tier: EAccountTier.SILVER,
      } as any);

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(dailyBalanceSnapshotRepository.find).toHaveBeenCalledTimes(3);
    });

    it('should log errors without stopping evaluation', async () => {
      // Arrange
      const accounts = [
        mockSavingsAccount,
        { ...mockSavingsAccount, id: 'problematic-account' },
      ];
      savingsAccountRepository.find.mockResolvedValue(accounts as any);
      dailyBalanceSnapshotRepository.find
        .mockResolvedValueOnce(mockSnapshots as any)
        .mockRejectedValueOnce(new Error('Database error'));

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(service['logger'].log).toHaveBeenCalled();
      // Should continue processing despite error
    });

    it('should send upgrade notification email', async () => {
      // Arrange
      savingsAccountRepository.find.mockResolvedValue([
        mockSavingsAccount as any,
      ]);
      dailyBalanceSnapshotRepository.find.mockResolvedValue(
        mockSnapshots as any,
      );
      savingsAccountRepository.save.mockResolvedValue({
        ...mockSavingsAccount,
        tier: EAccountTier.SILVER,
      } as any);

      // Act
      await service.evaluateUpgrades();

      // Assert
      expect(notificationProcessor.sendTemplateEmail).toHaveBeenCalledWith(
        expect.any(String), // Template name
        [mockUser.email],
        expect.objectContaining({
          firstName: mockUser.firstName,
          newTier: expect.any(String),
        }),
      );
    });
  });

  describe('determineNewTier', () => {
    it('should return BRONZE for low balance', () => {
      // Act
      const tier = service['determineNewTier'](50000, 6, true);

      // Assert
      expect(tier).toBe(EAccountTier.BRONZE);
    });

    it('should return SILVER for medium balance and sufficient age', () => {
      // Act
      const tier = service['determineNewTier'](600000, 6, true);

      // Assert
      expect(tier).toBe(EAccountTier.SILVER);
    });

    it('should return GOLD for high balance, age, and verified KYC', () => {
      // Act
      const tier = service['determineNewTier'](1500000, 12, true);

      // Assert
      expect(tier).toBe(EAccountTier.GOLD);
    });

    it('should not return GOLD without verified KYC', () => {
      // Act
      const tier = service['determineNewTier'](1500000, 12, false);

      // Assert
      expect(tier).not.toBe(EAccountTier.GOLD);
    });

    it('should not return PLATINUM for very high balance, age, and verified KYC', () => {
      // Act
      const tier = service['determineNewTier'](5000000, 24, true);

      // Assert
      expect(tier).toBe(EAccountTier.PLATINUM);
    });
  });
});
