import { Request, Response, NextFunction } from 'express';
import logger from './logger';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error({
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        timestamp: new Date().toISOString()
      }, 'Unhandled error in controller');
      
      next(err);
    });
  };
};

export default catchAsync;