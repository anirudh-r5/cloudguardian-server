import { z } from 'zod';

export const AppConfig = () => ({
  port: Number(process.env.PORT),
  auth: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
});

export const ConfigSchema = z
  .object({
    port: z.number().int().default(3001),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string(),
  })
  .required({ SUPABASE_URL: true, SUPABASE_KEY: true });
