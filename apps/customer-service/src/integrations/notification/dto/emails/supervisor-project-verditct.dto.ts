import { IsString } from 'class-validator';

export class SupervisorProjectVerdictDto {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
}
