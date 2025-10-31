import { IsString } from 'class-validator';

export class ProjectPublicationDto {
  @IsString()
  userName: string;
  @IsString()
  projectName: string;
}
