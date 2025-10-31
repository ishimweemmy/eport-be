import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _409 } from '@app/common/constants/errors-constants';
import { EUserStatus } from './enums/user-status.enum';
import { EUserRole } from './enums/user-role.enum';
import { EKYCStatus } from './enums/kyc-status.enum';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CUSTOMER_DEFAULTS } from './constants/customer.constants';
import { NotificationPreProcessor } from '@customer-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@customer-service/configs/email-template-configs/email-templates.config';
import { BrainService } from '@app/common/brain/brain.service';
import { RESET_PASSWORD_CACHE } from '@customer-service/common/constants/brain.constants';
import { PasswordService, IUserLoader } from '@app/common/auth';

@Injectable()
export class UserService implements IUserLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly notificationProcessor: NotificationPreProcessor,
    private readonly brainService: BrainService,
    private readonly passwordService: PasswordService,
  ) {}

  // Customer registration for Credit Jambo
  async registerCustomer(dto: RegisterCustomerDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      this.exceptionHandler.throwBadRequest(_409.USER_ALREADY_ONBOARDED);
    }

    // Hash password using shared PasswordService
    const hashedPassword = await this.passwordService.hash(dto.password);

    // Generate unique customer ID
    const customerId = await this.generateCustomerId();

    // Create User entity with customer fields
    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
      role: EUserRole.CUSTOMER,
      status: EUserStatus.INACTIVE, // Will be activated after email verification
      customerId,
      kycStatus: EKYCStatus.PENDING,
      creditScore: CUSTOMER_DEFAULTS.INITIAL_CREDIT_SCORE,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate OTP and send welcome email
    await this.brainService.forget(savedUser.id);
    const otp = await this.brainService.generateOTP(savedUser.id);
    await this.brainService.memorize(
      savedUser.id,
      otp,
      RESET_PASSWORD_CACHE.ttl,
    );

    // Send welcome email with OTP
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.CUSTOMER_REGISTRATION,
      [savedUser.email],
      {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        customerId: savedUser.customerId,
        email: savedUser.email,
        otp: otp.toString(),
      },
    );

    return savedUser;
  }

  async updateCustomerProfile(
    userId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      this.exceptionHandler.throwNotFound(_404.USER_NOT_FOUND);
    }
    return user;
  }

  async existByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  private async generateCustomerId(): Promise<string> {
    const year = new Date().getFullYear();

    // Get the last customer ID for this year
    const lastUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.customerId LIKE :pattern', { pattern: `CJ-${year}-%` })
      .orderBy('user.createdAt', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastUser && lastUser.customerId) {
      const lastSequence = parseInt(lastUser.customerId.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `CJ-${year}-${sequence.toString().padStart(5, '0')}`;
  }
}
