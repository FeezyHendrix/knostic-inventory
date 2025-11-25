import { Request, Response } from 'express';
import { ProductService } from '../../services';
import { 
  CreateProductSchema, 
  UpdateProductSchema, 
  ProductQuerySchema,
  BulkUpdateStockSchema 
} from '../../interfaces';
import catchAsync from '../../utils/catchAsync';
import logger from '../../utils/logger';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = catchAsync(async (req: Request, res: Response) => {
    logger.info({ body: req.body }, 'Creating new product');
    
    const validatedData = CreateProductSchema.parse(req.body);
    const result = await this.productService.createProduct(validatedData);

    if (!result.success) {
      logger.warn({ error: result.error, productData: validatedData }, 'Failed to create product');
      const statusCode = result.error === 'Store not found' ? 404 : 400;
      return res.status(statusCode).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ productId: result.data.id }, 'Product created successfully');
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  getProducts = catchAsync(async (req: Request, res: Response) => {
    logger.info({ query: req.query }, 'Fetching products');
    
    const validatedQuery = ProductQuerySchema.parse(req.query);
    const result = await this.productService.getProducts(validatedQuery);

    if (!result.success) {
      logger.warn({ error: result.error, query: validatedQuery }, 'Failed to fetch products');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ count: result.data?.data?.length || 0, total: result.data?.pagination?.total || 0 }, 'Products fetched successfully');
    res.json(result);
  });

  getProductById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ productId: id }, 'Fetching product by ID');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid product ID provided');
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false 
      });
    }

    const result = await this.productService.getProductById(id);

    if (!result.success) {
      logger.warn({ productId: id, error: result.error }, 'Product not found');
      return res.status(404).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ productId: id }, 'Product fetched successfully');
    res.json({
      success: true,
      data: result.data
    });
  });

  getProductsByStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = parseInt(req.params.storeId);
    logger.info({ storeId, query: req.query }, 'Fetching products by store');
    
    if (isNaN(storeId)) {
      logger.warn({ providedStoreId: req.params.storeId }, 'Invalid store ID provided');
      return res.status(400).json({ 
        error: 'Invalid store ID',
        success: false 
      });
    }

    const validatedQuery = ProductQuerySchema.parse({ ...req.query, storeId });
    const result = await this.productService.getProducts(validatedQuery);

    if (!result.success) {
      logger.warn({ storeId, error: result.error }, 'Failed to fetch products by store');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ storeId, count: result.data?.data?.length || 0 }, 'Products by store fetched successfully');
    res.json({
      success: true,
      ...result.data
    });
  });

  updateProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ productId: id, updateData: req.body }, 'Updating product');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid product ID provided');
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false 
      });
    }

    const validatedData = UpdateProductSchema.parse(req.body);
    const result = await this.productService.updateProduct(id, validatedData);

    if (!result.success) {
      logger.warn({ productId: id, error: result.error }, 'Failed to update product');
      const statusCode = result.error === 'Product not found' ? 404 : 400;
      return res.status(statusCode).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ productId: id }, 'Product updated successfully');
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  bulkUpdateStock = catchAsync(async (req: Request, res: Response) => {
    logger.info({ productsCount: req.body?.products?.length }, 'Bulk updating product stock');
    
    const validatedData = BulkUpdateStockSchema.parse(req.body);
    const result = await this.productService.bulkUpdateStock(validatedData);

    if (!result.success) {
      logger.warn({ error: result.error }, 'Failed to bulk update stock');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ updatedCount: result.data.length }, 'Bulk stock update completed successfully');
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  });

  deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    logger.info({ productId: id }, 'Deleting product');
    
    if (isNaN(id)) {
      logger.warn({ providedId: req.params.id }, 'Invalid product ID provided');
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false 
      });
    }

    const result = await this.productService.deleteProduct(id);

    if (!result.success) {
      logger.warn({ productId: id, error: result.error }, 'Failed to delete product');
      return res.status(404).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ productId: id }, 'Product deleted successfully');
    res.json({
      success: true,
      message: result.message
    });
  });

  getLowStockProducts = catchAsync(async (req: Request, res: Response) => {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
    logger.info({ threshold }, 'Fetching low stock products');
    
    if (isNaN(threshold) || threshold < 0) {
      logger.warn({ providedThreshold: req.query.threshold }, 'Invalid threshold value provided');
      return res.status(400).json({ 
        error: 'Invalid threshold value',
        success: false 
      });
    }

    const result = await this.productService.getLowStockProducts(threshold);

    if (!result.success) {
      logger.warn({ threshold, error: result.error }, 'Failed to fetch low stock products');
      return res.status(400).json({ 
        error: result.error,
        success: false 
      });
    }

    logger.info({ threshold, count: result.data?.length || 0 }, 'Low stock products fetched successfully');
    res.json({
      success: true,
      data: result.data,
      meta: {
        threshold,
        count: result.data?.length || 0
      }
    });
  });
}