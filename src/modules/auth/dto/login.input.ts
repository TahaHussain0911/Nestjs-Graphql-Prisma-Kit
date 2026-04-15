import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class LoginInput {
  @IsEmail()
  @Field()
  email: string;

  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  @MinLength(8)
  @Field()
  password: string;
}
