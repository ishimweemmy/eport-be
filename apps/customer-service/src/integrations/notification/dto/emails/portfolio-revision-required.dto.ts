import { IsString } from 'class-validator';

export class PortfoliRevisionRequiredDto {
  @IsString()
  userName: string;
}
