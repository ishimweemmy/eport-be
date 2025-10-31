import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AdminUserService } from '@admin-service/modules/user/user.service';
import { LoginDto } from '@app/common/auth/dto/login.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _401, _403 } from '@app/common/constants/errors-constants';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { BrainService } from '@app/common/brain/brain.service';
import { plainToClass } from 'class-transformer';
import { PasswordService, TokenService, JwtPayload } from '@app/common/auth';
import { RegisterAdminDto } from '@admin-service/modules/auth/dto/register-admin.dto';
import { AdminResponseDto } from '@admin-service/modules/user/dto/admin-response.dto';

// Brain cache constants for admin service
const FAILED_LOGIN_ATTEMPT = { name: 'admin_failed_login_attempt', ttl: 900 }; // 15 minutes
const REFRESH_TOKEN_CACHE = { name: 'admin_refresh_token', ttl: 604800 }; // 7 days
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_LOGIN_ATTEMPTS_TO_NOTIFY = 3;

/**
 * Admin Authentication Service
 * Simpler than customer auth - no OTP, no email verification, no KYC
 */
@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(forwardRef(() => AdminUserService))
    private readonly userService: AdminUserService,
    private readonly config: AdminConfigService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
  ) {}

  /**
   * Admin login
   * Validates credentials and returns JWT token
   */
  async login(dto: LoginDto) {
    const userExists = await this.userService.existByEmail(dto.email);
    if (!userExists) {
      this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }

    const user: User = await this.userService.findByEmail(dto.email);

    // Check if user is actually an admin
    if (user.role !== EUserRole.ADMIN) {
      this.exceptionHandler.throwUnauthorized(_403.UNAUTHORIZED);
    }

    const key = `${FAILED_LOGIN_ATTEMPT.name}:${user.email}`;
    const failedAttempts = await this.brainService.remindMe<number>(key);

    if (failedAttempts !== null && failedAttempts >= MAX_FAILED_ATTEMPTS) {
      this.exceptionHandler.throwUnauthorized(
        _401.ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS,
      );
    }

    // Verify password
    const passwordsMatch = await this.passwordService.compare(
      dto.password.toString(),
      user.password.toString(),
    );

    if (!passwordsMatch) {
      await this.handleFailedLogin(key, failedAttempts);
      throw this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }

    // Check if account is active
    if (user.status !== EUserStatus.ACTIVE) {
      this.exceptionHandler.throwUnauthorized(_401.ACCOUNT_NOT_VERIFIED);
    }

    return await this.handleSuccessfulLogin(user);
  }

  /**
   * Register a new admin user
   * Simple registration without customer-specific logic
   */
  async register(dto: RegisterAdminDto) {
    const user = await this.userService.registerAdmin(dto);

    return {
      message: 'Admin registered successfully',
      user: plainToClass(AdminResponseDto, user),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = await this.tokenService.verifyToken(
        refreshToken,
        this.config.jwtRefreshSecretKey,
      );

      const key = `${REFRESH_TOKEN_CACHE.name}:${decoded.id}:${decoded.tokenId}`;
      const storedToken = await this.brainService.remindMe<string>(key);

      if (!storedToken || storedToken !== refreshToken) {
        this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
      }

      const user = await this.userService.findById(decoded.id);

      // Delete old refresh token (rotation)
      await this.brainService.forget(key);

      // Generate new tokens
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.getToken(user),
        this.generateRefreshToken(user),
      ]);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: plainToClass(AdminResponseDto, user),
      };
    } catch (error) {
      this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = await this.tokenService.verifyToken(
        refreshToken,
        this.config.jwtRefreshSecretKey,
      );

      const key = `${REFRESH_TOKEN_CACHE.name}:${decoded.id}:${decoded.tokenId}`;
      await this.brainService.forget(key);
    } catch (error) {
      // Silently fail if token already invalid
    }
  }

  /**
   * Generate JWT access token for authenticated admin
   */
  private async getToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      role: user.role,
      id: user.id,
      // No customerId for admins
    };

    return await this.tokenService.generateAccessToken(
      payload,
      this.config.jwtSecretKey,
      this.config.jwtExpiryTime,
    );
  }

  /**
   * Generate refresh token and store in Redis
   */
  private async generateRefreshToken(user: User): Promise<string> {
    const { refreshToken, tokenId } =
      await this.tokenService.generateRefreshToken(
        user.id,
        this.config.jwtRefreshSecretKey,
        this.config.jwtRefreshExpiryTime,
      );

    const key = `${REFRESH_TOKEN_CACHE.name}:${user.id}:${tokenId}`;
    await this.brainService.memorize(
      key,
      refreshToken,
      REFRESH_TOKEN_CACHE.ttl,
    );

    return refreshToken;
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(
    key: string,
    failedAttempts: number,
  ): Promise<void> {
    if (failedAttempts === null) {
      await this.brainService.memorize(key, 1, FAILED_LOGIN_ATTEMPT.ttl);
    } else {
      await this.brainService.memorize(
        key,
        failedAttempts + 1,
        FAILED_LOGIN_ATTEMPT.ttl,
      );
    }
  }

  /**
   * Handle successful login
   */
  private async handleSuccessfulLogin(user: User) {
    user.lastLogin = new Date();

    const [token, refreshToken, savedUser] = await Promise.all([
      this.getToken(user),
      this.generateRefreshToken(user),
      this.userService.saveUser(user),
    ]);

    return {
      token,
      refreshToken,
      user: plainToClass(AdminResponseDto, savedUser),
    };
  }
}
