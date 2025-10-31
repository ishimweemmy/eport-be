import { IsString } from 'class-validator';

export class NewLoginDto {
  address?: string;
  device?: string;
  @IsString()
  userName: string;
}
