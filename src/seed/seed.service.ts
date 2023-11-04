import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Item } from 'src/items/entities/item.entity';
import { ItemsService } from 'src/items/items.service';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(List)
        private readonly listsRepository: Repository<List>,
        @InjectRepository(ListItem)
        private readonly listItemsRepository: Repository<ListItem>,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listsService: ListsService,
        private readonly listItemService: ListItemService,
    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed() {
        if (this.isProd) {
            throw new UnauthorizedException('We cannot run SEED on Prod');
        }

        // Borrar la información de prueba
        await this.deleteDatabase();

        // Crear Users
        const user = await this.loadUsers();

        // Crear Items
        await this.loadItems(user);

        // Crear Lists
        const list = await this.loadLists(user);

        // Crear ListItems
        const items = await this.itemsService.findAll(user, { limit: 15, offset: 0 }, {});
        await this.loadListItems(list, items);

        return true;
    }

    async deleteDatabase() {
        // Borrar ListItems
        await this.listItemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Borrar Lists
        await this.listsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Borrar Items
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Borrar Users
        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers(): Promise<User> {
        const users = [];
        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user))
        }
        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const itemsPromises = [];
        for (const item of SEED_ITEMS) {
            itemsPromises.push(this.itemsService.create(item, user));
        }
        await Promise.all(itemsPromises);
    }

    async loadLists(user: User): Promise<List> {
        const lists = [];
        for (const list of SEED_LISTS) {
            lists.push(await this.listsService.create(list, user))
        }
        return lists[0];
    }

    async loadListItems(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            });
        }
    }
}
