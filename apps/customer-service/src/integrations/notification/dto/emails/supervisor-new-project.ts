import { IsString } from 'class-validator';

export class SupervisorNewProjectDto {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
}
