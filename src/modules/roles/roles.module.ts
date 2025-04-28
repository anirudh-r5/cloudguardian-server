import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RolesService } from './roles.service';
import { DatabaseModule } from '../database/database.module';
import { RolesResolver } from './roles.resolver';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [RolesService, RolesResolver],
})
export class RolesModule {}
