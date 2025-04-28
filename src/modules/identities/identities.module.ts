import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentitiesService } from './identities.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [IdentitiesService],
})
export class IdentitiesModule {}
