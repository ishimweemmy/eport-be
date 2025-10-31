import { IsString } from 'class-validator';

export class StudentDefensePresentationFeedbackDto {
  @IsString()
  userName: string;
}
