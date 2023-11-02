import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsResolver } from './items.resolver';
import { Item } from './entities/item.entity';

@Module({
  providers: [ItemsResolver, ItemsService],
  imports: [
    TypeOrmModule.forFeature([Item])
  ],
  exports: [TypeOrmModule, ItemsService]
})
export class ItemsModule { }
