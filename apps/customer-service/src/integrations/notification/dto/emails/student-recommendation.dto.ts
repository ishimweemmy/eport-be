import { IsString } from 'class-validator';

export class StudentRecommendationDto {
  @IsString()
  userName: string;

  @IsString()
  recommenderName: string;
}
