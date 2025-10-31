import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuspendCustomerDto {
  @ApiProperty({
    description: 'Reason for suspending the customer',
    example: 'Suspicious activity detected',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UnsuspendCustomerDto {
  @ApiPropertyOptional({
    description: 'Notes about unsuspending the customer',
    example: 'Issue resolved, customer verified',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCreditLimitDto {
  @ApiProperty({
    description: 'New credit limit',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  newLimit: number;

  @ApiProperty({
    description: 'Reason for credit limit update',
    example: 'Customer requested increase, good payment history',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCreditScoreDto {
  @ApiProperty({
    description: 'New credit score',
    example: 700,
    minimum: 300,
    maximum: 850,
  })
  @IsNumber()
  @Min(300)
  @Max(850)
  newScore: number;

  @ApiProperty({
    description: 'Reason for credit score update',
    example: 'Manual adjustment based on external credit report',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
