# 🗺️ Database Migration Guide

## 🏁 Overview
Migrasi dari file-based storage (JSON) ke database MySQL dengan Prisma untuk order tracking yang lebih robust.

## 🚀 Migration Steps

### 1. Generate & Run Migration
```bash
# Generate Prisma client with new models
npx prisma generate

# Push schema changes to database
npx prisma db push

# Alternative: Create proper migration
npx prisma migrate dev --name add_order_tables
```

### 2. Verify Database Schema
```bash
# Check database
npx prisma studio

# Or connect to MySQL directly
mysql -u your_username -p your_database_name
SHOW TABLES;
DESCRIBE orders;
DESCRIBE order_items;
```

## 📊 New Database Tables

### `orders` Table
- **id**: VARCHAR (CUID) - Primary key
- **customer_name**: VARCHAR - Customer full name
- **customer_email**: VARCHAR - Customer email
- **customer_phone**: VARCHAR - Customer phone
- **customer_address**: TEXT - Full address
- **payment_method**: VARCHAR - Payment type
- **notes**: TEXT - Customer notes
- **total_amount**: DECIMAL(12,2) - Total order value
- **total_items**: INT - Total quantity
- **status**: ENUM - Order status
- **reseller_id**: INT - Optional reseller reference
- **created_at/updated_at**: DATETIME

### `order_items` Table
- **id**: INT AUTO_INCREMENT - Primary key
- **order_id**: VARCHAR - Foreign key to orders
- **product_id**: INT - Foreign key to products
- **variant_id**: INT - Optional variant reference
- **quantity**: INT - Item quantity
- **unit_price**: DECIMAL(10,2) - Price per item
- **total_price**: DECIMAL(12,2) - Total for this item
- **notes**: TEXT - Item-specific notes
- **created_at/updated_at**: DATETIME

### Enhanced `activity_logs`
- **type**: VARCHAR - Activity category
- **title**: VARCHAR - Activity title
- **description**: TEXT - Detailed description
- **metadata**: JSON - Additional structured data
- **ip_address**: VARCHAR - Request IP
- **user_agent**: VARCHAR - Browser info

### Enhanced `site_settings`
- **business_address**: TEXT - Business location
- **primary_color**: VARCHAR - Brand primary color
- **secondary_color**: VARCHAR - Brand secondary color
- **logo_url**: VARCHAR - Logo image URL
- **favicon_url**: VARCHAR - Favicon URL

## 🔄 API Changes

### 📦 Orders API (`/api/orders`)
**BEFORE:**
- Saved to `/data/orders.json`
- Simple file append
- No stock management

**AFTER:**
- Saves to `orders` and `order_items` tables
- Automatic stock deduction
- Proper transaction handling
- Activity logging to database

### 📋 Admin Orders API (`/api/admin/orders`)
**BEFORE:**
- Read from JSON file
- Manual pagination

**AFTER:**
- Query from database with relations
- Prisma-powered pagination
- Real-time statistics
- Proper filtering and sorting

### 📈 Activity API (`/api/admin/activity`)
**BEFORE:**
- Read from `/data/activity.json`
- Simple array operations

**AFTER:**
- Query from `activity_logs` table
- User relations and metadata
- Type-based filtering
- Automatic order activity tracking

## 🔒 Data Integrity

### Foreign Key Relationships
- `orders.reseller_id` → `resellers.id`
- `order_items.order_id` → `orders.id` (CASCADE DELETE)
- `order_items.product_id` → `products.id`
- `order_items.variant_id` → `variants.id`
- `activity_logs.user_id` → `users.id`

### Automatic Stock Management
```typescript
// When order created, stock is automatically decremented:
if (item.variantId) {
  await tx.variant.update({
    where: { id: item.variantId },
    data: { stock: { decrement: item.quantity } }
  });
} else {
  await tx.product.update({
    where: { id: item.productId },
    data: { stock: { decrement: item.quantity } }
  });
}
```

## ⚙️ Configuration

### Environment Variables Required
```env
# .env.local
DATABASE_URL="mysql://username:password@localhost:3306/your_database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### Prisma Configuration
```json
// package.json scripts
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 🧠 Testing

### 1. Database Connection
```bash
# Test Prisma connection
npx prisma db pull
npx prisma generate
```

### 2. API Testing
```bash
# Test orders API
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{ "customerName": "Test User", ... }'

# Test admin orders API  
curl http://localhost:3000/api/admin/orders

# Test activity API
curl http://localhost:3000/api/admin/activity
```

### 3. Frontend Testing
1. Go to `/products` - Add items to cart
2. Go to `/cart` - Review items
3. Go to `/checkout` - Complete order
4. Go to `/admin` - Verify order appears
5. Go to `/admin/transactions` - Check order details

## 🎆 Benefits

### 📈 **Performance**
- Database queries vs file I/O
- Proper indexing and optimization
- Concurrent access handling

### 🔒 **Data Integrity**
- ACID transactions
- Foreign key constraints
- Automatic stock management
- Consistent data validation

### 📉 **Scalability**
- Handle thousands of orders
- Efficient pagination
- Real-time statistics
- Proper relationship queries

### 🔍 **Maintainability**
- Type-safe database operations
- Automatic migrations
- Schema versioning
- Easy backup and restore

## ⚠️ Important Notes

1. **Backup database** before running migrations
2. **Test in development** environment first
3. **Update environment variables** if needed
4. **Run `npx prisma generate`** after schema changes
5. **Restart Next.js server** after Prisma changes

## 🎉 Migration Complete!

Setelah migration:
- ✅ Orders disimpan ke database MySQL
- ✅ Admin dashboard menampilkan data real
- ✅ Activity logs terintegrasi
- ✅ Stock management otomatis
- ✅ Relationship queries optimized
- ✅ Production-ready scaling

**🚀 Siap untuk production dengan database yang proper!**