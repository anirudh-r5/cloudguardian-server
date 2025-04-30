import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthorizationManagementClient } from '@azure/arm-authorization';
import { User } from '@microsoft/microsoft-graph-types';
import { CloudIdentityType, RoleType } from '../utils/module-types';

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
    return result.value as User[];
  }

  async getAllRoleAssignmentsByPrincipalId(): Promise<Map<string, string[]>> {
    const roleMap: Map<string, string[]> = new Map();

    for await (const assignment of this.authClient.roleAssignments.listForSubscription()) {
      const principalId = assignment.principalId!;
      const roles = roleMap.get(principalId) ?? [];
      roleMap.set(principalId, [...roles, assignment.roleDefinitionId!]);
    }
    return roleMap;
  }

  async getAzureUsers() {
    const users = await this.getUsers();
    const roleMap = await this.getAllRoleAssignmentsByPrincipalId();
    const result: CloudIdentityType[] = users.map((user) => ({
      id: user.id as string,
      name: user.displayName as string,
      email: user.mail as string,
      cloudProvider: 'azure',
      roles: roleMap[user.id as string] || [],
    }));
    return result;
  }

  async getAzureRoles() {
    const roles: RoleType[] = [];
    const roleAssignments = new Set(
      [...(await this.getAllRoleAssignmentsByPrincipalId()).values()].flat(),
    );
    for (const role of roleAssignments) {
      const roleDef = await this.authClient.roleDefinitions.getById(role);
      const roleId = roleDef?.id ?? 'N/A';
      const roleName = roleDef?.roleName ?? 'N/A';
      const rolePerms =
        roleDef.permissions?.map((p) => ({
          actions: p.actions ?? [],
          notActions: p.notActions ?? [],
          dataActions: p.dataActions ?? [],
          notDataActions: p.notDataActions ?? [],
        })) ?? [];
      roles.push({
        id: roleId,
        name: roleName,
        cloudProvider: 'azure',
        permissions: rolePerms,
      });
    }
    return roles;
  }
}
