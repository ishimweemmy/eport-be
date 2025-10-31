import { IsString } from 'class-validator';

export class StudentProjectPublicationOrRejectionto {
  @IsString()
  userName: string;

  @IsString()
  action: string;
}
