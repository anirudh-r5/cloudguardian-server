import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { userAssignments } from '../database/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class AssignmentsService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getAssignments() {
    return this.dz.select().from(userAssignments);
  }

  async getAssignmentsByUserId(id: string) {
    return this.dz
      .select()
      .from(userAssignments)
      .where(eq(userAssignments.userId, id));
  }

  async getAssignmentsByRoleId(id: string) {
    return this.dz
      .select()
      .from(userAssignments)
      .where(eq(userAssignments.roleId, id));
  }

  async getAssignmentsByRef(userid: string, roleid: string) {
    return this.dz
      .select()
      .from(userAssignments)
      .where(
        and(
          eq(userAssignments.roleId, roleid),
          eq(userAssignments.userId, userid),
        ),
      );
  }
}
