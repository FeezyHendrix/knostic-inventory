import { db } from '../config/database';
import { storesData } from './stores.seed';
import { productsData } from './products.seed';
import { generateSalesData, generatePopularItemSales } from './sales.seed';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    console.log('Upserting stores...');
    let insertedStores = [];
    
    for (const storeData of storesData) {
      const existingStore = await db('stores').where('name', storeData.name).first();
      
      if (!existingStore) {
        const [newStore] = await db('stores').insert(storeData).returning('*');
        insertedStores.push(newStore);
        console.log(`Inserted new store: ${storeData.name}`);
      } else {
        insertedStores.push(existingStore);
        console.log(`Store already exists: ${storeData.name}`);
      }
    }
    
    console.log(`Processed ${insertedStores.length} stores`);

    console.log('Upserting products...');
    let insertedProductsCount = 0;
    
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      const storeId = insertedStores[i % insertedStores.length].id;
      
      const existingProduct = await db('products').where('name', productData.name).first();
      
      if (!existingProduct) {
        await db('products').insert({
          ...productData,
          store_id: storeId,
        });
        insertedProductsCount++;
        console.log(`Inserted new product: ${productData.name}`);
      } else {
        console.log(`Product already exists: ${productData.name}`);
      }
    }

    // Seed sales data
    console.log('Generating sales data...');
    
    // Get all store and product IDs for sales generation
    const allStores = await db('stores').select('id');
    const allProducts = await db('products').select('id');
    
    const storeIds = allStores.map(store => store.id);
    const productIds = allProducts.map(product => product.id);
    
    // Clear existing sales data first
    await db('product_sales').del();
    console.log('Cleared existing sales data');
    
    // Generate regular sales data
    const regularSalesData = generateSalesData(storeIds, productIds);
    console.log(`Generated ${regularSalesData.length} regular sales records`);
    
    // Generate popular item sales
    const popularSalesData = generatePopularItemSales(storeIds, productIds);
    console.log(`Generated ${popularSalesData.length} popular item sales records`);
    
    // Combine and insert all sales data
    const allSalesData = [...regularSalesData, ...popularSalesData];
    
    if (allSalesData.length > 0) {
      await db('product_sales').insert(allSalesData);
      console.log(`Inserted ${allSalesData.length} sales records`);
    }

    console.log('Database seeding completed successfully!');
    console.log(`Summary:`);
    console.log(`   - Stores processed: ${insertedStores.length}`);
    console.log(`   - Products inserted: ${insertedProductsCount}`);
    console.log(`   - Sales records created: ${allSalesData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;