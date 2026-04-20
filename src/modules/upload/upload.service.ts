import { Injectable } from '@nestjs/common';
import { ObjectStorage } from './object-storage';
import { SignedUrlInput } from './dto/upload-file-input';
import {
  SignedUrlResponse,
  UploadFileResponse,
} from './dto/upload-file-response';

@Injectable()
export class UploadService {
  constructor(private readonly objectStorage: ObjectStorage) {}

  async getSignedUrls(
    input: SignedUrlInput,
    userId?: string,
  ): Promise<SignedUrlResponse[]> {
    return this.objectStorage.getFileSignedUrl(input.files, userId);
  }

  async readFile(key: string): Promise<SignedUrlResponse> {
    return this.objectStorage.readFile(key);
  }

  async deleteFile(key: string): Promise<boolean> {
    await this.objectStorage.deleteFile(key);
    return true;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    userId?: string,
  ): Promise<UploadFileResponse[]> {
    return this.uploadFiles(files, userId);
  }
}
