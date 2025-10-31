import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';

/**
 * Admin user response DTO
 * Excludes sensitive fields like password
 */
export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: EUserStatus })
  status: EUserStatus;

  @ApiProperty({ enum: EUserRole })
  role: EUserRole;

  @ApiProperty()
  lastLogin: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  customerId: string;

  @Exclude()
  kycStatus: string;

  @Exclude()
  kycVerifiedAt: Date;

  @Exclude()
  creditScore: number;
}
