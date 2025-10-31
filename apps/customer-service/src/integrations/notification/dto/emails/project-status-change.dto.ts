import { IsString } from 'class-validator';

export class ProjectStatusChangeDto {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
  @IsString()
  status: string;
}
