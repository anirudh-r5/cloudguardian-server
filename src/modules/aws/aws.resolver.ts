import { Query, Resolver } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { AwsService } from './aws.service';

@Resolver('Identity')
export class AwsResolver {
  constructor(
    private configService: ConfigService,
    private awsService: AwsService,
  ) {}

  @Query('identities')
  async getAwsUsers() {
    return await this.awsService.getUsersWithRoles(
      this.configService.get<string>('aws.accountId') as string,
    );
  }
}
