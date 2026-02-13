# Koppling - Quick Start Guide

Get Koppling running locally in minutes.

## Prerequisites

- Node.js 18+ (v25.6.1 installed)
- PostgreSQL database
- Git

## Step 1: Environment Setup

1. **Copy environment template**:
   ```bash
   cd koppling
   cp .env.example .env
   ```

2. **Generate secrets**:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate ENCRYPTION_KEY
   openssl rand -base64 32
   ```

3. **Edit `.env` file**:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/koppling"
   NEXTAUTH_SECRET="<paste-generated-secret>"
   NEXTAUTH_URL="http://localhost:3000"
   ENCRYPTION_KEY="<paste-generated-encryption-key>"
   ```

## Step 2: Database Setup

1. **Create database**:
   ```bash
   createdb koppling
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Step 3: Create Test User

Open Prisma Studio:
```bash
npx prisma studio
```

Create a user in the `users` table:
- **email**: `admin@test.com`
- **name**: `Test Admin`
- **role**: `platform_admin`
- **status**: `active`
- **passwordHash**: (see below to generate)

### Generate Password Hash

Run this in a Node.js console:
```javascript
const bcrypt = require('bcryptjs')
bcrypt.hash('Test1234', 12).then(console.log)
```

Or use this online tool: https://bcrypt-generator.com/ (12 rounds)

## Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Sign In

1. Go to http://localhost:3000/auth/signin
2. Email: `admin@test.com`
3. Password: `Test1234` (or whatever you set)
4. You'll be redirected to the dashboard!

## What's Available

### Pages
- `/` - Homepage (default Next.js page)
- `/auth/signin` - Sign in page
- `/dashboard` - Protected dashboard
- `/auth/error` - Auth error page

### API Routes
- `/api/auth/*` - NextAuth endpoints
- `/api/example` - Example protected API route

## File Structure

```
koppling/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   └── example/             # Example API route
│   │   ├── auth/
│   │   │   ├── signin/              # Sign in page
│   │   │   └── error/               # Error page
│   │   ├── dashboard/               # Dashboard page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Homepage
│   ├── components/
│   │   ├── auth/
│   │   │   └── signout-button.tsx   # Sign out button
│   │   └── providers/
│   │       └── session-provider.tsx # Session provider
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth config
│   │   ├── auth-context.ts          # Auth helpers
│   │   ├── password.ts              # Password utilities
│   │   ├── prisma.ts                # Prisma client
│   │   └── rbac.ts                  # RBAC utilities
│   ├── middleware.ts                # Multi-tenant middleware
│   └── generated/                   # Generated Prisma client
├── prisma/
│   └── schema.prisma                # Database schema
├── .env                             # Environment variables
├── AUTH_GUIDE.md                    # Auth documentation
├── README.md                        # Full documentation
└── deploy-to-vercel.sh              # Vercel deployment script
```

## Development Tools

### Prisma Studio
Visual database editor:
```bash
npx prisma studio
```

### Database Migration
Create a new migration:
```bash
npx prisma migrate dev --name description
```

### Reset Database
Drop all data and rerun migrations:
```bash
npx prisma migrate reset
```

## Testing Features

### Test Authentication
1. Sign in with your test user
2. Visit `/dashboard` - should see your user info
3. Visit `/api/example` - should see JSON response

### Test Authorization
1. Create users with different roles in Prisma Studio
2. Sign in as each role
3. Observe different permissions in dashboard

### Test Multi-Tenancy
1. Create a tenant in Prisma Studio
2. Create a user with `tenant_owner` role linked to that tenant
3. Sign in - dashboard will show tenant-specific content

## Common Issues

### "Unauthorized" Error
- Make sure you're signed in
- Check that cookies are enabled
- Clear browser cookies and sign in again

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Make sure database exists: `createdb koppling`

### Prisma Client Not Found
Run: `npx prisma generate`

### Password Hash Issues
- Use bcrypt with 12 rounds
- Store the full hash (starts with `$2a$` or `$2b$`)
- Hash must be in `passwordHash` field

## Next Steps

1. **Deploy to Vercel**:
   ```bash
   ./deploy-to-vercel.sh
   ```

2. **Read Documentation**:
   - [README.md](README.md) - Full project documentation
   - [AUTH_GUIDE.md](AUTH_GUIDE.md) - Authentication details
   - [KOPPLING_SPECS.md](../KOPPLING_SPECS.md) - Complete specifications

3. **Start Building**:
   - Phase 3: Public Website
   - Phase 4: Admin Dashboard
   - Phase 5: Tenant Portal
   - Phase 6: Sync Engine
   - Phase 7: Billing

## Support

- Check existing documentation
- Review Prisma schema for database structure
- See example API route for patterns
- Read NextAuth.js docs: https://next-auth.js.org
