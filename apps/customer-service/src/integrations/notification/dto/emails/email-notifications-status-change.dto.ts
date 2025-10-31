import { IsString } from 'class-validator';

export class EmailNotificationsStatusChangeDto {
  @IsString()
  userName: string;

  @IsString()
  action: string;
}
