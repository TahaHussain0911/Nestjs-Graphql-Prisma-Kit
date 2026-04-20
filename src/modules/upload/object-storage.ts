import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { TypedConfigService } from 'src/config/typed-config.service';
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_MBS,
  MIME_TYPES,
  READ_SIGNED_URL_EXPIRES_IN,
  UPLOAD_SIGNED_URL_EXPIRES_IN,
} from './lib/file.constants';
import { SignedUrlInput } from './dto/upload-file-input';
import {
  SignedUrlResponse,
  UploadFileResponse,
} from './dto/upload-file-response';
import { getFileSizeInMbs } from 'src/utils/helper';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ObjectStorage {
  private _client: S3Client;
  private _bucketName: string;
  private _uploadExpiresIn: number;
  private _readExpiresIn: number;
  private _allowedMimeTypes: string[] = [];
  private _allowedFileSize: number;

  constructor(private readonly config: TypedConfigService) {
    this._client = new S3Client({
      region: config.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_S3_SECRET_KEY'),
      },
    });
    this._bucketName = config.get('AWS_S3_BUCKET_NAME');
    this._uploadExpiresIn = UPLOAD_SIGNED_URL_EXPIRES_IN;
    this._readExpiresIn = READ_SIGNED_URL_EXPIRES_IN;
    this._allowedFileSize = MAX_FILE_SIZE;
    this._allowedMimeTypes = Object.values(MIME_TYPES).flatMap((type) => {
      return Object.values(type);
    });
  }

  private validateFileSize(fileSize: number) {
    return fileSize > this._allowedFileSize;
  }

  private validateFileType(fileType: string) {
    return this._allowedMimeTypes.includes(fileType);
  }

  private _generateFileName(fileName: string) {
    const clean = fileName.replace(/\s+/g, '-').toLowerCase();
    const extIndex = clean.lastIndexOf('.');
    const base = extIndex !== -1 ? clean.slice(0, extIndex) : clean;
    const ext = extIndex !== -1 ? clean.slice(extIndex) : '';
    const date = new Date().toISOString();
    return `${base}-${date}${ext}`;
  }

  async getFileSignedUrl(
    files: SignedUrlInput['files'],
    userId?: string,
  ): Promise<SignedUrlResponse[]> {
    const results: SignedUrlResponse[] = [];
    for (const file of files) {
      if (this.validateFileType(file.fileType)) {
        throw new BadRequestException(
          `Invalid file type for file: ${file.fileName}`,
        );
      }
      if (this.validateFileSize(file.fileSize)) {
        throw new BadRequestException(`
            Invalid file size. Requested ${getFileSizeInMbs(file.fileSize)}mbs, Allowed ${MAX_FILE_SIZE_IN_MBS}mbs`);
      }
      const key = this._generateFileName(file.fileName);
      const command = new PutObjectCommand({
        Key: key,
        Bucket: this._bucketName,
        ContentLength: file.fileSize,
        ContentType: file.fileType,
        Metadata: {
          ...(userId && { userId }),
          originalfileName: file.fileName,
        },
      });
      const url = await getSignedUrl(this._client, command, {
        expiresIn: this._uploadExpiresIn,
      });
      results.push({
        key,
        url,
      });
    }
    return results;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    userId?: string,
  ): Promise<UploadFileResponse[]> {
    const results: UploadFileResponse[] = [];
    for (const file of files) {
      if (!this.validateFileType(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type for file: ${file.filename}`,
        );
      }
      if (this.validateFileSize(file.size)) {
        throw new BadRequestException(`
            Invalid file size. Requested ${getFileSizeInMbs(file.size)}mbs, Allowed ${MAX_FILE_SIZE_IN_MBS}mbs`);
      }

      const key = this._generateFileName(file.filename);
      const command = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          ...(userId && { userId }),
          originalfileName: file.filename,
        },
      });

      await this._client.send(command);
      results.push({
        fileName: file.filename,
        key,
      });
    }
    return results;
  }

  async readFile(key: string): Promise<SignedUrlResponse> {
    try {
      const command = new GetObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this._client, command, {
        expiresIn: this._readExpiresIn,
      });
      return {
        url,
        key,
      };
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      });
      await this._client.send(command);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
