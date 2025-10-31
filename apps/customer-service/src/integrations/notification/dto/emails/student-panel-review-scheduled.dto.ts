import { IsString } from 'class-validator';

export class StudentPanelReviewScheduledDto {
  @IsString()
  userName: string;

  @IsString()
  time: string;
}
