import { Request, Response } from 'express';
import { StoreService } from '../../services';
import { CreateStoreSchema, UpdateStoreSchema, StoreQuerySchema } from '../../interfaces';
import catchAsync from '../../utils/catch-async';
import logger from '../../utils/logger';

export class StoreController {
  private storeService: StoreService;

  constructor() {
    this.storeService = new StoreService();
  }

  createStore = catchAsync(async (req: Request, res: Response) => {
    logger.info({ body: req.body }, 'Creating new store');
    
    const validatedData = CreateStoreSchema.parse(req.body);
    const result = await this.storeService.createStore(validatedData);

    if (!result.success) {
      logger.warn({ error: result.error, storeData: validatedData }, 'Failed to create store');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ storeId: result.data.id }, 'Store created successfully');
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  getStores = catchAsync(async (req: Request, res: Response) => {
    logger.info({ query: req.query }, 'Fetching stores');
    
    const validatedQuery = StoreQuerySchema.parse(req.query);
    const result = await this.storeService.getStores(validatedQuery);

    if (!result.success) {
      logger.warn({ error: result.error, query: validatedQuery }, 'Failed to fetch stores');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ count: result.data?.data?.length || 0, total: result.data?.pagination?.total || 0 }, 'Stores fetched successfully');
    res.json(result);
  });

  getStoreById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ storeId: id }, 'Fetching store by ID');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid store ID provided');
      return res.status(400).json({ 
        error: 'Invalid store ID',
        success: false 
      });
    }

    const result = await this.storeService.getStoreById(id);

    if (!result.success) {
      logger.warn({ storeId: id, error: result.error }, 'Store not found');
      return res.status(404).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ storeId: id }, 'Store fetched successfully');
    res.json({
      success: true,
      data: result.data
    });
  });

  updateStore = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ storeId: id, updateData: req.body }, 'Updating store');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid store ID provided');
      return res.status(400).json({ 
        error: 'Invalid store ID',
        success: false 
      });
    }

    const validatedData = UpdateStoreSchema.parse(req.body);
    const result = await this.storeService.updateStore(id, validatedData);

    if (!result.success) {
      logger.warn({ storeId: id, error: result.error }, 'Failed to update store');
      const statusCode = result.error === 'Store not found' ? 404 : 400;
      return res.status(statusCode).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ storeId: id }, 'Store updated successfully');
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  deleteStore = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ storeId: id }, 'Deleting store');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid store ID provided');
      return res.status(400).json({ 
        error: 'Invalid store ID',
        success: false 
      });
    }

    const result = await this.storeService.deleteStore(id);

    if (!result.success) {
      logger.warn({ storeId: id, error: result.error }, 'Failed to delete store');
      return res.status(404).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ storeId: id }, 'Store deleted successfully');
    res.json({
      success: true,
      message: result.message
    });
  });
}