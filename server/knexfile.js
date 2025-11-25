require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL || 'postgresql://inventory_user:inventory_password@localhost:5432/inventory_db',
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './src/seeds',
      extension: 'js'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './src/seeds',
      extension: 'js'
    }
  }
};