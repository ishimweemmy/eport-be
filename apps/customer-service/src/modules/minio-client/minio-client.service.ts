import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { FileInfo } from './types/all.types';
// import { AttachmentDto } from '../portfolio/dto/attachment.dto';
import {
  generateUUID,
  objectExistsInJson,
} from '@app/common/helpers/shared.helpers';

// Temporary DTO for MinIO
class AttachmentDto {
  id?: string;
  url: string;
  name: string;
  size?: number;
  type?: string;
}

@Injectable()
export class MinioClientService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: CoreServiceConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.minioEndPoint,
      port: Number(this.configService.minioPort),
      useSSL: this.configService.minioUsessl === 'true',
      accessKey: this.configService.minioAccessKey,
      secretKey: this.configService.minioSecretKey,
    });
    this.bucketName = this.configService.minioBucket;
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'stretch');
    }
  }

  async getUploadedFilePath(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );
    return this.getFilePath(fileName);
  }
  /**
   * Uploads a file to the MinIO bucket.
   *
   * @param {Express.Multer.File} file - The file to upload.
   * @returns {Promise<string>} The URL of the uploaded file.
   * @throws {Error} If the upload fails.
   *
   * @example
   * const fileUrl = await minioClientService.uploadFile(file);
   */
  async uploadFile(file: Express.Multer.File): Promise<FileInfo> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await Promise.all([
      this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
      ),
    ]);

    const fileType = this.getFileType(file);
    const orginalName = this.getFileName(file);
    const fileSize = this.getFileSize(file);
    return {
      url: `/${fileName}`,
      type: fileType,
      size: fileSize,
      name: orginalName,
    };
  }
  getFileType(file: Express.Multer.File): string {
    return file.mimetype;
  }
  getFileSize(file: Express.Multer.File): number {
    return file.size;
  }
  getFileName(file: Express.Multer.File): string {
    return file.originalname;
  }

  // Getting the file Url
  async getFilePath(fileName: string): Promise<string> {
    return `/${fileName}`;
    // const url = await this.minioClient.presignedUrl(
    //   'GET',
    //   this.bucketName,
    //   fileName,
    // );
    // const parsedUrl = new URL(url);
    // const query = parsedUrl.search;
    // return parsedUrl.pathname + query;
  }
  /**
   * Downloads a file from the MinIO bucket.
   *
   * @param {string} fileName - The name of the file to download.
   * @returns {Promise<Buffer>} The file content as a Buffer.
   * @throws {Error} If the file can't be downloaded.
   *
   * @example
   * const fileContent = await minioClientService.downloadFile('example.txt');
   */
  async downloadFile(fileName: string): Promise<Buffer> {
    const stream = await this.minioClient.getObject(this.bucketName, fileName);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }
  /**
   * Copies a file within the MinIO bucket.
   *
   * @param {string} sourceFileName - The name of the source file to copy.
   * @param {string} destinationFileName - The name of the new file to create as a copy.
   * @returns {Promise<void>} Resolves when the file has been successfully copied.
   * @throws {Error} If the file can't be copied.
   *
   * @example
   * await minioClientService.copyFile('source.txt', 'destination.txt');
   */
  async copyFile(
    sourceFileName: string,
    destinationFileName: string,
  ): Promise<void> {
    await this.minioClient.copyObject(
      this.bucketName,
      destinationFileName,
      `${this.bucketName}/${sourceFileName}`,
    );
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  async getFileMetadata(fileName: string): Promise<Minio.ItemBucketMetadata> {
    return await this.minioClient.statObject(this.bucketName, fileName);
  }
  /**
   * Uploads multiple files to the MinIO bucket.
   *
   * @param {Express.Multer.File[]} files - An array of files to upload.
   * @returns {Promise<string[]>} A list of URLs for the uploaded files.
   * @throws {Error} If any file upload fails.
   *
   * @example
   * const files = [file1, file2];
   * const urls = await minioClientService.uploadMultipleFiles(files);
   */
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileInfo[]> {
    const filesInfos: FileInfo[] = [];
    for (const file of files) {
      const fileInfo = await this.uploadFile(file);
      filesInfos.push(fileInfo);
    }
    return filesInfos;
  }
  // Deleting the file from minio
  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async uploadAttachments(
    files: Express.Multer.File[],
    currentAttachments: AttachmentDto[],
  ): Promise<AttachmentDto[]> {
    const supportingDocuments = files || [];
    const filesInfo: FileInfo[] =
      await this.uploadMultipleFiles(supportingDocuments);

    const newAttachments: AttachmentDto[] = [];
    filesInfo.forEach((info: FileInfo) => {
      const attachement: AttachmentDto = {
        id: generateUUID(),
        url: info.url,
        name: info.name,
        size: info.size,
        type: info.type,
      };
      const attachmentExists = objectExistsInJson<AttachmentDto>(
        currentAttachments,
        attachement,
      );
      if (!attachmentExists) {
        newAttachments.push(attachement);
      }
    });
    return newAttachments;
  }

  cleanFilePath(url) {
    try {
      const parsedUrl = new URL(url, 'http://dummy');
      const parts = parsedUrl.pathname.split('/');
      return '/' + parts.slice(-1)[0];
    } catch (e) {
      return null;
    }
  }

  cleanFilePathShowcase(url) {
    // Remove query parameters
    const basePath = url.split('?')[0];
    // Extract filename only
    const filename = basePath.split('/').pop();
    return '/' + filename;
  }
}
