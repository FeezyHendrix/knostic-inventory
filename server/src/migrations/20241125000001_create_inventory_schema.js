/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create stores table
  const hasStoresTable = await knex.schema.hasTable('stores');
  if (!hasStoresTable) {
    await knex.schema.createTable('stores', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('address').notNullable();
      table.string('city', 100).notNullable();
      table.string('state', 50).notNullable();
      table.string('zip_code', 10).notNullable();
      table.string('phone_number', 20).nullable();
      table.string('email', 255).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    });
  }

  // Create products table
  const hasProductsTable = await knex.schema.hasTable('products');
  if (!hasProductsTable) {
    await knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.integer('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE');
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('category', 100).notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('quantity_in_stock').defaultTo(0).notNullable();
      table.string('sku', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

      // Indexes
      table.index('store_id');
      table.index('category');
      table.index('price');
      table.index('quantity_in_stock');
      table.index('sku');
    });
  }

  // Create product_sales table
  const hasProductSalesTable = await knex.schema.hasTable('product_sales');
  if (!hasProductSalesTable) {
    await knex.schema.createTable('product_sales', (table) => {
      table.increments('id').primary();
      table.integer('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE');
      table.integer('quantity_sold').notNullable();
      table.decimal('unit_price', 10, 2).notNullable();
      table.decimal('total_amount', 12, 2).notNullable();
      table.timestamp('sale_date').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

      // Indexes
      table.index('product_id');
      table.index('store_id');
      table.index('sale_date');
      table.index(['sale_date', 'store_id']);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('product_sales');
  await knex.schema.dropTableIfExists('products');
  await knex.schema.dropTableIfExists('stores');
};