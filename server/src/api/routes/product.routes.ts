import { Router } from 'express';
import { ProductController } from '../controllers';
import { validateBody, validateQuery, validateParams } from '../../middleware';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductQuerySchema,
  BulkUpdateStockSchema,
} from '../../interfaces/product';
import { IdParamSchema } from '../../interfaces/common-schemas';
import { z } from 'zod';

const router = Router();
const productController = new ProductController();

// Schema for validating low stock threshold query
const LowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().min(0).default(10),
});

router.post('/', validateBody(CreateProductSchema), productController.createProduct);
router.get('/', validateQuery(ProductQuerySchema), productController.getProducts);
router.get('/low-stock', validateQuery(LowStockQuerySchema), productController.getLowStockProducts);
router.get('/:id', validateParams(IdParamSchema), productController.getProductById);
router.put('/:id', validateParams(IdParamSchema), validateBody(UpdateProductSchema), productController.updateProduct);
router.delete('/:id', validateParams(IdParamSchema), productController.deleteProduct);
router.patch('/bulk-update-stock', validateBody(BulkUpdateStockSchema), productController.bulkUpdateStock);

export default router;