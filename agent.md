# Alpadev MONOREPO - Master Prompt Context

## 🏗️ PROJECT ARCHITECTURE OVERVIEW

**alpadev Monorepo** is a full-stack SaaS application built with modern TypeScript technologies, featuring:
- **Frontend**: Next.js 15 with React 19, Tailwind CSS, GSAP animations
- **Backend**: tRPC API with Prisma ORM and PostgreSQL
- **Auth**: NextAuth.js with Google/GitHub providers
- **Infrastructure**: Turbo monorepo with pnpm workspaces
- **Deployment**: Docker containerization ready

---

## 📁 MONOREPO STRUCTURE & LAYER-SPECIFIC CONTEXTS

### 🚀 **APPLICATIONS LAYER** (`/apps/`)

#### **Frontend Application** (`apps/frontend/`)
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, GSAP
- **Key Features**: Landing page, authentication, admin dashboard, subscription management
- **Entry Points**:
  - `src/app/page.tsx` - Main landing page
  - `src/app/principal/page.tsx` - Dashboard/principal page
  - `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API
  - `src/app/api/trpc/[trpc]/route.ts` - tRPC API endpoint
- **Components Structure**:
  - `src/app/_components/` - Page-specific components (Hero, Navbar, Footer, etc.)
  - `src/context/` - React context providers (Theme, Auth)
  - `src/hooks/` - Custom hooks including GSAP animation helpers
  - `src/lib/trpc/` - tRPC client configuration
- **Styling**: Tailwind CSS with custom animations, Instrument Sans font
- **State Management**: React Query + tRPC, NextAuth for auth state

#### **Mobile Application** (`apps/mobile/`)
- **Status**: Directory exists but appears to be placeholder/future development

---

### 📦 **PACKAGES LAYER** (`/packages/`)

#### **API Package** (`@package/api`)
- **Purpose**: tRPC API layer with modular router architecture
- **Structure**:
  - `src/index.ts` - Main API exports
  - `src/root.ts` - Root tRPC router
  - `src/trpc.ts` - tRPC server configuration
  - `src/routers/` - Feature-based routers:
    - `admin/` - Admin operations with sub-routers
    - `user/` - User management operations
- **Architecture Pattern**: Repository → Service → Router (RSR pattern)
- **Dependencies**: `@package/auth`, `@package/db`, `@package/email`, `@package/utils`

#### **Database Package** (`@package/db`)
- **Purpose**: Prisma ORM configuration and database management
- **Schema**: Mongo with models for:
  - **Authentication**: `User`, `Account`, `Session`, `VerificationToken`
  - **Authorization**: Role-based access (`Role` enum: USER, ADMIN)
  - **Subscription**: Stripe integration with `Subscription` model
  - **Moderation**: `Ban` system with audit trail
- **Key Files**:
  - `prisma/schema.prisma` - Database schema definition
  - `prisma/seed.ts` - Database seeding script
  - `db.ts` - Prisma client configuration
- **Commands**: Full suite of migration, seeding, and studio commands

#### **Authentication Package** (`@package/auth`)
- **Purpose**: NextAuth.js configuration and utilities
- **Features**:
  - Google and GitHub OAuth providers
  - Session management utilities
  - Type definitions for auth
- **Key Files**:
  - `src/auth/authOptions.ts` - NextAuth configuration
  - `src/utils/serverSession.ts` - Server-side session utilities

#### **Email Package** (`@package/email`)
- **Purpose**: Email templating and sending with Resend
- **Features**:
  - React-based email templates
  - Magic link authentication emails
  - Invoice and subscription notifications
- **Templates**: `MagicLinkSignIn`, `InvoicePaymentFailed`, `TrialEndingSoon`

#### **Utils Package** (`@package/utils`)
- **Purpose**: Shared utilities and constants
- **Contains**:
  - Feature flags and entitlements
  - Subscription plan definitions
  - Date, number, and URL utilities
  - Tailwind CSS class name utilities

#### **Web3 Package** (`@package/web3`)
- **Purpose**: Blockchain integration with Hardhat
- **Features**: Smart contracts for product management and token handling
- **Contracts**: `Products.sol`, `MockERC20.sol`, `Lock.sol`

#### **Configuration Packages** (`@package/configs/*`)
- **ESLint Config**: Shared linting rules across monorepo
- **Prettier Config**: Code formatting standards
- **TypeScript Config**: Shared TypeScript configurations
- **Tailwind Config**: Base Tailwind configuration

---

## 🔧 **DEVELOPMENT WORKFLOW & COMMANDS**

### **Root Level Commands** (use `pnpm run` prefix):
```bash
# Development
pnpm run dev          # Start all apps in development mode
pnpm run build        # Build all packages and apps
pnpm run start        # Start production builds

# Database Operations
pnpm run db:generate  # Generate Prisma client
pnpm run db:push      # Push schema changes to database
pnpm run db:migrate   # Run database migrations
pnpm run db:seed      # Seed database with test data
pnpm run db:reset     # Reset database (destructive)

# Code Quality
pnpm run lint         # Lint all packages
pnpm run format       # Format all code with Prettier
```

### **Environment Configuration**:
- **Required Env Vars**: `DATABASE_URL`, `NEXTAUTH_SECRET`, OAuth credentials
- **Optional**: Resend email, Stripe, feature flags
- **Files**: `.env`, `.env.local`, `.env.development`

---

## 🎯 **CLAUDE CODE SPECIFIC INSTRUCTIONS**

### **When Working with This Codebase:**

1. **🔍 LAYER-AWARE DEVELOPMENT**:
   - **Frontend changes**: Work in `apps/frontend/src/`
   - **API changes**: Work in `packages/api/src/routers/`
   - **Database changes**: Update `packages/db/prisma/schema.prisma`
   - **Shared utilities**: Add to `packages/utils/src/`

2. **🏗️ ARCHITECTURE PATTERNS TO FOLLOW**:
   - **tRPC Routers**: Repository → Service → Router pattern
   - **Components**: Functional components with TypeScript
   - **Styling**: Tailwind CSS with consistent design system
   - **State**: React Query for server state, React Context for client state

3. **📝 FILE NAMING CONVENTIONS**:
   - **Components**: PascalCase (e.g., `UserProfile.tsx`)
   - **Utilities**: camelCase (e.g., `formatDate.ts`)
   - **Types**: PascalCase with `.types.ts` suffix
   - **Tests**: Same name with `.test.ts` suffix

4. **🔄 DEPENDENCY MANAGEMENT**:
   - **Internal packages**: Use `workspace:*` protocol
   - **Version alignment**: Keep versions consistent across packages
   - **Peer dependencies**: Defined in frontend for Prisma client

5. **🛠️ DEVELOPMENT BEST PRACTICES**:
   - **Always run `pnpm run db:generate` after schema changes**
   - **Use TypeScript strictly** - no `any` types
   - **Follow existing patterns** in each package
   - **Test locally** with `pnpm run dev` before committing

### **🎨 UI/UX CONTEXT**:
- **Design System**: Tailwind CSS with custom animations
- **Components**: Headless UI, Hero UI, custom components
- **Animations**: GSAP with custom hooks (`useGSAPFade`, `useGSAPHover`)
- **Responsive**: Mobile-first approach with Tailwind breakpoints

### **🔐 SECURITY CONSIDERATIONS**:
- **Authentication**: NextAuth.js with proper session handling
- **Authorization**: Role-based access control in tRPC procedures
- **Environment Variables**: Never expose secrets, use proper validation
- **Database**: Prepared statements via Prisma (SQL injection protection)

### **📊 MONITORING & PERFORMANCE**:
- **Bundle Analysis**: Next.js built-in analyzer
- **Database Performance**: Prisma query optimization
- **Caching**: Next.js caching strategies for static/dynamic content
- **Error Handling**: Proper error boundaries and tRPC error handling

---

## 🚦 **QUICK START VALIDATION**

Before making changes, verify:
1. **Dependencies installed**: `pnpm install`
2. **Database running**: PostgreSQL instance available
3. **Environment configured**: Required env vars set
4. **Development server**: `pnpm run dev` starts successfully
5. **Database synced**: `pnpm run db:push` executes cleanly

---

## 📋 **COMMON TASK PATTERNS**

### **Adding a New Feature**:
1. **Database**: Update `packages/db/prisma/schema.prisma` if needed
2. **API**: Add router in `packages/api/src/routers/`
3. **Frontend**: Create components in `apps/frontend/src/app/_components/`
4. **Types**: Share types via package exports
5. **Test**: Verify with development server

### **Fixing Bugs**:
1. **Identify layer**: Frontend, API, or Database
2. **Check types**: TypeScript errors often indicate issues
3. **Test locally**: Use development environment
4. **Follow patterns**: Maintain consistency with existing code

This master prompt provides Claude with comprehensive, layer-specific context for efficient development in the Komanta monorepo.