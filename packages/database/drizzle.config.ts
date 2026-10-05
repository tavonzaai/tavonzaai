import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from repository root .env or local
config({ path: resolve(__dirname, '../../.env') });
config();

// Allow cloud PostgreSQL providers (e.g. Neon, Supabase, RDS) with self-signed certificate chains
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

