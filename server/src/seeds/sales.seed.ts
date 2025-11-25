export const generateSalesData = (
  storeIds: number[],
  productIds: number[]
): any[] => {
  const salesData: any[] = [];
  const now = new Date();
  
  // Generate realistic sales data over the last 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000));
    
    // Each day, generate 3-8 sales randomly distributed across stores
    const dailySales = Math.floor(Math.random() * 6) + 3;
    
    for (let sale = 0; sale < dailySales; sale++) {
      const storeId = storeIds[Math.floor(Math.random() * storeIds.length)];
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      
      // Generate realistic quantities (1-5 items per sale)
      const quantity = Math.floor(Math.random() * 5) + 1;
      
      // Generate realistic prices based on product categories
      const basePrice = getBasePriceForProduct(productId, productIds);
      const unitPrice = basePrice + (Math.random() * 20 - 10); // ±$10 variation
      const totalAmount = parseFloat((unitPrice * quantity).toFixed(2));
      
      // Add some time variation within the day (business hours 9-20)
      const hour = Math.floor(Math.random() * 11) + 9;
      const minute = Math.floor(Math.random() * 60);
      const saleDateTime = new Date(date);
      saleDateTime.setHours(hour, minute, 0, 0);
      
      salesData.push({
        product_id: productId,
        store_id: storeId,
        quantity_sold: quantity,
        unit_price: unitPrice.toString(),
        total_amount: totalAmount.toString(),
        sale_date: saleDateTime,
      });
    }
  }
  
  return salesData;
};

// Helper function to assign realistic base prices
const getBasePriceForProduct = (productId: number, productIds: number[]): number => {
  const index = productIds.indexOf(productId);
  
  // Map product indices to realistic price ranges
  const priceRanges = [
    999,   // iPhone 15 Pro
    899,   // Samsung Galaxy S24
    1399,  // MacBook Air M3
    1199,  // Dell XPS 13
    1099,  // iPad Pro 12.9"
    349,   // Nintendo Switch OLED
    499,   // PlayStation 5
    499,   // Xbox Series X
    249,   // AirPods Pro 2
    399,   // Sony WH-1000XM5
    429,   // Apple Watch Series 9
    329,   // Samsung Galaxy Watch 6
    3899,  // Canon EOS R5
    2499,  // Sony A7 IV
    1399,  // LG OLED55C3
    1799,  // Samsung 65" Neo QLED
    699,   // Google Pixel 8
    999,   // Microsoft Surface Pro 9
    329,   // Bose QuietComfort 45
    199,   // Ring Video Doorbell 4
    49,    // Amazon Echo Dot 5th Gen
    129,   // Nest Thermostat
    99,    // Logitech MX Master 3S
    179,   // Apple Magic Keyboard
    599,   // NVIDIA RTX 4070
    349,   // AMD Ryzen 7 7700X
    129,   // Samsung 980 PRO SSD 1TB
    89,    // WD Black 4TB External HDD
    39,    // Anker PowerCore 20000
    29,    // Tesla Model Y Phone Mount
  ];
  
  return priceRanges[index] || 100; // Default to $100 if not found
};

// Generate sample high-volume sales for popular items
export const generatePopularItemSales = (
  storeIds: number[],
  productIds: number[]
): any[] => {
  const popularItems = [
    { productIndex: 0, name: 'iPhone 15 Pro', salesVolume: 15 },
    { productIndex: 8, name: 'AirPods Pro 2', salesVolume: 25 },
    { productIndex: 20, name: 'Amazon Echo Dot 5th Gen', salesVolume: 30 },
    { productIndex: 28, name: 'Anker PowerCore 20000', salesVolume: 20 },
    { productIndex: 22, name: 'Logitech MX Master 3S', salesVolume: 18 },
  ];
  
  const salesData: any[] = [];
  const now = new Date();
  
  popularItems.forEach(item => {
    for (let i = 0; i < item.salesVolume; i++) {
      const daysBack = Math.floor(Math.random() * 30);
      const date = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      const storeId = storeIds[Math.floor(Math.random() * storeIds.length)];
      const productId = productIds[item.productIndex];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      const basePrice = getBasePriceForProduct(productId, productIds);
      const unitPrice = basePrice + (Math.random() * 10 - 5); // ±$5 variation for popular items
      const totalAmount = parseFloat((unitPrice * quantity).toFixed(2));
      
      // Business hours sales
      const hour = Math.floor(Math.random() * 11) + 9;
      const minute = Math.floor(Math.random() * 60);
      const saleDateTime = new Date(date);
      saleDateTime.setHours(hour, minute, 0, 0);
      
      salesData.push({
        product_id: productId,
        store_id: storeId,
        quantity_sold: quantity,
        unit_price: unitPrice.toString(),
        total_amount: totalAmount.toString(),
        sale_date: saleDateTime,
      });
    }
  });
  
  return salesData;
};