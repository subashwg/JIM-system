import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.resolve('./.postgres-data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const pg = new EmbeddedPostgres({
  port: 54329,
  databaseDir: dbDir,
  user: 'postgres',
  password: 'password',
  persistent: true,
});

async function main() {
  console.log('[PostgreSQL] Initialising / starting embedded postgres on port 54329...');
  try {
    await pg.initialise();
  } catch (err) {
    // Already initialised
  }

  await pg.start();
  console.log('[PostgreSQL] Embedded Postgres is running on port 54329.');
  console.log('[PostgreSQL] DATABASE_URL=postgresql://postgres:password@localhost:54329/postgres?schema=public');

  const shutdown = async () => {
    console.log('\n[PostgreSQL] Stopping embedded postgres...');
    try {
      await pg.stop();
      console.log('[PostgreSQL] Stopped gracefully.');
    } catch (e) {
      console.error('[PostgreSQL] Error during stop:', e);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[PostgreSQL] Failed to start:', err);
  process.exit(1);
});
