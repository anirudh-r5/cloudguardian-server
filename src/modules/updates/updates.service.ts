import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AwsService } from '../aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { AzureService } from '../azure/azure.service';
import { identities, roles, userAssignments, users } from '../database/schema';
import { and, eq } from 'drizzle-orm';
import { CloudIdentityType, RoleType } from '../utils/module-types';

@Injectable()
export class UpdatesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UpdatesService.name);

  constructor(
    private configService: ConfigService,
    @Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase,
    private awsService: AwsService,
    private azService: AzureService,
  ) {}

  async onApplicationBootstrap() {
    const [storedIdentities, storedRoles, storedUsers, allUsers, allRoles] =
      await Promise.all([
        this.dz.select().from(identities),
        this.dz.select().from(roles),
        this.dz.select().from(users),
        this.getAllUsers(),
        this.getAllRoles(),
      ]);
    this.logger.debug(`Fetched CSP users, roles, and DB snapshot`);
    let insertedIdentities: (typeof identities.$inferSelect)[];
    const newIdentities: (typeof identities.$inferInsert)[] = [];
    newIdentities.push(...this.getNewIdentities(allUsers, storedIdentities));
    if (newIdentities && newIdentities.length) {
      this.logger.debug(
        `Inserting ${newIdentities.length} records to identities table`,
      );
      insertedIdentities = await this.dz
        .insert(identities)
        .values(newIdentities)
        .returning();
    } else {
      insertedIdentities = storedIdentities;
    }
    const newRoles: (typeof roles.$inferInsert)[] = [];
    newRoles.push(...this.getNewRoles(allRoles, storedRoles));
    if (newRoles && newRoles.length) {
      this.logger.debug(`Inserting ${newRoles.length} records to roles table`);
      await this.dz.insert(roles).values(newRoles);
    }
    const newUsers: (typeof users.$inferInsert)[] = [];

    newUsers.push(
      ...this.getNewUsers(allUsers, storedUsers, insertedIdentities),
    );
    if (newUsers && newUsers.length) {
      this.logger.debug(`Inserting ${newUsers.length} records to users table`);
      const insertedUsers: (typeof users.$inferSelect)[] = await this.dz
        .insert(users)
        .values(newUsers)
        .returning();
      const newAssignments = await this.getNewUserAssignments(
        allUsers,
        insertedUsers,
      );
      if (newAssignments && newAssignments.length > 0) {
        this.logger.debug(
          `Inserting ${newRoles.length} records to user assignments table`,
        );
        await this.dz.insert(userAssignments).values(newAssignments);
      }
    }
  }

  private getNewIdentities(
    current: CloudIdentityType[],
    stored: (typeof identities.$inferSelect)[],
  ): (typeof identities.$inferInsert)[] {
    const uniqueEmails = new Set<string>();
    return current
      .filter((newUser: CloudIdentityType) => {
        if (
          !stored.find((storedId) => storedId.email === newUser.email) &&
          !uniqueEmails.has(newUser.email)
        ) {
          uniqueEmails.add(newUser.email);
          return true;
        } else {
          return false;
        }
      })
      .map((user: CloudIdentityType) => {
        return <typeof identities.$inferInsert>{
          email: user.email,
          fullName: user.name,
          active: true,
        };
      });
  }

  private getNewUsers(
    current: CloudIdentityType[],
    stored: (typeof users.$inferSelect)[],
    refs: (typeof identities.$inferSelect)[],
  ): (typeof users.$inferInsert)[] {
    return current
      .filter(
        (user: CloudIdentityType) =>
          !stored.find((s) => s.providerId === user.id),
      )
      .map((user: CloudIdentityType) => {
        const idRef = refs.find((i) => i.email === user.email);
        return <typeof users.$inferInsert>{
          identityId: idRef?.id,
          providerId: user.id,
          provider: user.cloudProvider,
          username: user.name,
        };
      });
  }

  private getNewRoles(
    current: RoleType[],
    stored: (typeof roles.$inferSelect)[],
  ) {
    return current
      .filter((role: RoleType) => !stored.find((s) => s.id === role.id))
      .map((role: RoleType) => {
        return <typeof roles.$inferInsert>{
          id: role.id,
          name: role.name,
          permissions: role.permissions,
          provider: role.cloudProvider,
        };
      });
  }

  private async getNewUserAssignments(
    current: CloudIdentityType[],
    inserted: (typeof users.$inferSelect)[],
  ): Promise<(typeof userAssignments.$inferInsert)[]> {
    const assignments: (typeof userAssignments.$inferInsert)[] = [];
    for (const user of current) {
      const insertedRef = inserted.find((u) => u.providerId === user.id);
      if (!insertedRef) {
        this.logger.error(`User lookup error: ${user}`);
        throw Error('User not found');
      }
      for (const roleDef of user.roles) {
        const isAssigned = await this.dz
          .select()
          .from(userAssignments)
          .where(
            and(
              eq(userAssignments.userId, insertedRef.id),
              eq(userAssignments.roleId, roleDef),
            ),
          );
        if (!isAssigned || isAssigned.length === 0) {
          assignments.push({ roleId: roleDef, userId: insertedRef.id });
        } else {
          this.logger.debug('Assignment exists already');
        }
      }
    }
    return assignments;
  }

  private async getAllUsers() {
    const [awsUsers, azUsers] = await Promise.all([
      this.awsService.getUsersWithRoles(
        this.configService.get<string>('aws.accountId') as string,
      ),
      this.azService.getAzureUsers(),
    ]);
    return [...awsUsers, ...azUsers];
  }

  private async getAllRoles() {
    const [iamRoles, icRoles, azRoles] = await Promise.all([
      this.awsService.getIamRoles(),
      this.awsService.getPermissionSetsForRoles(),
      this.azService.getAzureRoles(),
    ]);
    return [...iamRoles, ...icRoles, ...azRoles];
  }
}
