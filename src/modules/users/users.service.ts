import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getUsers() {
    return this.dz.select().from(users);
  }

  async getUserById(id: string) {
    return this.dz.select().from(users).where(eq(users.id, id));
  }

  async getUsersByProviderId(id: string) {
    return this.dz.select().from(users).where(eq(users.providerId, id));
  }

  async getUsersByName(name: string) {
    return this.dz.select().from(users).where(eq(users.username, name));
  }

  async getUsersByProvider(provider: 'aws' | 'azure') {
    return this.dz.select().from(users).where(eq(users.provider, provider));
  }
}
