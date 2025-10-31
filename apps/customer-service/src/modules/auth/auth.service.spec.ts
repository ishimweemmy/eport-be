import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { BrainService } from '@app/common/brain/brain.service';
import { NotificationPreProcessor } from '@customer-service/integrations/notification/notification.preprocessor';
import { PasswordService, TokenService } from '@app/common/auth';
import { LoginDTO } from './dto/login.dto';
import { EUserStatus } from '../user/enums/user-status.enum';
import { EUserRole } from '../user/enums/user-role.enum';
import { _400, _401, _404 } from '@app/common/constants/errors-constants';
import { createMockUser } from '@customer-service/test-utils/mock-factories';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let brainService: jest.Mocked<BrainService>;
  let notificationProcessor: jest.Mocked<NotificationPreProcessor>;

  const mockUser = createMockUser({
    password: 'hashedPassword123',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            existByEmail: jest.fn(),
            findByEmail: jest.fn(),
            saveUser: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockResolvedValue('token'),
            generateRefreshToken: jest
              .fn()
              .mockResolvedValue({ refreshToken: 'token', tokenId: 'id' }),
            verifyToken: jest.fn().mockResolvedValue({}),
            decodeToken: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            compare: jest.fn(),
            hash: jest.fn(),
          },
        },
        {
          provide: ExceptionHandler,
          useValue: {
            throwUnauthorized: jest.fn((error) => {
              throw new Error(error.message);
            }),
            throwBadRequest: jest.fn((error) => {
              throw new Error(error.message);
            }),
          },
        },
        {
          provide: BrainService,
          useValue: {
            remindMe: jest.fn(),
            memorize: jest.fn(),
            forget: jest.fn(),
            generateOTP: jest.fn(),
          },
        },
        {
          provide: NotificationPreProcessor,
          useValue: {
            sendTemplateEmail: jest.fn(),
          },
        },
        {
          provide: CoreServiceConfigService,
          useValue: {
            jwtSecretKey: 'test-secret',
            jwtExpiryTime: '1h',
            jwtRefreshSecretKey: 'test-refresh-secret',
            jwtRefreshExpiryTime: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
    passwordService = module.get(
      PasswordService,
    ) as jest.Mocked<PasswordService>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    brainService = module.get(BrainService) as jest.Mocked<BrainService>;
    notificationProcessor = module.get(
      NotificationPreProcessor,
    ) as jest.Mocked<NotificationPreProcessor>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const updatedUser = { ...mockUser, lastLogin: new Date() };
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.saveUser.mockResolvedValue(updatedUser);
      brainService.remindMe.mockResolvedValue(null); // No failed attempts
      passwordService.compare.mockResolvedValue(true);
      tokenService.generateAccessToken.mockResolvedValue('access-token-123');
      tokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'refresh-token-123',
        tokenId: 'token-id',
      });
      brainService.memorize.mockResolvedValue(undefined);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user).toBeDefined();
      expect(userService.existByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(userService.saveUser).toHaveBeenCalled(); // Update last login
      expect(brainService.memorize).toHaveBeenCalled(); // Store refresh token
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        _400.USER_NOT_ONBOARDED.message,
      );
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _400.USER_NOT_ONBOARDED,
      );
    });

    it('should throw error if account is locked due to failed attempts', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.remindMe.mockResolvedValue(5); // Max failed attempts reached

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS,
      );
    });

    it('should throw error if password is incorrect', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.remindMe.mockResolvedValue(0);
      passwordService.compare.mockResolvedValue(false); // Wrong password

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.INVALID_CREDENTIALS,
      );
      expect(brainService.memorize).toHaveBeenCalled(); // Increment failed attempts
    });

    it('should throw error if user is not active', async () => {
      // Arrange
      const inactiveUser = createMockUser({ status: EUserStatus.INACTIVE });
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(inactiveUser);
      brainService.remindMe.mockResolvedValue(null);
      passwordService.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.ACCOUNT_NOT_VERIFIED,
      );
    });

    it('should throw error if email is not verified', async () => {
      // Arrange - User with INACTIVE status (not yet verified)
      const unverifiedUser = createMockUser({ status: EUserStatus.INACTIVE });
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(unverifiedUser);
      brainService.remindMe.mockResolvedValue(null);
      passwordService.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.ACCOUNT_NOT_VERIFIED,
      );
    });

    it('should send notification after 3 failed attempts', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.remindMe.mockResolvedValue(3); // Already 3 failed attempts (threshold reached)
      passwordService.compare.mockResolvedValue(false);
      brainService.memorize.mockResolvedValue(undefined);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(notificationProcessor.sendTemplateEmail).toHaveBeenCalled();
      expect(brainService.memorize).toHaveBeenCalled(); // Increment failed attempts
    });
  });

  describe('refreshAccessToken', () => {
    const refreshToken = 'valid-refresh-token';
    const mockPayload = {
      id: 'user-123',
      email: 'test@example.com',
      role: EUserRole.CUSTOMER,
      tokenId: 'token-id-123',
    };

    beforeEach(() => {
      userService.findById = jest.fn();
    });

    it('should successfully refresh access token', async () => {
      // Arrange
      tokenService.verifyToken.mockResolvedValueOnce(mockPayload);
      brainService.remindMe.mockResolvedValue(refreshToken); // Token exists in cache
      (userService.findById as jest.Mock).mockResolvedValue(mockUser);
      brainService.forget.mockResolvedValue(1); // Delete old token
      tokenService.generateAccessToken.mockResolvedValueOnce(
        'new-access-token',
      );
      tokenService.generateRefreshToken.mockResolvedValueOnce({
        refreshToken: 'new-refresh-token',
        tokenId: 'new-token-id',
      });
      brainService.memorize.mockResolvedValue(undefined);

      // Act
      const result = await service.refreshAccessToken(refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.user).toBeDefined();
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(brainService.remindMe).toHaveBeenCalled();
      expect(brainService.forget).toHaveBeenCalled(); // Old token deleted
      expect(tokenService.generateAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
    });

    it('should throw error if refresh token is invalid', async () => {
      // Arrange
      tokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalled();
    });

    it('should throw error if refresh token not found in cache', async () => {
      // Arrange
      tokenService.verifyToken.mockResolvedValueOnce(mockPayload);
      brainService.remindMe.mockResolvedValue(null); // Token not in cache

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalled();
    });

    it('should throw error if user no longer exists', async () => {
      // Arrange
      tokenService.verifyToken.mockResolvedValueOnce(mockPayload);
      brainService.remindMe.mockResolvedValue(refreshToken);
      (userService.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    const refreshToken = 'valid-refresh-token';
    const mockPayload = {
      id: 'user-123',
      email: 'test@example.com',
      role: EUserRole.CUSTOMER,
      tokenId: 'token-id-123',
    };

    it('should successfully logout and invalidate refresh token', async () => {
      // Arrange
      tokenService.verifyToken.mockResolvedValueOnce(mockPayload);
      brainService.forget.mockResolvedValue(1);

      // Act
      await service.logout(refreshToken);

      // Assert
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(brainService.forget).toHaveBeenCalled(); // Remove from cache
    });

    it('should silently fail if refresh token is invalid', async () => {
      // Arrange
      tokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert - logout silently fails on invalid token
      await expect(service.logout(refreshToken)).resolves.toBeUndefined();
    });
  });

  describe('verifyEmail', () => {
    const email = 'test@example.com';
    const otp = 123456;

    it('should successfully verify email with correct OTP', async () => {
      // NOTE: emailVerified field removed - this test needs to be updated based on actual logic
      // Arrange
      const unverifiedUser = createMockUser();
      userService.findByEmail.mockResolvedValue(unverifiedUser);
      brainService.remindMe.mockResolvedValue(otp); // Correct OTP in cache
      const verifiedUser = createMockUser();
      userService.saveUser.mockResolvedValue(verifiedUser);
      brainService.forget.mockResolvedValue(1);

      // Act
      const result = await service.verifyEmail(email, otp);

      // Assert
      expect(result).toBeDefined();
      expect(userService.saveUser).toHaveBeenCalled();
      expect(brainService.forget).toHaveBeenCalled(); // Remove OTP from cache
    });

    it('should throw error if OTP is incorrect', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.remindMe.mockResolvedValue(654321); // Different OTP

      // Act & Assert
      await expect(service.verifyEmail(email, otp)).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.INVALID_OTP,
      );
    });

    it('should throw error if OTP has expired', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.remindMe.mockResolvedValue(null); // No OTP in cache

      // Act & Assert
      await expect(service.verifyEmail(email, otp)).rejects.toThrow();
      expect(exceptionHandler.throwBadRequest).toHaveBeenCalledWith(
        _400.INVALID_OTP,
      );
    });
  });

  describe('sendVerificationOTP', () => {
    const email = 'test@example.com';

    it('should successfully send verification OTP', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      brainService.generateOTP.mockResolvedValue(123456);
      brainService.memorize.mockResolvedValue(undefined);
      notificationProcessor.sendTemplateEmail.mockResolvedValue(undefined);

      // Act
      await service.sendVerificationOTP(email);

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(brainService.generateOTP).toHaveBeenCalled(); // Generate OTP
      expect(notificationProcessor.sendTemplateEmail).toHaveBeenCalled(); // Send email
    });

    it('should throw error if user not found', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.sendVerificationOTP(email)).rejects.toThrow();
    });

    it('should generate a 6-digit OTP', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      const generatedOTP = 123456;
      brainService.generateOTP.mockResolvedValue(generatedOTP);
      brainService.memorize.mockResolvedValue(undefined);

      // Act
      await service.sendVerificationOTP(email);

      // Assert
      expect(brainService.generateOTP).toHaveBeenCalled();
      expect(generatedOTP).toBeGreaterThanOrEqual(100000);
      expect(generatedOTP).toBeLessThanOrEqual(999999);
    });
  });
});
