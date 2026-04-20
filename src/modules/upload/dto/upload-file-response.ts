import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadFileResponse {
  @Field()
  key: string;

  @Field()
  fileName: string;
}

@ObjectType()
export class SignedUrlResponse {
  @Field()
  key: string;

  @Field()
  url: string;
}
