import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UserResponse {
  @Field()
  user: User;
}

@ObjectType()
export class UserPaginatedResponse {
  @Field(() => [User])
  users: User[];

  @Field()
  page: number;

  @Field()
  limit: number;

  @Field()
  total: number;
}
