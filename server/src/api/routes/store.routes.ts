import { Router } from 'express';
import { StoreController } from '../controllers';
import { validateBody, validateQuery, validateParams } from '../../middleware';
import { CreateStoreSchema, UpdateStoreSchema, StoreQuerySchema } from '../../interfaces/store';
import { IdParamSchema } from '../../interfaces/common-schemas';

const router = Router();
const storeController = new StoreController();

router.post('/', validateBody(CreateStoreSchema), storeController.createStore);
router.get('/', validateQuery(StoreQuerySchema), storeController.getStores);
router.get('/:id', validateParams(IdParamSchema), storeController.getStoreById);
router.put('/:id', validateParams(IdParamSchema), validateBody(UpdateStoreSchema), storeController.updateStore);
router.delete('/:id', validateParams(IdParamSchema), storeController.deleteStore);

export default router;