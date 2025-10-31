import { IsString } from 'class-validator';

export class AcademicProjectSupervisionMeetingScheduledDto {
  @IsString()
  userName: string;

  @IsString()
  time: string;
}
