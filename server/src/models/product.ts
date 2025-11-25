import { pgTable, serial, text, timestamp, varchar, decimal, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './store';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantityInStock: integer('quantity_in_stock').notNull().default(0),
  sku: varchar('sku', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  storeIdIdx: index('products_store_id_idx').on(table.storeId),
  categoryIdx: index('products_category_idx').on(table.category),
  priceIdx: index('products_price_idx').on(table.price),
  stockIdx: index('products_stock_idx').on(table.quantityInStock),
  skuIdx: index('products_sku_idx').on(table.sku),
}));

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;