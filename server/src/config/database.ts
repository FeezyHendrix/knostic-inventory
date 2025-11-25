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
    max: 10
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