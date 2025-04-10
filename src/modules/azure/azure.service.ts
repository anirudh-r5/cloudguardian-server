import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthorizationManagementClient } from '@azure/arm-authorization';
import { AzureRole } from '../../graphql';
import { User } from '@microsoft/microsoft-graph-types';

@Injectable()
export class AzureService {
  private graphClient: Client;
  private authClient: AuthorizationManagementClient;
  constructor(private configService: ConfigService) {
    const credentials = new ClientSecretCredential(
      this.configService.get<string>('azure.tenantId') as string,
      this.configService.get<string>('azure.clientId') as string,
      this.configService.get<string>('azure.secret') as string,
    );
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credentials.getToken(
            'https://graph.microsoft.com/.default',
          );
          return token?.token || '';
        },
      },
    });
    this.authClient = new AuthorizationManagementClient(
      credentials,
      this.configService.get<string>('azure.subscription') as string,
    );
  }

  async getUsers() {
    const result = await this.graphClient
      .api('/users')
      .header('ConsistencyLevel', 'eventual')
      .query('$count=true')
      .select(['id', 'displayName', 'mail'])
      .filter('mail ne null')
      .get();
    console.log(result.value);
    return result.value as User[];
  }

  async getAllRoleAssignmentsByPrincipalId(): Promise<
    Record<string, AzureRole[]>
  > {
    const roleMap: Record<string, AzureRole[]> = {};

    for await (const assignment of this.authClient.roleAssignments.listForSubscription()) {
      const principalId = assignment.principalId!;
      const roleDef = await this.authClient.roleDefinitions.getById(
        assignment.roleDefinitionId!,
      );

      if (!roleMap[principalId]) roleMap[principalId] = [];
      roleMap[principalId].push({
        roleName: roleDef.roleName as string,
        scope: assignment.scope as string,
      });
    }
    return roleMap;
  }
}
