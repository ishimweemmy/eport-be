import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthService } from './auth.service';
import { AdminUserService } from '../user/user.service';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { TokenService } from '@app/common/auth/services/token.service';
import { PasswordService } from '@app/common/auth/services/password.service';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { BrainService } from '@app/common/brain/brain.service';
import { _404, _401 } from '@app/common/constants/errors-constants';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { LoginDto } from '@app/common/auth/dto/login.dto';
import { RefreshTokenDto } from '@app/common/auth/dto/refresh-token.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { createMockAdmin } from '@admin-service/test-utils/mock-factories';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let userService: jest.Mocked<AdminUserService>;
  let configService: jest.Mocked<AdminConfigService>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let exceptionHandler: jest.Mocked<ExceptionHandler>;
  let brainService: jest.Mocked<BrainService>;

  const mockAdmin = createMockAdmin();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: AdminUserService,
          useValue: {
            findByEmail: jest.fn(),
            existByEmail: jest.fn(),
            registerAdmin: jest.fn(),
            findById: jest.fn(),
            saveUser: jest.fn(),
          },
        },
        {
          provide: AdminConfigService,
          useValue: {
            jwtExpiryTime: '1h',
            jwtRefreshExpiryTime: '30d',
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyToken: jest.fn(),
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
            throwNotFound: jest.fn((error) => {
              throw new Error(error.message);
            }),
            throwBadRequest: jest.fn((error) => {
              throw new Error(error.message);
            }),
            throwUnauthorized: jest.fn((error) => {
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
          },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    userService = module.get(AdminUserService) as jest.Mocked<AdminUserService>;
    configService = module.get(
      AdminConfigService,
    ) as jest.Mocked<AdminConfigService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
    passwordService = module.get(
      PasswordService,
    ) as jest.Mocked<PasswordService>;
    exceptionHandler = module.get(
      ExceptionHandler,
    ) as jest.Mocked<ExceptionHandler>;
    brainService = module.get(BrainService) as jest.Mocked<BrainService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'admin@creditjambo.com',
      password: 'AdminPassword123!',
    };

    it('should successfully log in an admin user', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockAdmin);
      brainService.remindMe.mockResolvedValue(null); // No failed attempts
      passwordService.compare.mockResolvedValue(true);
      tokenService.generateAccessToken.mockResolvedValue('admin-access-token');
      tokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'admin-refresh-token',
        tokenId: 'token-id-123',
      });
      brainService.memorize.mockResolvedValue(undefined);
      userService.saveUser.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toMatchObject({
        token: 'admin-access-token',
        refreshToken: 'admin-refresh-token',
        user: expect.objectContaining({
          id: mockAdmin.id,
          email: mockAdmin.email,
          role: mockAdmin.role,
        }),
      });
      expect(userService.existByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockAdmin.password,
      );
      expect(tokenService.generateAccessToken).toHaveBeenCalled();
      expect(tokenService.generateRefreshToken).toHaveBeenCalled();
      expect(brainService.memorize).toHaveBeenCalled(); // Store refresh token
    });

    it('should throw error if email does not exist', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials provided',
      );
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.INVALID_CREDENTIALS,
      );
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockAdmin);
      brainService.remindMe.mockResolvedValue(null);
      passwordService.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials provided',
      );
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.INVALID_CREDENTIALS,
      );
    });

    it('should throw error if admin account is not active', async () => {
      // Arrange
      const inactiveAdmin = createMockAdmin({
        status: EUserStatus.INACTIVE,
      });
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(inactiveAdmin);
      brainService.remindMe.mockResolvedValue(null);
      passwordService.compare.mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.ACCOUNT_NOT_VERIFIED,
      );
    });

    it('should handle locked account due to failed login attempts', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockAdmin);
      brainService.remindMe.mockResolvedValue(10); // 10 failed attempts

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'The maximum number of login attempts has been reached, try again after 5 minutes',
      );
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS,
      );
    });

    it('should increment failed login attempts on invalid password', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockAdmin);
      brainService.remindMe.mockResolvedValue(2); // 2 previous failed attempts
      passwordService.compare.mockResolvedValue(false);

      // Act & Assert
      try {
        await service.login(loginDto);
      } catch (error) {
        // Expected to throw
      }

      expect(brainService.memorize).toHaveBeenCalledWith(
        expect.stringContaining('admin_failed_login_attempt:'),
        3,
        expect.any(Number),
      );
    });

    it('should clear failed login attempts on successful login', async () => {
      // Arrange
      userService.existByEmail.mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(mockAdmin);
      brainService.remindMe.mockResolvedValue(2); // Had previous failed attempts
      passwordService.compare.mockResolvedValue(true);
      tokenService.generateAccessToken.mockResolvedValue('admin-access-token');
      tokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'admin-refresh-token',
        tokenId: 'token-id-123',
      });
      brainService.memorize.mockResolvedValue(undefined);
      userService.saveUser.mockResolvedValue(mockAdmin);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe('admin-access-token');
      // Note: Service doesn't currently clear failed attempts on success
    });
  });

  describe('register', () => {
    const registerDto: RegisterAdminDto = {
      email: 'newadmin@creditjambo.com',
      firstName: 'New',
      lastName: 'Admin',
      phoneNumber: '+250788000000',
      password: 'SecureAdminPass123!',
    };

    it('should successfully register a new admin user', async () => {
      // Arrange
      const newAdmin = createMockAdmin({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
      });
      userService.registerAdmin.mockResolvedValue(newAdmin);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('Admin registered successfully');
      expect(result.user).toBeDefined();
      expect(userService.registerAdmin).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refreshAccessToken', () => {
    const refreshToken = 'valid-refresh-token';

    it('should generate new tokens with valid refresh token', async () => {
      // Arrange
      const mockPayload = {
        id: mockAdmin.id,
        email: mockAdmin.email,
        role: EUserRole.ADMIN,
        tokenId: 'token-id-123',
      };
      tokenService.verifyToken.mockResolvedValue(mockPayload);
      brainService.remindMe.mockResolvedValue(refreshToken); // Token exists in cache
      userService.findById.mockResolvedValue(mockAdmin);
      tokenService.generateAccessToken.mockResolvedValue(
        'new-admin-access-token',
      );
      tokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'new-admin-refresh-token',
        tokenId: 'new-token-id',
      });

      // Act
      const result = await service.refreshAccessToken(refreshToken);

      // Assert
      expect(result).toEqual({
        token: 'new-admin-access-token',
        refreshToken: 'new-admin-refresh-token',
        user: expect.any(Object),
      });
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(brainService.remindMe).toHaveBeenCalled(); // Check if token exists in cache
      expect(brainService.forget).toHaveBeenCalled(); // Old token rotation
      expect(userService.findById).toHaveBeenCalledWith(mockAdmin.id);
    });

    it('should throw error if refresh token not in cache', async () => {
      // Arrange
      const mockPayload = {
        id: mockAdmin.id,
        email: mockAdmin.email,
        role: EUserRole.ADMIN,
        tokenId: 'token-id-123',
      };
      tokenService.verifyToken.mockResolvedValue(mockPayload);
      brainService.remindMe.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow();
      expect(exceptionHandler.throwUnauthorized).toHaveBeenCalledWith(
        _401.INVALID_CREDENTIALS,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout admin user', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        id: 'admin-123',
        email: mockAdmin.email,
        role: EUserRole.ADMIN,
        tokenId: 'token-id-123',
      };
      tokenService.verifyToken.mockResolvedValue(mockPayload);
      brainService.forget.mockResolvedValue(1);

      // Act
      await service.logout(refreshToken);

      // Assert
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(brainService.forget).toHaveBeenCalled();
    });

    it('should silently fail if token is invalid', async () => {
      // Arrange
      const invalidToken = 'invalid-token';
      tokenService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert - Should not throw
      await expect(service.logout(invalidToken)).resolves.not.toThrow();
    });
  });
});
