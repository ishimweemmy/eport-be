import { ApiProperty } from '@nestjs/swagger';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';

export class CustomerAdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phoneNumber?: string;

  @ApiProperty({ enum: EUserStatus })
  status: EUserStatus;

  @ApiProperty({ enum: EUserRole })
  role: EUserRole;

  @ApiProperty()
  creditScore: number;

  @ApiProperty({ enum: EKYCStatus })
  kycStatus: EKYCStatus;

  // Credit account information
  @ApiProperty({ nullable: true })
  creditAccountId?: string;

  @ApiProperty({ nullable: true })
  creditLimit?: number;

  @ApiProperty({ nullable: true })
  availableCredit?: number;

  @ApiProperty({ nullable: true })
  usedCredit?: number;

  // Loan statistics
  @ApiProperty()
  totalLoans: number;

  @ApiProperty()
  activeLoans: number;

  @ApiProperty()
  defaultedLoans: number;

  @ApiProperty()
  fullyPaidLoans: number;

  // Savings information
  @ApiProperty()
  totalSavingsAccounts: number;

  @ApiProperty()
  totalSavingsBalance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CustomerDetailedResponseDto extends CustomerAdminResponseDto {
  @ApiProperty({ type: [Object] })
  loans: any[];

  @ApiProperty({ type: [Object] })
  savingsAccounts: any[];

  @ApiProperty({ type: [Object] })
  recentTransactions: any[];
}

export class CustomerActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  customer: CustomerAdminResponseDto;
}
