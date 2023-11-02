import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {

  @Field(() => String)
  @IsNotEmpty()
  fullName: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @MinLength(6)
  password: string;
}
