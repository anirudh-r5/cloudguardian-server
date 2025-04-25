import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const databaseProvider = {
  inject: [ConfigService],
  provide: 'DRIZZLE_CLIENT',
  useFactory: (configService: ConfigService): PostgresJsDatabase => {
    const url = configService.get<string>('db') as string;
    const client = postgres(url, { prepare: false });
    return drizzle({ client });
  },
};

export default databaseProvider;
