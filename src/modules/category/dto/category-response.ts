import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

@ObjectType()
export class CategoryResponse {
  @Field()
  category: Category;
}
