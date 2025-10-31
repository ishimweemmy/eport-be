import { IsString } from 'class-validator';

export class ProjectCollaborationRequestDto {
  @IsString()
  userName: string;

  @IsString()
  senderName: string;
}
