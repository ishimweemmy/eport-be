import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { PasswordService, IUserLoader } from '@app/common/auth';
import { RegisterAdminDto } from '@admin-service/modules/auth/dto/register-admin.dto';

/**
 * Admin User Service
 * Handles admin user management (simpler than customer user service)
 * No customer-specific fields like customerId, KYC, credit score
 */
@Injectable()
export class AdminUserService implements IUserLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Register a new admin user
   * Simple registration without customer-specific logic
   */
  async registerAdmin(dto: RegisterAdminDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.exceptionHandler.throwBadRequest(_409.USER_ALREADY_ONBOARDED);
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Create admin user (no customer fields)
    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
      role: EUserRole.ADMIN,
      status: EUserStatus.ACTIVE, // Admins are active immediately (no email verification)
      // Customer-specific fields remain null
      customerId: null,
      kycStatus: null,
      kycVerifiedAt: null,
      creditScore: null,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Find user by ID (required by IUserLoader interface)
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    return user;
  }

  /**
   * Check if user exists by email
   */
  async existByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  /**
   * Save user entity
   */
  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
