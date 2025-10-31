import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ETransactionType } from '@customer-service/modules/transaction/enums/transaction-type.enum';
import { ETransactionStatus } from '@customer-service/modules/transaction/enums/transaction-status.enum';

export class QueryTransactionsDto {
  @ApiProperty({ enum: ETransactionType, required: false })
  @IsEnum(ETransactionType)
  @IsOptional()
  type?: ETransactionType;

  @ApiProperty({ enum: ETransactionStatus, required: false })
  @IsEnum(ETransactionStatus)
  @IsOptional()
  status?: ETransactionStatus;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    required: false,
    description: 'Search by customer name, email, or transaction reference',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  savingsAccountId?: string;

  @ApiProperty({ required: false, example: 1, description: 'Page number' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Limit number of results per page',
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
