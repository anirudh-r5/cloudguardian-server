import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { identitiesInCgdb } from '../database/schema';

@Injectable()
export class UserService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getIds() {
    const ids = await this.dz.select().from(identitiesInCgdb);
    console.log(ids);
    return ids;
  }
}
