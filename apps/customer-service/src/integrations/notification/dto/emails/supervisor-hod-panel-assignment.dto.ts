import { IsString } from 'class-validator';

export class SupervisorHodPanelAssignment {
  @IsString()
  userName: string;
  @IsString()
  studentName: string;
  @IsString()
  position: string;
  @IsString()
  time: string;
}
