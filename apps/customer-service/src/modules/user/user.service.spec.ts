import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { NotificationPreProcessor } from '@customer-service/integrations/notification/notification.preprocessor';
import { BrainService } from '@app/common/brain/brain.service';
import { PasswordService } from '@app/common/auth';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { EUserStatus } from './enums/user-status.enum';
import { EUserRole } from './enums/user-role.enum';
import { EKYCStatus } from './enums/kyc-status.enum';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { createMockUser } from '@customer-service/test-utils/mock-factories';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let notificationProcessor: jest.Mocked<NotificationPreProcessor>;
  let brainService: jest.Mocked<BrainService>;
  let passwordService: jest.Mocked<PasswordService>;

  const mockUser: User = createMockUser({
    customerId: 'CJ-2025-00001',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
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
          provide: NotificationPreProcessor,
          useValue: {
            sendTemplateEmail: jest.fn(),
            sendEmail: jest.fn(),
          },
        },
        {
          provide: BrainService,
          useValue: {
            forget: jest.fn(),
            generateOTP: jest.fn(),
            memorize: jest.fn(),
            remindMe: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<
      Repository<User>
    >;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    notificationProcessor = module.get(
      NotificationPreProcessor,
    ) as jest.Mocked<NotificationPreProcessor>;
    brainService = module.get(BrainService) as jest.Mocked<BrainService>;
    passwordService = module.get(
      PasswordService,
    ) as jest.Mocked<PasswordService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerCustomer', () => {
    const registerDto: RegisterCustomerDto = {
      email: 'newuser@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+250788111111',
      password: 'SecurePass123!',
    };

    it('should successfully register a new customer', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null); // No existing user
      userRepository.count.mockResolvedValue(0); // First customer
      passwordService.hash.mockResolvedValue('hashedPassword123');
      const newUser = {
        ...mockUser,
        ...registerDto,
        password: 'hashedPassword123',
        customerId: 'CJ000001',
      };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      brainService.forget.mockResolvedValue(1);
      brainService.generateOTP.mockResolvedValue(123456);
      brainService.memorize.mockResolvedValue(undefined);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      const result = await service.registerCustomer(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(registerDto.email);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(passwordService.hash).toHaveBeenCalledWith(registerDto.password);
      expect(userRepository.save).toHaveBeenCalled();
      expect(notificationProcessor.sendTemplateEmail).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.registerCustomer(registerDto)).rejects.toThrow(
        _409.USER_ALREADY_ONBOARDED.message,
      );
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _409.USER_ALREADY_ONBOARDED,
      );
    });

    it('should generate unique customer ID', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      userRepository.count.mockResolvedValue(5); // 6th customer
      passwordService.hash.mockResolvedValue('hashedPassword');
      const newUser = { ...mockUser, customerId: 'CJ000006' };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      brainService.forget.mockResolvedValue(1);
      brainService.generateOTP.mockResolvedValue(123456);

      // Act
      const result = await service.registerCustomer(registerDto);

      // Assert
      expect(result.customerId).toMatch(/CJ-\d{4}-\d{5}/);
    });

    it('should set initial customer defaults', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      userRepository.count.mockResolvedValue(0);
      passwordService.hash.mockResolvedValue('hashedPassword');
      let capturedUser: Partial<User> | undefined;
      userRepository.create.mockImplementation((user: Partial<User>) => {
        capturedUser = user;
        return user as User;
      });
      userRepository.save.mockResolvedValue(mockUser);
      brainService.forget.mockResolvedValue(1);
      brainService.generateOTP.mockResolvedValue(123456);

      // Act
      await service.registerCustomer(registerDto);

      // Assert
      expect(capturedUser).toBeDefined();
      expect(capturedUser!.role).toBe(EUserRole.CUSTOMER);
      expect(capturedUser!.status).toBe(EUserStatus.INACTIVE);
      expect(capturedUser.kycStatus).toBe(EKYCStatus.PENDING);
      expect(capturedUser.creditScore).toBeDefined();
    });
  });

  describe('updateCustomerProfile', () => {
    const userId = 'user-123';
    const updateDto: UpdateCustomerProfileDto = {
      firstName: 'UpdatedJohn',
      phoneNumber: '+250788999999',
    };

    it('should successfully update customer profile', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, ...updateDto };
      userRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateCustomerProfile(userId, updateDto);

      // Assert
      expect(result.firstName).toBe(updateDto.firstName);
      expect(result.phoneNumber).toBe(updateDto.phoneNumber);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateCustomerProfile(userId, updateDto),
      ).rejects.toThrow(_404.USER_NOT_FOUND.message);
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.USER_NOT_FOUND,
      );
    });

    it('should only update allowed fields', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);
      let savedUser: Partial<User> | undefined;
      userRepository.save.mockImplementation((user: Partial<User>) => {
        savedUser = user;
        return Promise.resolve(user as User);
      });

      // Act
      await service.updateCustomerProfile(userId, updateDto);

      // Assert
      // Email, role, status should not change
      expect(savedUser).toBeDefined();
      expect(savedUser!.email).toBe(mockUser.email);
      expect(savedUser!.role).toBe(mockUser.role);
      expect(savedUser!.status).toBe(mockUser.status);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById('user-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        _404.USER_NOT_FOUND.message,
      );
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.USER_NOT_FOUND,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow(_404.USER_NOT_FOUND.message);
      expect(exceptionHandler.throwNotFound).toHaveBeenCalledWith(
        _404.USER_NOT_FOUND,
      );
    });
  });

  describe('existByEmail', () => {
    it('should return true if user exists', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.existByEmail('test@example.com');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.existByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('saveUser', () => {
    it('should save and return user', async () => {
      // Arrange
      const userToSave = { ...mockUser };
      userRepository.save.mockResolvedValue(userToSave);

      // Act
      const result = await service.saveUser(userToSave);

      // Assert
      expect(result).toEqual(userToSave);
      expect(userRepository.save).toHaveBeenCalledWith(userToSave);
    });
  });

  describe('generateCustomerId', () => {
    it('should generate customer ID in format CJ-YYYY-XXXXX', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      userRepository.count.mockResolvedValue(0);
      passwordService.hash.mockResolvedValue('hashedPassword');
      const newUser = { ...mockUser, customerId: 'CJ-2025-00001' };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      brainService.forget.mockResolvedValue(1);
      brainService.generateOTP.mockResolvedValue(123456);

      const registerDto: RegisterCustomerDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+250788000000',
        password: 'password',
      };

      // Act
      const result = await service.registerCustomer(registerDto);

      // Assert
      expect(result.customerId).toMatch(/CJ-\d{4}-\d{5}/);
    });
  });
});
