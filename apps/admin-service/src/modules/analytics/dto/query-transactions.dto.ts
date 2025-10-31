import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDate,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ETransactionType } from '@customer-service/modules/transaction/enums/transaction-type.enum';
import { ETransactionStatus } from '@customer-service/modules/transaction/enums/transaction-status.enum';

export class QueryTransactionsDto {
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
    description: 'Filter by transaction type',
    enum: ETransactionType,
  })
  @IsOptional()
  @IsEnum(ETransactionType)
  type?: ETransactionType;

  @ApiPropertyOptional({
    description: 'Filter by transaction status',
    enum: ETransactionStatus,
  })
  @IsOptional()
  @IsEnum(ETransactionStatus)
  status?: ETransactionStatus;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter transactions from this date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter transactions until this date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
