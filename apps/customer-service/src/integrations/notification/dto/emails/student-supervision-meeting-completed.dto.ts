import { IsString } from 'class-validator';

export class StudentSupervisionMeetingCompletedDto {
  @IsString()
  userName: string;
}
