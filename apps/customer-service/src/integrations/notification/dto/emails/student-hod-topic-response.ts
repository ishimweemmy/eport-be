import { IsString } from 'class-validator';

export class StudentHodTopicResponseDto {
  @IsString()
  userName: string;
  @IsString()
  topic: string;
  @IsString()
  response: string;
}
