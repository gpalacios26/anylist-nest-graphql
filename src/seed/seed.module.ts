import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { ItemsModule } from 'src/items/items.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [SeedResolver, SeedService],
  imports: [
    ConfigModule,
    ItemsModule,
    UsersModule,
  ]
})
export class SeedModule { }
