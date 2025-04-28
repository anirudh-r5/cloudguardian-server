import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [UsersService, UsersResolver],
})
export class UsersModule {}
