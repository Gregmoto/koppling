/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * Define permissions for each role and provide helper functions
 * to check access
 */

import { UserRole } from '@/generated/prisma'

/**
 * Permission definitions
 */
export enum Permission {
  // Platform management
  MANAGE_PLATFORM = 'manage_platform',
  MANAGE_ALL_TENANTS = 'manage_all_tenants',
  IMPERSONATE_USERS = 'impersonate_users',
  MANAGE_PLATFORM_SETTINGS = 'manage_platform_settings',
  MANAGE_BLOG = 'manage_blog',
  MANAGE_CHANGELOG = 'manage_changelog',

  // Tenant management
  MANAGE_TENANT = 'manage_tenant',
  MANAGE_TENANT_USERS = 'manage_tenant_users',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  MANAGE_SYNC_SETTINGS = 'manage_sync_settings',
  MANAGE_BILLING = 'manage_billing',

  // Data operations
  VIEW_ORDERS = 'view_orders',
  VIEW_PRODUCTS = 'view_products',
  MANAGE_ORDERS = 'manage_orders',
  MANAGE_PRODUCTS = 'manage_products',

  // Sync operations
  TRIGGER_SYNC = 'trigger_sync',
  VIEW_SYNC_HISTORY = 'view_sync_history',
  ROLLBACK_SYNC = 'rollback_sync',

  // Audit log
  VIEW_AUDIT_LOG = 'view_audit_log',
}

/**
 * Role permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  platform_admin: [
    // Platform admins have all permissions
    Permission.MANAGE_PLATFORM,
    Permission.MANAGE_ALL_TENANTS,
    Permission.IMPERSONATE_USERS,
    Permission.MANAGE_PLATFORM_SETTINGS,
    Permission.MANAGE_BLOG,
    Permission.MANAGE_CHANGELOG,
    Permission.MANAGE_TENANT,
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.MANAGE_SYNC_SETTINGS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_ORDERS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_PRODUCTS,
    Permission.TRIGGER_SYNC,
    Permission.VIEW_SYNC_HISTORY,
    Permission.ROLLBACK_SYNC,
    Permission.VIEW_AUDIT_LOG,
  ],

  tenant_owner: [
    // Tenant owners can manage their tenant fully
    Permission.MANAGE_TENANT,
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.MANAGE_SYNC_SETTINGS,
    Permission.MANAGE_BILLING,
    Permission.VIEW_ORDERS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_PRODUCTS,
    Permission.TRIGGER_SYNC,
    Permission.VIEW_SYNC_HISTORY,
    Permission.ROLLBACK_SYNC,
    Permission.VIEW_AUDIT_LOG,
  ],

  tenant_admin: [
    // Tenant admins can manage operations but not billing or users
    Permission.MANAGE_INTEGRATIONS,
    Permission.MANAGE_SYNC_SETTINGS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_ORDERS,
    Permission.MANAGE_PRODUCTS,
    Permission.TRIGGER_SYNC,
    Permission.VIEW_SYNC_HISTORY,
    Permission.ROLLBACK_SYNC,
    Permission.VIEW_AUDIT_LOG,
  ],

  tenant_viewer: [
    // Tenant viewers can only read data
    Permission.VIEW_ORDERS,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_SYNC_HISTORY,
    Permission.VIEW_AUDIT_LOG,
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.includes(permission)
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if a role can manage a tenant
 */
export function canManageTenant(role: UserRole): boolean {
  return hasPermission(role, Permission.MANAGE_TENANT)
}

/**
 * Check if a role can manage users
 */
export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, Permission.MANAGE_TENANT_USERS)
}

/**
 * Check if a role is platform admin
 */
export function isPlatformAdmin(role: UserRole): boolean {
  return role === 'platform_admin'
}

/**
 * Check if a role is tenant owner
 */
export function isTenantOwner(role: UserRole): boolean {
  return role === 'tenant_owner'
}

/**
 * Check if user can access tenant data
 * Platform admins can access all tenants
 * Other users can only access their own tenant
 */
export function canAccessTenant(userRole: UserRole, userTenantId: string | null, targetTenantId: string): boolean {
  if (isPlatformAdmin(userRole)) {
    return true
  }

  return userTenantId === targetTenantId
}
