import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { PaginationResponse } from 'src/common/dto/pagination-response';

@ObjectType()
export class UserResponse {
  @Field()
  user: User;
}

@ObjectType()
export class UserPaginatedResponse extends PaginationResponse {
  @Field(() => [User])
  data: User[];
}
