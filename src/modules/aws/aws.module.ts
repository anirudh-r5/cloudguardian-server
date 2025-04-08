import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import { ConfigModule } from '@nestjs/config';
import { AwsResolver } from './aws.resolver';

@Module({
  imports: [ConfigModule],
  providers: [AwsService, AwsResolver],
  controllers: [AwsController],
})
export class AwsModule {}
