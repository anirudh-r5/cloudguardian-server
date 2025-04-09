import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';
import { ConfigModule } from '@nestjs/config';
import { AzureResolver } from './azure.resolver';

@Module({
  imports: [ConfigModule],
  providers: [AzureService, AzureResolver],
})
export class AzureModule {}
