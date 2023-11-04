import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListItemInput, UpdateListItemInput } from './dto';
import { ListItem } from './entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
  ) { }

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;

    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId }
    });

    await this.listItemsRepository.save(newListItem);

    return await this.findOne(newListItem.id);
  }

  findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository.createQueryBuilder('listItem') // <-- Nombre para las relaciones
      .innerJoin('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });

    if (!listItem) throw new NotFoundException(`List item with id ${id} not found`);
    return listItem;
  }

  async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {
    const { listId, itemId, ...restDataListItem } = updateListItemInput;

    const queryBuilder = this.listItemsRepository.createQueryBuilder()
      .update()
      .set(restDataListItem)
      .where('id = :id', { id });

    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();

    return await this.findOne(id);
  }

  remove(id: string) {
    return `This action removes a #${id} listItem`;
  }

  async countListItemsByList(list: List): Promise<number> {
    return this.listItemsRepository.count({
      where: { list: { id: list.id } }
    });
  }
}
