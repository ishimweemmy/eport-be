import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveLoanDto {
  @ApiPropertyOptional({
    description: 'Notes or reason for approving the loan',
    example: 'Customer has good credit history and meets all requirements',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectLoanDto {
  @ApiProperty({
    description: 'Reason for rejecting the loan',
    example: 'Insufficient credit score',
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
