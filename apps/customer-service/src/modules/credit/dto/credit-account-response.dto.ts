import { ApiProperty } from '@nestjs/swagger';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';

export class CreditAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  creditLimit: number;

  @ApiProperty()
  availableCredit: number;

  @ApiProperty()
  totalBorrowed: number;

  @ApiProperty()
  totalRepaid: number;

  @ApiProperty()
  outstandingBalance: number;

  @ApiProperty({ enum: EAccountStatus })
  status: EAccountStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
