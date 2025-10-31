import { ApiProperty } from '@nestjs/swagger';

export class BalanceInquiryDto {
  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  availableBalance: number;

  @ApiProperty()
  currency: string;
}
