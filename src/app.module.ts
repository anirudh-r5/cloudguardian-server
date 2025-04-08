import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfig, ConfigSchema } from './config/configuration';
import { AwsModule } from './modules/aws/aws.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AzureModule } from './modules/azure/azure.module';

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
    AuthModule,
    AwsModule,
    AzureModule,
  ],
})
export class AppModule {}
