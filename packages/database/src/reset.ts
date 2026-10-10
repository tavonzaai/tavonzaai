// path to a file with schema you want to reset
import * as schema from './schema';
import { reset } from "drizzle-seed";
import { drizzle } from 'drizzle-orm/node-postgres';


async function main() {
    const db = drizzle(process.env.DATABASE_URL!);
    await reset(db, schema);
}

main();
