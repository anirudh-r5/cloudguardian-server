import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseProvider from './database';

@Module({
  imports: [ConfigModule],
  providers: [databaseProvider],
  exports: ['DRIZZLE_CLIENT'],
})
export class DatabaseModule {}
