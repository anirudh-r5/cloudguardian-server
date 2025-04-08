import {
  SSOAdminClient,
  ListInstancesCommand,
  ListAccountAssignmentsCommand,
  DescribePermissionSetCommand,
  ListPermissionSetsCommand,
  AccountAssignment,
} from '@aws-sdk/client-sso-admin';

import {
  IdentitystoreClient,
  ListUsersCommand,
} from '@aws-sdk/client-identitystore';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {
  private region = 'us-west-1';
  private ssoClient = new SSOAdminClient({ region: this.region });
  private idStoreClient = new IdentitystoreClient({ region: this.region });

  async getIdentityStoreId() {
    const { Instances } = await this.ssoClient.send(
      new ListInstancesCommand({}),
    );
    if (!Instances || Instances.length === 0)
      throw new Error('No SSO instances found');
    return {
      identityStoreId: Instances[0].IdentityStoreId!,
      instanceArn: Instances[0].InstanceArn!,
    };
  }

  async getPermissionSets(): Promise<string[] | undefined> {
    const { instanceArn } = await this.getIdentityStoreId();
    const permissionSetsCommand = new ListPermissionSetsCommand({
      InstanceArn: instanceArn,
    });
    const { PermissionSets } = await this.ssoClient.send(permissionSetsCommand);
    return PermissionSets;
  }

  async listUsers(identityStoreId: string) {
    const result = await this.idStoreClient.send(
      new ListUsersCommand({ IdentityStoreId: identityStoreId }),
    );
    return result.Users || [];
  }

  public async getUsersWithRoles(accountId: string) {
    const { instanceArn, identityStoreId } = await this.getIdentityStoreId();
    const permissionSets = await this.getPermissionSets();
    if (!permissionSets) {
      throw new Error('No permissions found');
    }
    const accounts: AccountAssignment[] = [];
    for (const set of permissionSets) {
      const { AccountAssignments } = await this.ssoClient.send(
        new ListAccountAssignmentsCommand({
          InstanceArn: instanceArn,
          AccountId: accountId,
          PermissionSetArn: set,
        }),
      );
      if (AccountAssignments) {
        accounts.push(...AccountAssignments);
      }
    }

    if (!accounts) return [];
    const userRoleMap: {
      userId: string | undefined;
      role: string;
    }[] = [];

    for (const assignment of accounts) {
      const permissionSetDetails = await this.ssoClient.send(
        new DescribePermissionSetCommand({
          InstanceArn: instanceArn,
          PermissionSetArn: assignment.PermissionSetArn!,
        }),
      );
      if (assignment.PrincipalType === 'USER') {
        userRoleMap.push({
          userId: assignment.PrincipalId,
          role: permissionSetDetails.PermissionSet?.Name ?? 'Unknown',
        });
      }
    }
    const users = await this.listUsers(identityStoreId);
    return users.map((user) => {
      const userId = user.UserId!;
      const userRoles = userRoleMap
        .filter((r) => r.userId === userId)
        .map((r) => r.role);

      return {
        id: userId,
        name: user.DisplayName ?? user.UserName ?? 'Unnamed',
        email: user.Emails?.[0]?.Value ?? '',
        cloudProvider: 'AWS',
        roles: userRoles,
      };
    });
  }
}
