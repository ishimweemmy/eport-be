import { IsString } from 'class-validator';

export class StudentProposalPresentationFeedbackDto {
  @IsString()
  userName: string;
}
