import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { DTOTrim } from 'src/utils/helper';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @Transform(DTOTrim)
  @IsNotEmpty()
  name: string;

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
