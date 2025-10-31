import { IsString } from 'class-validator';

export class SupervisorConceptPaperSubmissionDto {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
}
