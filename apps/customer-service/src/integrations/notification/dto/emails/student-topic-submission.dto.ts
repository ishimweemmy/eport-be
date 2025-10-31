import { IsString } from 'class-validator';

export class StudentTopicSubmissionDto {
  @IsString()
  userName: string;

  @IsString()
  topic: string;
}
