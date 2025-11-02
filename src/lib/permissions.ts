// src/lib/permissions.ts
export const PERMISSIONS = {
  PRODUCTS_READ: 'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  RESELLERS_READ: 'resellers:read',
  RESELLERS_CREATE: 'resellers:create',
  RESELLERS_UPDATE: 'resellers:update',
  RESELLERS_DELETE: 'resellers:delete',
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  ROLES_MANAGE: 'roles:manage',
  LOGS_READ: 'logs:read',
  TRANSACTIONS_READ: 'transactions:read',
}

export const DEFAULT_ROLES = {
  DEVELOPER: {
    name: 'DEVELOPER',
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: 'ADMIN',
    permissions: [
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.RESELLERS_READ,
      PERMISSIONS.RESELLERS_CREATE,
      PERMISSIONS.RESELLERS_UPDATE,
      PERMISSIONS.RESELLERS_DELETE,
      PERMISSIONS.TRANSACTIONS_READ,
    ],
  },
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}
