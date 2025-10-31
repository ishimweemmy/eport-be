import { ApiProperty } from '@nestjs/swagger';
import { EKYCStatus } from '../enums/kyc-status.enum';
import { EUserStatus } from '../enums/user-status.enum';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: EKYCStatus })
  kycStatus: EKYCStatus;

  @ApiProperty()
  kycVerifiedAt: Date;

  @ApiProperty()
  creditScore: number;

  @ApiProperty({ enum: EUserStatus })
  status: EUserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
