import express from 'express';
import * as dotenv from 'dotenv';
import loaders from './loaders';
import logger from './utils/logger';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  await loaders({ expressApp: app });

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server is running');
    logger.info({ url: `http://localhost:${PORT}/api/v1` }, 'Inventory Management API ready');
    logger.info({ url: `http://localhost:${PORT}/status` }, 'Health check available');
  });
}

startServer().catch(error => {
  logger.error({ error: error.message, stack: error.stack }, 'Error starting server');
  process.exit(1);
});