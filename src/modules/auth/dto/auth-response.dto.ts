import { Field, ObjectType } from '@nestjs/graphql';
import { TokenResponse } from './token-response.dto';
import { type User } from '@prisma/client';

@ObjectType()
export class AuthResponse extends TokenResponse {
  @Field()
  user: User;
}
