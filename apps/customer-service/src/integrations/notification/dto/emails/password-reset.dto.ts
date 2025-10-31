import { IsString } from 'class-validator';

export class PasswordResetDto {
  date?: string;
  @IsString()
  userName: string;
}
