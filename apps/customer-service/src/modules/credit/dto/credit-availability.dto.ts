import { ApiProperty } from '@nestjs/swagger';

export class CreditAvailabilityDto {
  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  creditLimit: number;

  @ApiProperty()
  availableCredit: number;

  @ApiProperty()
  outstandingBalance: number;

  @ApiProperty()
  utilizationPercentage: number;
}
