import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfig, ConfigSchema } from './config/configuration';
import { AwsModule } from './modules/aws/aws.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AzureModule } from './modules/azure/azure.module';
import { DatabaseModule } from './modules/database/database.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfig],
      validate: ConfigSchema.parse,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
    DatabaseModule,
    IdentitiesModule,
    AuthModule,
    AwsModule,
    AzureModule,
    UpdatesModule,
    UsersModule,
    RolesModule,
    AssignmentsModule,
  ],
})
export class AppModule {}
