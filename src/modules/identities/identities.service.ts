import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { identities } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class IdentitiesService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getIdentities() {
    return this.dz.select().from(identities);
  }

  async getIdentityById(id: string) {
    return this.dz.select().from(identities).where(eq(identities.id, id));
  }

  async getIdentityByEmail(email: string) {
    return this.dz.select().from(identities).where(eq(identities.email, email));
  }
}
