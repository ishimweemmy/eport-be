import { IsString } from 'class-validator';

export class SupervisorPostDefenseRevisionSubmited {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
}
