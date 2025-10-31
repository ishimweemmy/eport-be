import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DisburseLoanDto {
  @ApiPropertyOptional({
    description: 'Notes about the disbursement',
    example: 'Disbursed to customer savings account',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
