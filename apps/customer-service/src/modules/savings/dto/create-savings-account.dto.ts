import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ESavingsAccountType } from '../enums/savings-account-type.enum';

export class CreateSavingsAccountDto {
  @ApiProperty({
    enum: ESavingsAccountType,
    default: ESavingsAccountType.REGULAR,
  })
  @IsEnum(ESavingsAccountType)
  @IsOptional()
  accountType?: ESavingsAccountType;
}
