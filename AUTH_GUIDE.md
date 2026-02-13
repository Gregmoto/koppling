# Authentication & Authorization Guide

This document explains the authentication and authorization system implemented in Koppling.

## Overview

The platform uses NextAuth.js for authentication with a custom credentials provider, implementing:
- Email/password authentication
- Multi-tenant isolation
- Role-based access control (RBAC)
- JWT-based sessions

## Architecture

### Components

1. **NextAuth Configuration** (`src/lib/auth.ts`)
   - Configures authentication providers
   - Defines session callbacks
   - Implements custom JWT handling

2. **Middleware** (`src/middleware.ts`)
   - Protects routes requiring authentication
   - Injects tenant context into headers
   - Enforces role-based access

3. **Auth Context** (`src/lib/auth-context.ts`)
   - Extracts user/tenant from requests
   - Provides helper functions for authorization

4. **RBAC System** (`src/lib/rbac.ts`)
   - Defines permissions for each role
   - Provides permission checking utilities

## User Roles

### platform_admin
- Full access to all platform features
- Can manage all tenants
- Can impersonate users
- Can manage blog and changelog
- No tenant association required

### tenant_owner
- Full control over their tenant
- Can manage users within tenant
- Can manage integrations and billing
- Full CRUD on orders/products
- Can trigger and rollback syncs

### tenant_admin
- Operational access within tenant
- Can manage integrations and sync settings
- Full CRUD on orders/products
- Can trigger and rollback syncs
- Cannot manage users or billing

### tenant_viewer
- Read-only access within tenant
- Can view orders and products
- Can view sync history
- Cannot make any changes

## Authentication Flow

### Sign In Process

1. User submits email/password via `/auth/signin`
2. NextAuth validates credentials against database
3. Password is verified using bcrypt
4. User status and tenant status are checked
5. JWT token is created with user ID, role, and tenant ID
6. Session is established
7. User is redirected to dashboard

### Session Management

Sessions use JWT strategy:
- **Max Age**: 30 days
- **Token Contains**: user ID, role, tenant ID
- **Refresh**: Automatic on each request

## Authorization

### Middleware Protection

The middleware (`src/middleware.ts`) runs on every request and:

1. **Public Routes** - Allow unauthenticated access:
   - `/` - Homepage
   - `/auth/*` - Auth pages
   - `/blog` - Blog
   - `/changelog` - Changelog

2. **Protected Routes** - Require authentication:
   - `/dashboard` - Main dashboard
   - `/tenant/*` - Tenant portal
   - All API routes (except `/api/auth/*`)

3. **Admin Routes** - Require `platform_admin` role:
   - `/admin/*` - Platform admin dashboard

4. **Header Injection**:
   - `x-user-id` - Current user ID
   - `x-tenant-id` - Current user's tenant ID (if any)
   - `x-user-role` - Current user's role

### API Route Authorization

API routes should use auth context helpers:

```typescript
import { requireTenant } from '@/lib/auth-context'
import { hasPermission, Permission } from '@/lib/rbac'

export async function GET() {
  // Require authentication and tenant
  const auth = await requireTenant()

  // Check specific permission
  if (!hasPermission(auth.role, Permission.VIEW_ORDERS)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Use auth.tenantId for queries
  const orders = await prisma.order.findMany({
    where: { tenantId: auth.tenantId }
  })

  return NextResponse.json(orders)
}
```

### Available Auth Helpers

```typescript
// Get auth context (returns null if not authenticated)
const auth = await getAuthContext()

// Require authentication (throws if not authenticated)
const auth = await requireAuth()

// Require tenant (throws if no tenant)
const auth = await requireTenant()

// Require specific role
const auth = await requireRole('tenant_owner', 'platform_admin')

// Require platform admin
const auth = await requirePlatformAdmin()
```

## Permissions

See `src/lib/rbac.ts` for full permission definitions.

### Permission Categories

1. **Platform Management** (platform_admin only)
   - `MANAGE_PLATFORM`
   - `MANAGE_ALL_TENANTS`
   - `IMPERSONATE_USERS`
   - `MANAGE_PLATFORM_SETTINGS`
   - `MANAGE_BLOG`
   - `MANAGE_CHANGELOG`

