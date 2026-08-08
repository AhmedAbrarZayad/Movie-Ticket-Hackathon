import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;
const migrationsDirectory = path.resolve('docker/init');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const files = (await readdir(migrationsDirectory)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDirectory, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied ${file}`);
  }
} finally {
  await pool.end();
}
