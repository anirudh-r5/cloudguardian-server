import { Resolver, Query } from '@nestjs/graphql';
import { AzureService } from './azure.service';

@Resolver('AzureUser')
export class AzureResolver {
  constructor(private readonly azureService: AzureService) {}

  @Query()
  async azureUsers() {
    return this.azureService.getUsers();
  }
}
