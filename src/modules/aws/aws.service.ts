import {
  AccountAssignment,
  DescribePermissionSetCommand,
  ListAccountAssignmentsCommand,
  ListInstancesCommand,
  ListPermissionSetsCommand,
  SSOAdminClient,
  ListManagedPoliciesInPermissionSetCommand,
} from '@aws-sdk/client-sso-admin';

import {
  IdentitystoreClient,
  ListUsersCommand,
} from '@aws-sdk/client-identitystore';

import {
  IAMClient,
  ListRolesCommand,
  ListAttachedRolePoliciesCommand,
  GetPolicyVersionCommand,
  ListPolicyVersionsCommand,
} from '@aws-sdk/client-iam';

import { Injectable } from '@nestjs/common';
import { CloudIdentityType, RoleType } from '../utils/module-types';

@Injectable()
export class AwsService {
  private region = 'us-west-1';
  private ssoClient = new SSOAdminClient({ region: this.region });
  private idStoreClient = new IdentitystoreClient({ region: this.region });
  private iamClient = new IAMClient({ region: this.region });

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

  async getPermissionSetsForRoles() {
    const { instanceArn } = await this.getIdentityStoreId();
    const permissionSets = await this.getPermissionSets();
    if (!permissionSets) {
      throw new Error('No permissions found');
    }
    const icRoles: RoleType[] = [];
    for (const set of permissionSets) {
      const { PermissionSet } = await this.ssoClient.send(
        new DescribePermissionSetCommand({
          InstanceArn: instanceArn,
          PermissionSetArn: set,
        }),
      );
      const { AttachedManagedPolicies } = await this.ssoClient.send(
        new ListManagedPoliciesInPermissionSetCommand({
          InstanceArn: instanceArn,
          PermissionSetArn: set,
        }),
      );
      const policies: string[] = [];
      if (AttachedManagedPolicies) {
        for (const attachedPolicy of AttachedManagedPolicies) {
          if (attachedPolicy.Name) {
            policies.push(attachedPolicy.Name);
          }
        }
      }

      const setName = PermissionSet?.Name ?? 'N/A';
      icRoles.push({
        id: set,
        name: setName,
        permissions: policies,
        cloudProvider: 'aws',
      });
    }
    return icRoles;
  }

  async listUsers(identityStoreId: string) {
    const result = await this.idStoreClient.send(
      new ListUsersCommand({ IdentityStoreId: identityStoreId }),
    );
    return result.Users || [];
  }

  async getUsersWithRoles(accountId: string) {
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
          role:
            permissionSetDetails.PermissionSet?.PermissionSetArn ?? 'Unknown',
        });
      }
    }
    const users = await this.listUsers(identityStoreId);
    return users.map((user) => {
      const userId = user.UserId!;
      const userRoles = userRoleMap
        .filter((r) => r.userId === userId)
        .map((r) => r.role);

      return <CloudIdentityType>{
        id: userId,
        name: user.DisplayName ?? user.UserName ?? 'Unnamed',
        email: user.Emails?.[0]?.Value ?? '',
        cloudProvider: 'aws',
        roles: userRoles,
      };
    });
  }

  async getIamRoles() {
    const command = new ListRolesCommand();
    const roles = await this.iamClient.send(command);
    if (!roles.Roles) {
      throw new Error('No permissions found');
    }
    const awsRoles: RoleType[] = [];
    for (const role of roles.Roles) {
      const { AttachedPolicies } = await this.iamClient.send(
        new ListAttachedRolePoliciesCommand({ RoleName: role.RoleName }),
      );
      if (AttachedPolicies) {
        const attachedPolicies: any[] = [];
        for (const policy of AttachedPolicies) {
          const { Versions } = await this.iamClient.send(
            new ListPolicyVersionsCommand({ PolicyArn: policy.PolicyArn }),
          );
          const defaultVersion = Versions?.find((v) => v.IsDefaultVersion);
          const { PolicyVersion } = await this.iamClient.send(
            new GetPolicyVersionCommand({
              PolicyArn: policy.PolicyArn,
              VersionId: defaultVersion?.VersionId ?? 'v1',
            }),
          );
          const policyDocument = PolicyVersion?.Document ?? '';
          attachedPolicies.push(JSON.parse(decodeURIComponent(policyDocument)));
        }
        const roleName = role.RoleName ?? 'N/A';
        const roleArn = role.Arn ?? 'N/A';
        awsRoles.push({
          id: roleArn,
          name: roleName,
          cloudProvider: 'aws',
          permissions: attachedPolicies,
        });
      }
    }

    return awsRoles;
  }
}
