import express from 'express';
import apiRoutes from '../api/routes';

export function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/status', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.use('/api/v1', apiRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  });

  return app;
}
