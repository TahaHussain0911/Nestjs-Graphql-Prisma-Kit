import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  isEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
