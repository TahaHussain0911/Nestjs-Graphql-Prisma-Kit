import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product-input';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { DTOBoolean } from 'src/utils/helper';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsOptional()
  @Transform(DTOBoolean)
  @IsBoolean()
  isActive?: boolean;
}
