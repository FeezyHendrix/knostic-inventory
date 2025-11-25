import expressLoader from './express';
import { Application } from 'express';
import logger from '../utils/logger';

export default async ({ expressApp }: { expressApp: Application }) => {
  expressLoader({ app: expressApp });
  logger.info('Express loaded');
};