import { IsString } from 'class-validator';

export class SupervisorAssignemtDto {
  @IsString()
  userName: string;
  @IsString()
  projectName: string;
}
