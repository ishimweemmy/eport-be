import { IsString } from 'class-validator';

export class StudentEditorDocumentCommentDto {
  @IsString()
  userName: string;

  @IsString()
  projectName: string;
}
