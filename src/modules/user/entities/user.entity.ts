import { Field, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  role: Role;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
