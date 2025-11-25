import { Router } from 'express';
import { ProductController } from '../controllers';
import storeRoutes from './store.routes';
import productRoutes from './product.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();
const productController = new ProductController();

router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/stores/:storeId/products', productController.getProductsByStore);

export default router;