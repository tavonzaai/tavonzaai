/**
 * Refuses to seed (which wipes data) against anything that is not clearly a local database,
 * unless SEED_ALLOW_REMOTE=true is set explicitly.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'postgres', 'db', 'host.docker.internal']);

export const resolveSeedDatabaseUrl = (): string => {
  const url = process.env.SEED_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('No database configured. Set SEED_DATABASE_URL (preferred) or DATABASE_URL.');
  }

  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    throw new Error('SEED_DATABASE_URL / DATABASE_URL is not a valid connection URL.');
  }

  const isLocal = LOCAL_HOSTS.has(host);
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
    throw new Error(
      `Refusing to seed remote database host "${host}". Seeding TRUNCATES every table.\n` +
        '  • Point SEED_DATABASE_URL at a local database, or\n' +
        '  • set SEED_ALLOW_REMOTE=true if you really intend to wipe this database.',
    );
  }

  console.log(`🛡️  Seed target: ${host}${isLocal ? ' (local)' : ' (REMOTE — explicitly allowed)'}`);
  return url;
};
