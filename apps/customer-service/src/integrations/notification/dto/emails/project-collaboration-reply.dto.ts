import { IsString } from 'class-validator';

export class ProjectCollaborationReplyDto {
  @IsString()
  userName: string;

  @IsString()
  senderName: string;

  @IsString()
  action: string;

  @IsString()
  type: string;
}
