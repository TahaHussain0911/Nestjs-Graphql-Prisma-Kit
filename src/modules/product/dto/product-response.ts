import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';
import { PaginationResponse } from 'src/common/dto/pagination-response';

@ObjectType()
export class ProductResponse {
  @Field()
  product: Product;
}

@ObjectType()
export class ProductPaginatedResponse extends PaginationResponse {
  @Field(() => [Product])
  data: Product[];
}
