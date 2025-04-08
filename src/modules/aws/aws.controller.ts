import { Controller, Post } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigService } from '@nestjs/config';

@Controller('aws')
export class AwsController {
  constructor(
    private awsService: AwsService,
    private configService: ConfigService,
  ) {}

  @Post()
  async getAwsUsers() {
    return await this.awsService.getUsersWithRoles(
      this.configService.get<string>('aws.accountId') as string,
    );
  }
}
