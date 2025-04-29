import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdentitiesService } from './identities.service';
import { DatabaseModule } from '../database/database.module';
import { IdentitiesResolver } from './identities.resolver';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [IdentitiesService, IdentitiesResolver],
})
export class IdentitiesModule {}
