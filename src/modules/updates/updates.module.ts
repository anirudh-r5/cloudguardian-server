import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { UpdatesService } from './updates.service';
import { AwsModule } from '../aws/aws.module';
import { AzureModule } from '../azure/azure.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AwsModule, AzureModule],
  providers: [UpdatesService],
})
export class UpdatesModule {}
