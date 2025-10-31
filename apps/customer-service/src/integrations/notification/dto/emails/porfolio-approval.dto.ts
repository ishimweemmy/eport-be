import { IsString } from 'class-validator';

export class PortfolioApprovalDto {
  @IsString()
  userName: string;
}
