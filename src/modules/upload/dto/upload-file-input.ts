import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class FileMetadataInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @Field()
  @Type(() => Number)
  @IsNumber()
  fileSize: number;
}

@InputType()
export class SignedUrlInput {
  @Field(() => [FileMetadataInput])
  files: FileMetadataInput[];
}
