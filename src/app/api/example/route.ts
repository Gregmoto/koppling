/**
 * Example API Route
 *
 * Demonstrates how to use auth context and RBAC in API routes
 */

import { NextResponse } from 'next/server'
import { requireTenant } from '@/lib/auth-context'
import { hasPermission, Permission } from '@/lib/rbac'

export async function GET() {
  try {
    // Require authentication and tenant
    const auth = await requireTenant()

    // Check permissions
    if (!hasPermission(auth.role, Permission.VIEW_ORDERS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Your business logic here
    // Note: auth.tenantId is available for querying tenant-specific data

    return NextResponse.json({
      message: 'Success',
      user: {
        userId: auth.userId,
        tenantId: auth.tenantId,
        role: auth.role,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
