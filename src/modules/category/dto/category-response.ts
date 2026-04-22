import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { PaginationResponse } from 'src/common/dto/pagination-response';

@ObjectType()
export class CategoryResponse {
  @Field()
  category: Category;
}

@ObjectType()
export class CategoryPaginatedResponse extends PaginationResponse {
  @Field(() => [Category])
  data: Category[];
}
