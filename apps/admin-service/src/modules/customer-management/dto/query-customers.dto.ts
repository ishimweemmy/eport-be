import { IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';

export class QueryCustomersDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by name, email, or customer ID',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: EUserStatus,
  })
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: EUserStatus;

  @ApiPropertyOptional({
    description: 'Filter by KYC status',
    enum: EKYCStatus,
  })
  @IsOptional()
  @IsEnum(EKYCStatus)
  kycStatus?: EKYCStatus;
}
