import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import supabaseProvider from './supabase';

@Module({
  imports: [ConfigModule],
  providers: [supabaseProvider],
})
export class AuthModule {}
