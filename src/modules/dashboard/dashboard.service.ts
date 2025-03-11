import { Injectable } from '@nestjs/common';
import { IAMClient, paginateListRoles } from '@aws-sdk/client-iam';
@Injectable()
export class DashboardService {
  private iamClient: IAMClient;
  constructor() {
    this.iamClient = new IAMClient({});
  }

  async listLocalPolicies() {
    const client = this.iamClient;
    const paginator = paginateListRoles(
      { client, pageSize: 10 },
      { MaxItems: 10 },
    );

    console.log('IAM roles defined in your account:');
    let policyCount = 0;
    for await (const page of paginator) {
      if (page.Roles) {
        for (const role of page.Roles) {
          console.log(`${role.RoleName}`);
          policyCount++;
        }
      }
    }
    console.log(`Found ${policyCount} roles.`);
  }
}
