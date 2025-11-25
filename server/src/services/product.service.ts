import { db } from '../config/database';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  BulkUpdateStockDto,
  PaginationResult,
  ServiceResult,
  ProductWithStore
} from '../interfaces';
import logger from '../utils/logger';

export class ProductService {
  async createProduct(productData: CreateProductDto): Promise<ServiceResult<any>> {
    try {
      logger.info({ productData }, 'Creating new product in service');

      // Check if store exists
      const store = await db('stores').where({ id: productData.storeId }).first();
      if (!store) {
        logger.warn({ storeId: productData.storeId }, 'Store not found for product creation');
        return {
          success: false,
          error: 'Store not found',
        };
      }

      const [newProduct] = await db('products')
        .insert({
          store_id: productData.storeId,
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          quantity_in_stock: productData.quantityInStock,
          sku: productData.sku,
        })
        .returning('*');

      logger.info({ productId: newProduct.id, productName: newProduct.name }, 'Product created successfully in service');
      return {
        success: true,
        data: newProduct,
        message: 'Product created successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, productData }, 'Failed to create product in service');
      return {
        success: false,
        error: 'Failed to create product',
      };
    }
  }

  async getProducts(query: ProductQueryDto): Promise<ServiceResult<PaginationResult<ProductWithStore>>> {
    try {
      const {
        page,
        limit,
        storeId,
        category,
        minPrice,
        maxPrice,
        minStock,
        maxStock,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = query;

      const offset = (page - 1) * limit;

      let queryBuilder = db('products')
        .select(
          'products.id',
          'products.name',
          'products.description',
          'products.category',
          'products.price',
          'products.quantity_in_stock as quantityInStock',
          'products.sku',
          'products.created_at as createdAt',
          'products.updated_at as updatedAt',
          db.raw('json_build_object(\'id\', stores.id, \'name\', stores.name, \'city\', stores.city, \'state\', stores.state) as store')
        )
        .innerJoin('stores', 'products.store_id', 'stores.id');

      if (storeId) {
        queryBuilder = queryBuilder.where('products.store_id', storeId);
      }

      if (category) {
        queryBuilder = queryBuilder.whereILike('products.category', `%${category}%`);
      }

      if (minPrice !== undefined) {
        queryBuilder = queryBuilder.where('products.price', '>=', minPrice);
      }

      if (maxPrice !== undefined) {
        queryBuilder = queryBuilder.where('products.price', '<=', maxPrice);
      }

      if (minStock !== undefined) {
        queryBuilder = queryBuilder.where('products.quantity_in_stock', '>=', minStock);
      }

      if (maxStock !== undefined) {
        queryBuilder = queryBuilder.where('products.quantity_in_stock', '<=', maxStock);
      }

      if (search) {
        queryBuilder = queryBuilder.where(function() {
          this.whereILike('products.name', `%${search}%`)
            .orWhereILike('products.description', `%${search}%`)
            .orWhereILike('products.sku', `%${search}%`);
        });
      }

      // Map sortBy to database column names
      const sortColumnMap: Record<string, string> = {
        name: 'products.name',
        price: 'products.price',
        quantityInStock: 'products.quantity_in_stock',
        createdAt: 'products.created_at',
      };

      const sortColumn = sortColumnMap[sortBy] || 'products.created_at';
      queryBuilder = queryBuilder.orderBy(sortColumn, sortOrder);

      const [productsList, totalCountResult] = await Promise.all([
        queryBuilder.clone().limit(limit).offset(offset),
        db('products')
          .innerJoin('stores', 'products.store_id', 'stores.id')
          .count('* as count')
          .where((builder) => {
            if (storeId) builder.where('products.store_id', storeId);
            if (category) builder.whereILike('products.category', `%${category}%`);
            if (minPrice !== undefined) builder.where('products.price', '>=', minPrice);
            if (maxPrice !== undefined) builder.where('products.price', '<=', maxPrice);
            if (minStock !== undefined) builder.where('products.quantity_in_stock', '>=', minStock);
            if (maxStock !== undefined) builder.where('products.quantity_in_stock', '<=', maxStock);
            if (search) {
              builder.where(function() {
                this.whereILike('products.name', `%${search}%`)
                  .orWhereILike('products.description', `%${search}%`)
                  .orWhereILike('products.sku', `%${search}%`);
              });
            }
          })
          .first()
      ]);

      const total = parseInt(totalCountResult?.count as string || '0', 10);
      const pages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: productsList as ProductWithStore[],
          pagination: {
            page,
            limit,
            total,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, query }, 'Failed to fetch products in service');
      return {
        success: false,
        error: 'Failed to fetch products',
      };
    }
  }

  async getProductById(id: number): Promise<ServiceResult<ProductWithStore>> {
    try {
      const product = await db('products')
        .select(
          'products.id',
          'products.name',
          'products.description',
          'products.category',
          'products.price',
          'products.quantity_in_stock as quantityInStock',
          'products.sku',
          'products.created_at as createdAt',
          'products.updated_at as updatedAt',
          db.raw('json_build_object(\'id\', stores.id, \'name\', stores.name, \'city\', stores.city, \'state\', stores.state) as store')
        )
        .innerJoin('stores', 'products.store_id', 'stores.id')
        .where('products.id', id)
        .first();

      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: product as ProductWithStore,
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, productId: id }, 'Failed to fetch product by ID in service');
      return {
        success: false,
        error: 'Failed to fetch product',
      };
    }
  }

  async getProductsByStore(storeId: number, query: Omit<ProductQueryDto, 'storeId'>): Promise<ServiceResult<PaginationResult<ProductWithStore>>> {
    return this.getProducts({ ...query, storeId });
  }

  async updateProduct(id: number, updateData: UpdateProductDto): Promise<ServiceResult<any>> {
    try {
      const dataToUpdate: any = {
        updated_at: new Date(),
      };

      if (updateData.name) dataToUpdate.name = updateData.name;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
      if (updateData.category) dataToUpdate.category = updateData.category;
      if (updateData.price !== undefined) dataToUpdate.price = updateData.price;
      if (updateData.quantityInStock !== undefined) dataToUpdate.quantity_in_stock = updateData.quantityInStock;
      if (updateData.sku) dataToUpdate.sku = updateData.sku;

      const [updatedProduct] = await db('products')
        .where({ id })
        .update(dataToUpdate)
        .returning('*');

      if (!updatedProduct) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, productId: id, updateData }, 'Failed to update product in service');
      return {
        success: false,
        error: 'Failed to update product',
      };
    }
  }

  async bulkUpdateStock(bulkData: BulkUpdateStockDto): Promise<ServiceResult<any>> {
    try {
      const updatePromises = bulkData.products.map(({ id, quantityInStock }) =>
        db('products')
          .where({ id })
          .update({
            quantity_in_stock: quantityInStock,
            updated_at: new Date()
          })
          .returning('*')
      );

      const results = await Promise.all(updatePromises);
      const updatedProducts = results.filter(result => result.length > 0).map(result => result[0]);

      return {
        success: true,
        data: updatedProducts,
        message: `${updatedProducts.length} products updated successfully`,
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, bulkData }, 'Failed to bulk update stock in service');
      return {
        success: false,
        error: 'Failed to bulk update stock',
      };
    }
  }

  async deleteProduct(id: number): Promise<ServiceResult<any>> {
    try {
      const [deletedProduct] = await db('products')
        .where({ id })
        .delete()
        .returning('*');

      if (!deletedProduct) {
        return {
          success: false,
          error: 'Product not found',
        };
      }

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, productId: id }, 'Failed to delete product in service');
      return {
        success: false,
        error: 'Failed to delete product',
      };
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<ServiceResult<ProductWithStore[]>> {
    try {
      const lowStockProducts = await db('products')
        .select(
          'products.id',
          'products.name',
          'products.description',
          'products.category',
          'products.price',
          'products.quantity_in_stock as quantityInStock',
          'products.sku',
          'products.created_at as createdAt',
          'products.updated_at as updatedAt',
          db.raw('json_build_object(\'id\', stores.id, \'name\', stores.name, \'city\', stores.city, \'state\', stores.state) as store')
        )
        .innerJoin('stores', 'products.store_id', 'stores.id')
        .where('products.quantity_in_stock', '<=', threshold)
        .orderBy('products.quantity_in_stock', 'asc');

      return {
        success: true,
        data: lowStockProducts as ProductWithStore[],
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, threshold }, 'Failed to fetch low stock products in service');
      return {
        success: false,
        error: 'Failed to fetch low stock products',
      };
    }
  }
}
