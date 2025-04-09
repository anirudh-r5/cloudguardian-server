import { Resolver, Query } from '@nestjs/graphql';
import { AzureService } from './azure.service';

@Resolver('AzureUser')
export class AzureResolver {
  constructor(private readonly azureService: AzureService) {}

  @Query()
  async azureUsers() {
    const [users, roleMap] = await Promise.all([
      await this.azureService.getUsers(),
      await this.azureService.getAllRoleAssignmentsByPrincipalId(),
    ]);

    const result = users.map((user: { id: string | number }) => ({
      ...user,
      roles: roleMap[user.id] || [],
    }));
    console.log(result);
    return result;
  }
}
