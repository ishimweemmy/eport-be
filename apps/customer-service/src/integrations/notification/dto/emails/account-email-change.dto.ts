import { IsString } from 'class-validator';

export class AccountEmailChangeDto {
  @IsString()
  email: string;
  @IsString()
  userName: string;
}
