import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { roles } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RolesService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getRoles() {
    return this.dz.select().from(roles);
  }

  async getRoleById(id: string) {
    return this.dz.select().from(roles).where(eq(roles.id, id));
  }

  async getRoleByName(name: string) {
    return this.dz.select().from(roles).where(eq(roles.name, name));
  }
}
