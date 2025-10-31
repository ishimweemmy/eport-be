import { IsString } from 'class-validator';

export class CoSuperVisorDto {
  @IsString()
  email: string;
  @IsString()
  link: string;
  @IsString()
  code: string;
  @IsString()
  studentName: string;
  @IsString()
  projectTitle: string;
  @IsString()
  projectDescription: string;
}
