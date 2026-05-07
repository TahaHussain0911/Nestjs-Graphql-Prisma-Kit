import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  @MaxLength(255)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
