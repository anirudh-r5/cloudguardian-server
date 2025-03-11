import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
