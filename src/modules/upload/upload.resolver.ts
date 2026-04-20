import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { SignedUrlInput } from './dto/upload-file-input';
import {
  SignedUrlResponse,
  UploadFileResponse,
} from './dto/upload-file-response';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { graphqlFileToMulterFile } from 'src/utils/graphql-file.util';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => [UploadFileResponse])
  // @UseGuards(GqlAuthGuard)
  async uploadFiles(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    // @CurrentUser() user?: { id: string },
  ): Promise<UploadFileResponse[]> {
    // Resolve all file promises
    const resolvedFiles = await Promise.all(files);

    // Convert to multer files
    const multerFiles = await Promise.all(
      resolvedFiles.map((file) => graphqlFileToMulterFile(file)),
    );

    return this.uploadService.uploadFiles(multerFiles /*, user?.id */);
  }

  @Mutation(() => [SignedUrlResponse])
  async getSignedUploadUrls(
    @Args('input') input: SignedUrlInput,
  ): Promise<SignedUrlResponse[]> {
    return this.uploadService.getSignedUrls(input);
  }

  @Query(() => SignedUrlResponse)
  async getFileUrl(
    @Args('key', { type: () => String }) key: string,
  ): Promise<SignedUrlResponse> {
    return this.uploadService.readFile(key);
  }

  @Mutation(() => Boolean)
  async deleteFile(
    @Args('key', { type: () => String }) key: string,
  ): Promise<boolean> {
    return this.uploadService.deleteFile(key);
  }
}
