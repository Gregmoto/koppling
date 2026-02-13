# Koppling

**Multi-Tenant SaaS Platform for Fortnox ↔ Shopify Integration**

Koppling is a comprehensive integration platform that enables Swedish businesses to seamlessly sync orders and products between Shopify stores and Fortnox accounting system.

---

## 🚀 Features

### Core Capabilities
- ✅ **Multi-Tenant Architecture** - Strict data isolation with row-level security
- ✅ **Fortnox Integration** - OAuth-based connection with automatic token refresh
- ✅ **Shopify Integration** - Support for multiple stores per tenant
- ✅ **Automated Sync** - Configurable sync intervals (30min - 24h)
- ✅ **Webhooks + Scheduled Sync** - Real-time updates with backup polling
- ✅ **Billing Integration** - Stripe subscription management (99 SEK/month)

### User Roles
- **platform_admin** - Super admin access across all tenants
- **tenant_owner** - Full control over their tenant
- **tenant_admin** - Administrative access within tenant
- **tenant_viewer** - Read-only access within tenant

### Key Features
- 📊 **Admin Dashboard** - Tenant management, KPIs, impersonation
- 🏢 **Tenant Portal** - Integration management, sync settings, orders/products
- 📝 **Blog CMS** - Admin-managed blog with rich text editor
- 📋 **Changelog** - Public product updates page
- 🔐 **Security** - Encrypted tokens, audit logging, RBAC
- 🔄 **Sync Rollback** - Undo last automated sync if errors occur

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router & TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Billing**: Stripe
- **Integrations**: Fortnox API, Shopify Admin API

---

## 📋 Prerequisites

- Node.js 18+ (v25.6.1 installed)
- PostgreSQL database
- Stripe account (for billing)
- Fortnox developer account
- Shopify Partners account (optional, for testing)

---

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd koppling
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Fill in the required values in `.env`:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/koppling"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="your-encryption-key"    # Generate: openssl rand -base64 32

# Stripe (optional for local dev)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Add other variables as needed
\`\`\`

### 4. Set Up Database

Create a PostgreSQL database:

\`\`\`bash
createdb koppling
\`\`\`

Run Prisma migrations:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Generate Prisma Client:

\`\`\`bash
npx prisma generate
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Database Schema

The application uses 14 tables:

1. **tenants** - Company/workspace data
2. **users** - User accounts with role-based access
3. **billing_subscriptions** - Stripe subscription data
4. **tenant_onboarding** - Onboarding progress tracking
5. **integrations_fortnox** - Fortnox connection data
6. **integrations_shopify_stores** - Shopify store connections
7. **sync_settings** - Tenant-specific sync configuration
8. **orders** - Synced Shopify orders
9. **products** - Synced Shopify products
10. **sync_jobs** - Sync execution history
11. **platform_settings** - Global admin settings
12. **blog_posts** - CMS content
13. **audit_log** - Change tracking
14. **changelog_entries** - Product changelog

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete schema.

---

## 🚢 Deployment to Vercel

### Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`

### Deploy

1. **Set up Vercel Postgres** (or use external PostgreSQL):

\`\`\`bash
vercel link
vercel storage create postgres
\`\`\`

2. **Add environment variables** in Vercel dashboard:

Go to Project Settings → Environment Variables and add:

- `DATABASE_URL` (from Vercel Postgres)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ENCRYPTION_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- All other required variables from `.env.example`

3. **Deploy**:

\`\`\`bash
vercel --prod
\`\`\`

4. **Run migrations** on production database:

\`\`\`bash
# Set DATABASE_URL to production database
npx prisma migrate deploy
\`\`\`

---

## 🔧 Development

### Project Structure

\`\`\`
koppling/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   │   └── prisma.ts     # Prisma client singleton
│   └── generated/         # Prisma generated client
│       └── prisma/
├── public/               # Static assets
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment template
├── vercel.json           # Vercel configuration
└── package.json
\`\`\`

### Available Scripts

\`\`\`bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open Prisma Studio (GUI)
npx prisma migrate dev    # Create and apply migration
npx prisma db push   # Push schema to database (quick)
npx prisma generate  # Generate Prisma Client

# Linting
npm run lint         # Run ESLint
\`\`\`

---

## 📖 Documentation

For complete specifications, see:
- [KOPPLING_SPECS.md](../KOPPLING_SPECS.md) - Comprehensive feature specifications
- [Prisma Schema](./prisma/schema.prisma) - Database structure
- [API Routes](./src/app/api/) - API endpoint documentation (to be added)

---

## 🔒 Security

### Multi-Tenancy
- Every tenant-owned record includes `tenant_id`
- All queries are scoped by tenant
- Row-level security enforced
- No cross-tenant data access possible

### Secrets Management
- All API tokens encrypted at rest
- Secrets never displayed in UI after saving
- Environment variables for sensitive config
- Audit logging for all actions

---

## 🎯 Roadmap

### Phase 1: Core Setup ✅
- [x] Next.js project with TypeScript
- [x] Prisma schema with 14 tables
- [x] Vercel deployment configuration

### Phase 2: Authentication (Next)
- [ ] NextAuth.js setup with email/password
- [ ] Multi-tenant middleware
- [ ] Role-based access control
- [ ] Password reset flow

### Phase 3: Public Website
- [ ] Marketing homepage
- [ ] Registration flow
- [ ] Blog listing & posts
- [ ] Changelog page

### Phase 4: Admin Dashboard
- [ ] Admin authentication
- [ ] Tenant management
- [ ] Platform settings
- [ ] Blog CMS

### Phase 5: Tenant Portal
- [ ] Dashboard with status cards
- [ ] Fortnox OAuth integration
- [ ] Shopify store management
- [ ] Sync settings configuration

### Phase 6: Sync Engine
- [ ] Shopify API integration
- [ ] Fortnox API integration
- [ ] Scheduled sync jobs
- [ ] Webhook handlers
- [ ] Rollback functionality

### Phase 7: Billing
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Subscription management
- [ ] Webhook handlers

---

## 🤝 Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for review

---

## 📝 License

Proprietary - All Rights Reserved

---

## 🆘 Support

For issues or questions:
- Check [KOPPLING_SPECS.md](../KOPPLING_SPECS.md) for specifications
- Review Prisma schema for database structure
- Contact the development team

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Fortnox API](https://developer.fortnox.se/)
- [Shopify Admin API](https://shopify.dev/docs/admin-api)

---

Built with ❤️ in Sweden
