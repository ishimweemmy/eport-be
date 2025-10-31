import { IsString } from 'class-validator';

export class StudentConceptPaperSupervisorDto {
  @IsString()
  userName: string;

  @IsString()
  action: string;
}
