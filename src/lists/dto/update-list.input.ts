import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateListInput } from './create-list.input';

@InputType()
export class UpdateListInput extends PartialType(CreateListInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;
}
