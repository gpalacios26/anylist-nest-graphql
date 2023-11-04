import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItemService } from './list-item.service';
import { ListItemResolver } from './list-item.resolver';
import { ListItem } from './entities/list-item.entity';

@Module({
  providers: [ListItemResolver, ListItemService],
  imports: [
    TypeOrmModule.forFeature([ListItem]),
  ],
  exports: [TypeOrmModule, ListItemService]
})
export class ListItemModule { }
