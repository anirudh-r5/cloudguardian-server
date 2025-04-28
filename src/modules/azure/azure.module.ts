import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AzureService],
  exports: [AzureService],
})
export class AzureModule {}
