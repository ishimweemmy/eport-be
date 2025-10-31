import { IsString } from 'class-validator';

export class StudentSupervisorAssignmentDto {
  @IsString()
  userName: string;

  @IsString()
  supervisorName: string;

  @IsString()
  supervisorRole: string;
}
