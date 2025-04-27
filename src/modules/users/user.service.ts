import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { identities } from '../database/schema';

@Injectable()
export class UserService {
  constructor(@Inject('DRIZZLE_CLIENT') private dz: PostgresJsDatabase) {}

  async getIds() {
    const ids = await this.dz.select().from(identities);
    console.log(ids);
    return ids;
  }
}
