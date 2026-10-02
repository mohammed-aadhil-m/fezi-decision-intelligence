import 'dotenv/config';
import { PostgresDatabase } from './postgres';

async function run() {
  console.log('🔄 Running database migrations...');
  const db = PostgresDatabase.getInstance();
  const res = await db.runMigrations();
  if (res.success) {
    console.log(`✅ Migrations completed successfully. Applied: ${res.applied.join(', ') || 'none'}`);
    process.exit(0);
  } else {
    console.error('💥 Migration failed.');
    process.exit(1);
  }
}

run();