2. **Tenant Management** (owner/admin)
   - `MANAGE_TENANT`
   - `MANAGE_TENANT_USERS` (owner only)
   - `MANAGE_INTEGRATIONS`
   - `MANAGE_SYNC_SETTINGS`
   - `MANAGE_BILLING` (owner only)

3. **Data Operations**
   - `VIEW_ORDERS` (all roles)
   - `VIEW_PRODUCTS` (all roles)
   - `MANAGE_ORDERS` (admin+)
   - `MANAGE_PRODUCTS` (admin+)

4. **Sync Operations**
   - `TRIGGER_SYNC` (admin+)
   - `VIEW_SYNC_HISTORY` (all roles)
   - `ROLLBACK_SYNC` (admin+)

### Permission Checks

```typescript
import { hasPermission, Permission } from '@/lib/rbac'

// Check single permission
if (hasPermission(user.role, Permission.MANAGE_ORDERS)) {
  // User can manage orders
}

// Check multiple permissions (any)
if (hasAnyPermission(user.role, [Permission.VIEW_ORDERS, Permission.MANAGE_ORDERS])) {
  // User can view or manage orders
}

// Check multiple permissions (all)
if (hasAllPermissions(user.role, [Permission.MANAGE_TENANT, Permission.MANAGE_BILLING])) {
  // User can manage both tenant and billing
}
```

## Multi-Tenancy

### Tenant Isolation

All tenant-specific data MUST include `tenantId` in queries:

```typescript
// ✅ CORRECT - Scoped to user's tenant
const orders = await prisma.order.findMany({
  where: { tenantId: auth.tenantId }
})

// ❌ WRONG - Returns data from all tenants
const orders = await prisma.order.findMany()
```

### Platform Admin Access

Platform admins can access all tenant data:

```typescript
import { canAccessTenant } from '@/lib/rbac'

const targetTenantId = req.query.tenantId

if (!canAccessTenant(auth.role, auth.tenantId, targetTenantId)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Password Security

### Password Requirements

Enforced by `validatePasswordStrength()` in `src/lib/password.ts`:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Password Hashing

- Algorithm: bcrypt
- Salt rounds: 12
- Handled by `hashPassword()` in `src/lib/password.ts`

### Password Verification

```typescript
import { verifyPassword } from '@/lib/password'

const isValid = await verifyPassword(inputPassword, user.passwordHash)
```

## Environment Variables

Required for authentication:

```env
# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# Database connection
DATABASE_URL="postgresql://..."

# Token encryption key (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="your-encryption-key"
```

## Testing Authentication

### Local Development

1. **Create a test user** (via Prisma Studio or seed script):
   ```typescript
   await prisma.user.create({
     data: {
       email: 'admin@test.com',
       passwordHash: await hashPassword('Test1234'),
       name: 'Test Admin',
       role: 'platform_admin',
       status: 'active',
     }
   })
   ```

2. **Sign in** at `http://localhost:3000/auth/signin`

3. **Access dashboard** at `http://localhost:3000/dashboard`

### API Testing

Test protected API routes:

```bash
# Get session cookie first
curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test1234"}'

# Use cookie for authenticated request
curl -b cookies.txt http://localhost:3000/api/example
```

## Security Best Practices

1. **Never expose sensitive data**:
   - Password hashes should never be returned in API responses
   - Use `select` to exclude sensitive fields

2. **Always check tenant isolation**:
   - Use `auth.tenantId` in all queries
   - Verify user can access requested tenant data

3. **Use appropriate auth helpers**:
   - Use `requireTenant()` for tenant-specific routes
   - Use `requirePlatformAdmin()` for admin-only routes

4. **Validate permissions**:
   - Check permissions before allowing operations
   - Return proper HTTP status codes (401, 403)

5. **Audit logging**:
   - Log all sensitive operations to audit_log table
   - Include user ID, tenant ID, and action details

## Next Steps

1. Implement password reset flow
2. Add email verification
3. Add two-factor authentication (optional)
4. Add user invitation system
5. Add session management UI
6. Add audit log viewer
