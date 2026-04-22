import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationResponse {
  @Field()
  page: number;

  @Field()
  totalPages: number;

  @Field()
  total: number;
}
