import { z } from 'zod';

export const AppConfig = () => ({
  port: Number(process.env.PORT),
  auth: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  },
  aws: {
    accountId: process.env.AWS_ACCOUNT_ID,
  },
  azure: {
    clientId: process.env.AZURE_CLIENT_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    secret: process.env.AZURE_CLIENT_SECRET,
    subscription: process.env.AZURE_SUBSCRIPTION_ID,
  },
});

export const ConfigSchema = z
  .object({
    port: z.number().int().default(3001),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string(),
    AWS_ACCOUNT_ID: z.string(),
    AZURE_CLIENT_ID: z.string().uuid(),
    AZURE_TENANT_ID: z.string().uuid(),
    AZURE_CLIENT_SECRET: z.string(),
    AZURE_SUBSCRIPTION_ID: z.string().uuid(),
  })
  .required({ SUPABASE_URL: true, SUPABASE_ANON_KEY: true });
