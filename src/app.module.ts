import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfig, ConfigSchema } from './config/configuration';
import { AwsModule } from './modules/aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfig],
      validate: ConfigSchema.parse,
    }),
    AuthModule,
    AwsModule,
  ],
})
export class AppModule {}
