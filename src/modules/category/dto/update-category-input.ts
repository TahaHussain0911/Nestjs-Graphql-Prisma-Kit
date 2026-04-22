import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCategoryInput } from './create-category-input';
import { Transform } from 'class-transformer';
import { DTOBoolean } from 'src/utils/helper';

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsOptional()
  @Transform(DTOBoolean)
  @IsBoolean()
  isActive?: boolean;
}
