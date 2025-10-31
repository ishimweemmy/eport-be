import { IsString, IsUrl } from 'class-validator';

export class PanelAssignmentDto {
  @IsString()
  userName: string;
  @IsString()
  projectName: string;
  @IsString()
  time: string;
}
