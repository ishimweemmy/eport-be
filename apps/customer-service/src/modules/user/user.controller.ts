import { Body, Controller, Get, Patch, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import {
  PreAuthorize,
  AuthUser,
} from '@customer-service/decorators/auth.decorator';
import { EUserRole } from './enums/user-role.enum';
import { Public } from '@app/common/decorators/public.decorator';
import { SavingsService } from '../savings/savings.service';
import { CreditService } from '../credit/credit.service';
import { ESavingsAccountType } from '../savings/enums/savings-account-type.enum';
import { CUSTOMER_DEFAULTS } from './constants/customer.constants';
import { AuthService } from '../auth/auth.service';

@ApiTags('Customer')
@Controller('customer')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly savingsService: SavingsService,
    private readonly creditService: CreditService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new customer account' })
  async register(
    @Body() dto: RegisterCustomerDto,
  ): Promise<CustomerResponseDto & { message: string }> {
    // Register customer
    const user = await this.userService.registerCustomer(dto);

    // Auto-create savings account (BASIC tier)
    await this.savingsService.createSavingsAccount(user.id, {
      accountType: ESavingsAccountType.REGULAR,
    });

    // Auto-create credit account with initial limit
    await this.creditService.createCreditAccount(
      user.id,
      CUSTOMER_DEFAULTS.INITIAL_CREDIT_LIMIT,
    );

    return {
      ...this.mapToResponseDto(user),
      message:
        'Registration successful. Please check your email for verification code.',
    };
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email with OTP' })
  async verifyEmail(
    @Body() body: { email: string; otp: number },
  ): Promise<{ message: string; user: CustomerResponseDto }> {
    const user = await this.authService.verifyEmail(body.email, body.otp);
    return {
      message: 'Email verified successfully. Your account is now active.',
      user: this.mapToResponseDto(user),
    };
  }

  @Post('resend-otp')
  @Public()
  @ApiOperation({ summary: 'Resend verification OTP' })
  async resendOTP(
    @Body() body: { email: string },
  ): Promise<{ message: string }> {
    await this.authService.sendVerificationOTP(body.email);
    return {
      message: 'Verification code sent to your email.',
    };
  }

  @Get('profile')
  @PreAuthorize(EUserRole.CUSTOMER)
  @AuthUser()
  @ApiOperation({ summary: 'Get customer profile' })
  async getProfile(@Request() req): Promise<CustomerResponseDto> {
    const user = await this.userService.findById(req.user.id);
    return this.mapToResponseDto(user);
  }

  @Patch('profile')
  @PreAuthorize(EUserRole.CUSTOMER)
  @AuthUser()
  @ApiOperation({ summary: 'Update customer profile' })
  async updateProfile(
    @Request() req,
    @Body() dto: UpdateCustomerProfileDto,
  ): Promise<CustomerResponseDto> {
    const user = await this.userService.updateCustomerProfile(req.user.id, dto);
    return this.mapToResponseDto(user);
  }

  @Get('credit-score')
  @PreAuthorize(EUserRole.CUSTOMER)
  @AuthUser()
  @ApiOperation({ summary: 'Get customer credit score' })
  async getCreditScore(@Request() req): Promise<{ creditScore: number }> {
    const user = await this.userService.findById(req.user.id);
    return { creditScore: user.creditScore };
  }

  private mapToResponseDto(user: any): CustomerResponseDto {
    return {
      id: user.id,
      customerId: user.customerId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      kycStatus: user.kycStatus,
      kycVerifiedAt: user.kycVerifiedAt,
      creditScore: user.creditScore,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
