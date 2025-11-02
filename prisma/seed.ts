// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Developer Role
  const developerRole = await prisma.role.upsert({
    where: { name: 'DEVELOPER' },
    update: {},
    create: {
      name: 'DEVELOPER',
      permissions: [
        'products:read',
        'products:create',
        'products:update',
        'products:delete',
        'resellers:read',
        'resellers:create',
        'resellers:update',
        'resellers:delete',
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'roles:manage',
        'logs:read',
        'transactions:read',
      ],
    },
  })

  // Create Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: [
        'products:read',
        'products:create',
        'products:update',
        'products:delete',
        'resellers:read',
        'resellers:create',
        'resellers:update',
        'resellers:delete',
        'transactions:read',
      ],
    },
  })

  // Create Developer User
  const hashedPassword = await bcrypt.hash('developer123', 10)
  const developerUser = await prisma.user.upsert({
    where: { email: 'developer@store.com' },
    update: {},
    create: {
      username: 'developer',
      email: 'developer@store.com',
      passwordHash: hashedPassword,
      roleId: developerRole.id,
    },
  })

  // Create Admin User
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@store.com',
      passwordHash: hashedAdminPassword,
      roleId: adminRole.id,
    },
  })

  // Create Sample Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop Gaming ROG',
      description: 'Laptop gaming performa tinggi dengan prosesor terbaru dan GPU dedicated',
      iconUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
      stock: 15,
      price: 15000000,
      status: 'ACTIVE',
      variants: {
        create: [
          { name: 'RAM', value: '16GB', stock: 8 },
          { name: 'RAM', value: '32GB', stock: 7 },
        ],
      },
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Smartphone Android Flagship',
      description: 'Smartphone flagship dengan kamera 108MP dan layar AMOLED 120Hz',
      iconUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      stock: 25,
      price: 8500000,
      status: 'ACTIVE',
      variants: {
        create: [
          { name: 'Warna', value: 'Black', stock: 10 },
          { name: 'Warna', value: 'White', stock: 15 },
        ],
      },
    },
  })

  const product3 = await prisma.product.create({
    data: {
      name: 'Headphone Wireless Premium',
      description: 'Headphone dengan Active Noise Cancellation dan battery life 40 jam',
      iconUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      stock: 50,
      price: 2500000,
      status: 'ACTIVE',
    },
  })

  // Create Sample Resellers
  const reseller1 = await prisma.reseller.create({
    data: {
      name: 'Reseller Jakarta',
      whatsappNumber: '6281234567890',
      uniqueId: 'RESELLER-JKT-001',
    },
  })

  const reseller2 = await prisma.reseller.create({
    data: {
      name: 'Reseller Bandung',
      whatsappNumber: '6281234567891',
      uniqueId: 'RESELLER-BDG-001',
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📋 Created Users:')
  console.log(`   Developer: ${developerUser.email} / password: developer123`)
  console.log(`   Admin: ${adminUser.email} / password: admin123`)
  console.log('\n📦 Created Products:', { product1, product2, product3 })
  console.log('👥 Created Resellers:', { reseller1, reseller2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
