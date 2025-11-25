import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body, query, or params based on what's provided
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({ errors }, 'Validation error');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      logger.error({
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }, 'Unexpected validation error');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};

/**
 * Validate only the request body
 */
export const validateBody = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({ errors, body: req.body }, 'Body validation error');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      logger.error({
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }, 'Unexpected validation error');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};

/**
 * Validate only the request query parameters
 */
export const validateQuery = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      // Replace query properties instead of the entire object
      Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
      Object.assign(req.query, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({ errors, query: req.query }, 'Query validation error');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      logger.error({
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }, 'Unexpected validation error');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};

/**
 * Validate only the request params
 */
export const validateParams = (schema: z.ZodType<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({ errors, params: req.params }, 'Params validation error');

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
        });
      }

      logger.error({
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      }, 'Unexpected validation error');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};
