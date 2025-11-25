import knex from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL || 'postgresql://inventory_user:inventory_password@localhost:5432/inventory_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../migrations',
    extension: 'ts'
  },
  seeds: {
    directory: '../seeds',
    extension: 'ts'
  }
};

export const db = knex(config);

export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection established successfully');
    return true;
  } catch (error: any) {
    console.error('Failed to connect to database:', error.message);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await db.destroy();
  console.log('Database connection closed');
}