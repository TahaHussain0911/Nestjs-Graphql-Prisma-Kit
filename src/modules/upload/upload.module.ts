import { Module } from '@nestjs/common';
import { ObjectStorage } from './object-storage';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';

@Module({
  providers: [UploadResolver, UploadService, ObjectStorage],
  exports: [UploadService, ObjectStorage],
})
export class UploadModule {}
