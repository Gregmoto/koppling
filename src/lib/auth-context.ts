/**
 * Auth Context Helpers
 *
 * Extract authenticated user and tenant context from request headers
 * (populated by middleware)
 */

import { headers } from 'next/headers'
import { UserRole } from '@/generated/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export interface AuthContext {
  userId: string
  tenantId: string | null
  role: UserRole
}

/**
 * Get auth context from request headers (for API routes)
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const headersList = await headers()

  const userId = headersList.get('x-user-id')
  const tenantId = headersList.get('x-tenant-id')
  const role = headersList.get('x-user-role') as UserRole | null

  if (!userId || !role) {
    return null
  }

  return {
    userId,
    tenantId,
    role,
  }
}

/**
 * Get auth context from session (for server components)
 */
export async function getAuthContextFromSession(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext()

  if (!context) {
    throw new Error('Unauthorized')
  }

  return context
}

/**
 * Require tenant - throws error if user doesn't have a tenant
 */
export async function requireTenant(): Promise<Required<AuthContext>> {
  const context = await requireAuth()

  if (!context.tenantId) {
    throw new Error('No tenant associated with user')
  }

  return context as Required<AuthContext>
}

/**
 * Require specific role(s) - throws error if user doesn't have required role
 */
export async function requireRole(...roles: UserRole[]): Promise<AuthContext> {
  const context = await requireAuth()

  if (!roles.includes(context.role)) {
    throw new Error('Insufficient permissions')
  }

  return context
}

/**
 * Require platform admin role
 */
export async function requirePlatformAdmin(): Promise<AuthContext> {
  return requireRole('platform_admin')
}
