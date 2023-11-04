import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';
import { ListItemModule } from 'src/list-item/list-item.module';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [
    TypeOrmModule.forFeature([List]),
    ListItemModule
  ],
  exports: [TypeOrmModule, ListsService]
})
export class ListsModule { }
