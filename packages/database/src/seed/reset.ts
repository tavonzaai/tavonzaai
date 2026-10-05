import { getTableName, is, sql, Table } from 'drizzle-orm';
import { schema, type Tx } from './types';

/**
 * Truncates every table defined in the Drizzle schema in one statement.
 * CASCADE removes FK-ordering problems (e.g. audit_logs -> users is ON DELETE RESTRICT),
 * and new tables are picked up automatically.
 */
export const resetDatabase = async (tx: Tx) => {
  const tableNames = new Set<string>();

  for (const val of Object.values(schema)) {
    if (val && typeof val === 'object' && is(val as any, Table)) {
      try {
        const name = getTableName(val as any);
        if (name) tableNames.add(`"${name}"`);
      } catch {
        // Not a table
      }
    }
  }

  if (tableNames.size === 0) return;
  const list = Array.from(tableNames).join(', ');
  await tx.execute(sql.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`));
  console.log(`🧹 Truncated ${tableNames.size} tables`);
};
