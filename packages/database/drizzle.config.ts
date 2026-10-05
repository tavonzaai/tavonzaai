import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from repository root .env or local
config({ path: resolve(__dirname, '../../.env') });
config();

const dbUrl = process.env.DATABASE_URL;

function getDbCredentials() {
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined');
  }
  try {
    const parsed = new URL(dbUrl);
    const sslParam = parsed.searchParams.get('ssl');
    const sslMode = parsed.searchParams.get('sslmode');
    const isRds = parsed.hostname.includes('rds.amazonaws.com');
    const isSsl =
      process.env.DATABASE_SSL === 'true' ||
      sslParam === 'true' ||
      (sslMode !== null && sslMode !== 'disable') ||
      isRds;

    if (isSsl) {
      return {
        host: parsed.hostname,
        port: Number(parsed.port || 5432),
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, ''),
        ssl: 'require' as const,
      };
    }
  } catch {
    // fallback to url if parsing fails
  }

  return {
    url: dbUrl,
  };
}

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: getDbCredentials(),
});
