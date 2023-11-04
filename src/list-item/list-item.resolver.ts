import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateListItemInput, UpdateListItemInput } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) { }

  @Mutation(() => ListItem, { name: 'createListItem' })
  createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    @CurrentUser() user: User
  ): Promise<ListItem> {
    return this.listItemService.create(createListItemInput);
  }

  @Query(() => ListItem, { name: 'listItem' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<ListItem> {
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem, { name: 'updateListItem' })
  updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput,
    @CurrentUser() user: User
  ): Promise<ListItem> {
    return this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }
}
