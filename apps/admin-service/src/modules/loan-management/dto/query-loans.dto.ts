import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';

export class QueryLoansDto {
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
    description: 'Filter by loan status',
    enum: ELoanStatus,
  })
  @IsOptional()
  @IsEnum(ELoanStatus)
  status?: ELoanStatus;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    enum: EApprovalStatus,
  })
  @IsOptional()
  @IsEnum(EApprovalStatus)
  approvalStatus?: EApprovalStatus;
}
