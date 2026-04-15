import { Field, ObjectType } from '@nestjs/graphql';
import { TokenResponse } from './token-response';
import { User } from 'src/modules/user/entities/user.entity';

@ObjectType()
export class AuthResponse extends TokenResponse {
  @Field()
  user: User;
}
