import { IsArray, IsBoolean, IsString, IsUrl } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  userName: string;
  @IsUrl()
  activationUrl: string;
}

export class StudentAccountDeactivationDto {
  @IsString()
  studentName: string;
  @IsString()
  deactivationDate: string;
  @IsString()
  contactEmail: string;
  @IsString()
  contactPhone: string;
  @IsString()
  college: string;
}

export class NotifyOwnerAboutCollaboratorDeactivationDto {
  @IsString()
  collaboratorName: string;
  @IsString()
  studentName: string;

  @IsString()
  deactivationDate: string;
  @IsString()
  collegeAdminContact: string;
  @IsString()
  college: string;
}
export class NotifyStudentAboutSupervisorReactivationDto {
  @IsString()
  studentName: string;
  @IsString()
  supervisorName: string;
  @IsString()
  deactivationDate: string;
  @IsString()
  collegeAdminContact: string;
  @IsString()
  college: string;

  @IsString()
  reassignLink: string;

  @IsBoolean()
  isCollaboratorOwner: boolean;
}

export class NotifyHodAboutTeacherDeactivationDto {
  @IsString()
  teacherName: string;
  @IsString()
  deactivationDate: string;
  @IsString()
  numberOfProjectsSupervisedByTeacher: string;
  @IsArray()
  projectTitles: string[];
  @IsString()
  collegeAdminContact: string;
  @IsString()
  college: string;
  @IsString()
  hodName: string;

  @IsString()
  reassignLink: string;
}

export class NotifyStudentAboutSupervisorDeactivationDto extends NotifyStudentAboutSupervisorReactivationDto {}

export class StudentAccountReactivationDto extends StudentAccountDeactivationDto {}
export class NotifyOwnerAboutCollaboratorReactivationDto extends NotifyOwnerAboutCollaboratorDeactivationDto {}

export class TeacherAccountReactivationDto extends StudentAccountDeactivationDto {}
export class TeacherAccountDeactivationDto extends StudentAccountDeactivationDto {}
