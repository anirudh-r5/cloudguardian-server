import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

const supabaseProvider = {
  inject: [ConfigService],
  provide: 'SUPABASE_CLIENT',
  useFactory: (configService: ConfigService): SupabaseClient => {
    const url = configService.get<string>('auth.url') as string;
    const key = configService.get<string>('auth.key') as string;
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  },
};

export default supabaseProvider;
