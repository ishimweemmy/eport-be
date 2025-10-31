import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class TestUploadFileDto {
  @ApiProperty({
    required: false,
    description: 'Cover Image',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file: Express.Multer.File;
}
