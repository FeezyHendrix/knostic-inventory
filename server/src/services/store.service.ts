import { db } from '../config/database';
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto, PaginationResult, ServiceResult } from '../interfaces';
import logger from '../utils/logger';

export class StoreService {
  async createStore(storeData: CreateStoreDto): Promise<ServiceResult<any>> {
    try {
      logger.info({ storeData }, 'Creating new store in service');

      const [newStore] = await db('stores')
        .insert({
          name: storeData.name,
          address: storeData.address,
          city: storeData.city,
          state: storeData.state,
          zip_code: storeData.zipCode,
          phone_number: storeData.phoneNumber,
          email: storeData.email,
        })
        .returning('*');

      logger.info({ storeId: newStore.id, storeName: newStore.name }, 'Store created successfully in service');
      return {
        success: true,
        data: newStore,
        message: 'Store created successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, storeData }, 'Failed to create store in service');
      return {
        success: false,
        error: 'Failed to create store',
      };
    }
  }

  async getStores(query: StoreQueryDto): Promise<ServiceResult<PaginationResult<any>>> {
    try {
      const { page, limit, city, state, search } = query;
      const offset = (page - 1) * limit;

      // Build base query for filtering
      const buildQuery = (builder: any) => {
        if (city) {
          builder.whereILike('city', `%${city}%`);
        }
        if (state) {
          builder.whereILike('state', `%${state}%`);
        }
        if (search) {
          builder.where(function(this: any) {
            this.whereILike('name', `%${search}%`)
              .orWhereILike('address', `%${search}%`);
          });
        }
      };

      // Separate queries for data and count
      const storesQuery = db('stores').select('*');
      buildQuery(storesQuery);

      const countQuery = db('stores');
      buildQuery(countQuery);

      const [storesList, totalCountResult] = await Promise.all([
        storesQuery.limit(limit).offset(offset),
        countQuery.count('* as count').first()
      ]);

      const total = parseInt(totalCountResult?.count as string || '0', 10);
      const pages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: storesList,
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
      logger.error({ error: error.message, stack: error.stack, query }, 'Failed to fetch stores in service');
      return {
        success: false,
        error: 'Failed to fetch stores',
      };
    }
  }

  async getStoreById(id: number): Promise<ServiceResult<any>> {
    try {
      const store = await db('stores').where({ id }).first();

      if (!store) {
        return {
          success: false,
          error: 'Store not found',
        };
      }

      return {
        success: true,
        data: store,
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, storeId: id }, 'Failed to fetch store by ID in service');
      return {
        success: false,
        error: 'Failed to fetch store',
      };
    }
  }

  async updateStore(id: number, updateData: UpdateStoreDto): Promise<ServiceResult<any>> {
    try {
      const dataToUpdate: any = {
        updated_at: new Date(),
      };

      if (updateData.name) dataToUpdate.name = updateData.name;
      if (updateData.address) dataToUpdate.address = updateData.address;
      if (updateData.city) dataToUpdate.city = updateData.city;
      if (updateData.state) dataToUpdate.state = updateData.state;
      if (updateData.zipCode) dataToUpdate.zip_code = updateData.zipCode;
      if (updateData.phoneNumber !== undefined) dataToUpdate.phone_number = updateData.phoneNumber;
      if (updateData.email !== undefined) dataToUpdate.email = updateData.email;

      const [updatedStore] = await db('stores')
        .where({ id })
        .update(dataToUpdate)
        .returning('*');

      if (!updatedStore) {
        return {
          success: false,
          error: 'Store not found',
        };
      }

      return {
        success: true,
        data: updatedStore,
        message: 'Store updated successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, storeId: id, updateData }, 'Failed to update store in service');
      return {
        success: false,
        error: 'Failed to update store',
      };
    }
  }

  async deleteStore(id: number): Promise<ServiceResult<any>> {
    try {
      const [deletedStore] = await db('stores')
        .where({ id })
        .delete()
        .returning('*');

      if (!deletedStore) {
        return {
          success: false,
          error: 'Store not found',
        };
      }

      return {
        success: true,
        message: 'Store deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack, storeId: id }, 'Failed to delete store in service');
      return {
        success: false,
        error: 'Failed to delete store',
      };
    }
  }
}