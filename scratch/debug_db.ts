
    import { drizzle } from 'drizzle-orm/node-postgres';
    import { Pool } from 'pg';
    import * as schema from '@tavonza/database';
    import * as argon2 from 'argon2';

    const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/platform_dev' });
    const db = drizzle(pool, { schema });

    async function run() {
      try {
        const email = 'debug.err.' + Date.now() + '@tavonza.ai';
        const passwordHash = await argon2.hash('Password@123');
        const [newUser] = await db.insert(schema.users).values({
          name: 'Debug User',
          email,
          password: passwordHash,
          role: 'STAFF',
          status: 'ACTIVE',
        }).returning();
        console.log('Created user:', newUser?.id);

        const [newStaff] = await db.insert(schema.staff).values({
          userId: newUser.id,
        }).returning();
        console.log('Created staff:', newStaff?.id);

        const [assignment] = await db.insert(schema.staffAssignments).values({
          branchId: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
          staffId: newStaff.id,
          role: 'WAITER',
          permissions: ['VIEW_ORDERS'],
          isActive: true,
        }).returning();
        console.log('Created assignment:', assignment?.id);
      } catch (e) {
        console.error('Direct DB Error:', e);
      } finally {
        await pool.end();
      }
    }
    run();
  