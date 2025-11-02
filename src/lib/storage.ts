import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage for development
// In production, replace with proper database

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
export async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic storage functions
export async function readJsonFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function appendToJsonFile<T>(filename: string, item: T): Promise<void> {
  const data = await readJsonFile<T>(filename);
  data.unshift(item); // Add to beginning for latest first
  
  // Keep only latest 1000 items
  if (data.length > 1000) {
    data.splice(1000);
  }
  
  await writeJsonFile(filename, data);
}

// Order storage
export interface StoredOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  notes: string;
  items: any[];
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  resellerId?: number;
  resellerRef?: string;
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  await appendToJsonFile('orders.json', order);
}

export async function getOrders(limit = 50): Promise<StoredOrder[]> {
  const orders = await readJsonFile<StoredOrder>('orders.json');
  return orders.slice(0, limit);
}

export async function getOrderById(id: string): Promise<StoredOrder | null> {
  const orders = await readJsonFile<StoredOrder>('orders.json');
  return orders.find(order => order.id === id) || null;
}

// Activity logging
export interface ActivityLog {
  id: string;
  type: 'order_created' | 'order_updated' | 'product_created' | 'product_updated' | 'settings_updated' | 'user_action';
  title: string;
  description: string;
  metadata?: any;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
}

export async function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
  const activityWithId: ActivityLog = {
    ...activity,
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  
  await appendToJsonFile('activity.json', activityWithId);
}

export async function getActivityLogs(limit = 100): Promise<ActivityLog[]> {
  const logs = await readJsonFile<ActivityLog>('activity.json');
  return logs.slice(0, limit);
}