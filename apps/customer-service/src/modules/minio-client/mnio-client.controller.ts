import { MinioClientService } from './minio-client.service';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TestUploadFileDto } from './dto/test-upload-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@app/common/decorators/public.decorator';

@ApiTags('Minio Client')
@Controller('minio-client')
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Public()
  @ApiBody({
    type: TestUploadFileDto,
  })
  async testUpload(
    @UploadedFile('file') file: Express.Multer.File,
    @Body() body: TestUploadFileDto,
  ) {
    return this.minioClientService.uploadFile(file);
  }
}
