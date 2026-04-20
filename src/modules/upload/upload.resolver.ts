import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { SignedUrlInput } from './dto/upload-file-input';
import { SignedUrlResponse } from './dto/upload-file-response';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

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
