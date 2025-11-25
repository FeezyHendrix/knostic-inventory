import express from 'express';
import * as dotenv from 'dotenv';
import loaders from './loaders';
import logger from './utils/logger';
import { testConnection, closeConnection } from './config/database';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Test database connection before starting
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  await loaders({ expressApp: app });

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server is running');
    logger.info({ url: `http://localhost:${PORT}/api/v1` }, 'Inventory Management API ready');
    logger.info({ url: `http://localhost:${PORT}/status` }, 'Health check available');
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');

    server.close(async () => {
      logger.info('HTTP server closed');
      await closeConnection();
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(error => {
  logger.error({ error: error.message, stack: error.stack }, 'Error starting server');
  process.exit(1);
});