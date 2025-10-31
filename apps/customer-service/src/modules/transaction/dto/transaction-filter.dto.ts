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
import { ETransactionType } from '../enums/transaction-type.enum';
import { ETransactionStatus } from '../enums/transaction-status.enum';

export class TransactionFilterDto {
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

  @ApiProperty({
    required: false,
    example: 'TXN-1223-89',
    description:
      'The savings account id that you want to get transactions from',
  })
  @IsString()
  @IsOptional()
  savingsAccountId?: string;
}
