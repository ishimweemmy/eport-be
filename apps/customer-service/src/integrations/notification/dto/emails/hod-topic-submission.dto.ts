import { IsString } from 'class-validator';

export class HodTopicSubmissionDto {
  @IsString()
  userName: string;
}
