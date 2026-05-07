import { Field, InputType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Field()
  @IsOptional()
  @IsString()
  @Transform(DTOTrim)
  @MaxLength(255)
  description?: string;

  @Field()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S*$/, { message: 'SKU cannot contain spaces' })
  @MaxLength(50)
  sku: string;

  @Field()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;

  @Field()
  @IsUUID()
  categoryId: string;
}
