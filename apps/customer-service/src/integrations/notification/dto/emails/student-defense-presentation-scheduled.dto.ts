import { IsString } from 'class-validator';

export class StudentDefensePresentationScheduledDto {
  @IsString()
  userName: string;

  @IsString()
  time: string;
}
