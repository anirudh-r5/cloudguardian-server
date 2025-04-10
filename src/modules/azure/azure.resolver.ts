import { Resolver, Query } from '@nestjs/graphql';
import { AzureService } from './azure.service';
import { AzureIdentity } from '../../graphql';

@Resolver('AzureIdentity')
export class AzureResolver {
  constructor(private readonly azureService: AzureService) {}

  @Query('azureUsers')
  async getAzureUsers() {
    const users = await this.azureService.getUsers();
    const roleMap =
      await this.azureService.getAllRoleAssignmentsByPrincipalId();
    const result: AzureIdentity[] = users.map((user) => ({
      id: user.id as string,
      name: user.displayName as string,
      email: user.mail as string,
      cloudProvider: 'Azure',
      roles: roleMap[user.id as string] || [],
    }));
    console.log(result);
    return result;
  }
}
