# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Install dependencies
npm install

# Initialize MySQL database (first time setup)
npm run db:init

# Generate Drizzle migrations from schema changes
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes directly to database (development only)
npm run db:push
```

### Development Workflow
```bash
# Start development server (frontend + backend with HMR)
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database seeding (development only)
curl -X POST http://localhost:5000/api/dev/seed
```

### Testing Individual Components
Since this is a full-stack application, you can test specific parts:
- Frontend: Access `http://localhost:5000` after `npm run dev`
- Backend API: Test endpoints at `http://localhost:5000/api/*`
- Database: Use `npm run db:push` to test schema changes quickly

## Architecture Overview

### Project Structure
```
SchoolPilot/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (Node.js + TypeScript)  
├── shared/          # Shared types, schemas, utilities
├── scripts/         # Database initialization and migration scripts
└── drizzle/         # Database migration files
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript (ES modules)
- **Database**: MySQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **State Management**: React Context (auth) + TanStack Query (server state)
- **File Storage**: Google Cloud Storage integration

### Key Architectural Patterns

#### Monorepo Structure with Path Aliases
- `@/*` maps to `client/src/*` (frontend components/pages)
- `@shared/*` maps to `shared/*` (shared types and schemas)
- Backend uses direct relative imports from `shared/`

#### Authentication Flow
- JWT-based authentication with role-based access control
- Roles: `super_admin`, `admin`, `teacher`, `student`, `parent`
- User approval system (except super_admin can always login)
- Route protection on both client and server sides

#### Database Architecture
- **ORM**: Drizzle with MySQL dialect
- **Migrations**: Generated via `drizzle-kit`, managed in `drizzle/mysql-migrations/`
- **Schema**: TypeScript-first with Zod validation integration
- **Table Prefix**: All tables use `schoolpilot_*` prefix

#### API Design
- RESTful endpoints under `/api/*` prefix
- Role-based route organization:
  - `/api/super-admin/*` - Super admin only
  - `/api/admin/*` - Admin level and above
  - `/api/auth/*` - Public authentication routes
- Consistent error handling with Zod validation
- Request/response logging middleware

#### Frontend Architecture
- **Component Organization**: Pages, layouts, and reusable UI components
- **State Management**: AuthContext for user state, React Query for server state
- **Role-Based Routing**: Different dashboard components per user role
- **Layout System**: Main layout wrapper vs. full-screen dashboards for admin roles

### Development Patterns

#### Schema-First Development
All data structures are defined in `shared/schema.ts` using Drizzle schema definitions with Zod integration. This ensures type safety across frontend, backend, and database layers.

#### Environment-Specific Behavior
- Development: Hot reload, seed endpoints, detailed logging
- Production: Optimized builds, static file serving, error boundaries

#### Route Organization
Server routes are modularized by feature area:
- Core auth routes in `server/routes.ts`
- Feature-specific routes in `server/routes/*Routes.ts`
- Dynamic imports for lazy loading of route modules

#### Client-Side Architecture
- Wouter for lightweight routing (not React Router)
- Role-specific dashboard components that bypass the main layout
- Toast notifications with custom hook integration
- Mobile-responsive design with custom hooks

### Database Management

#### Migration Workflow
1. Modify schemas in `shared/schema.ts`
2. Run `npm run db:generate` to create migrations
3. Run `npm run db:migrate` to apply migrations
4. For rapid development, use `npm run db:push` to skip migration files

#### Environment Variables
Required for database connection:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Optional: `DB_PORT` (defaults to 3306)

### Important Notes
- Server runs on port specified by `PORT` environment variable (defaults to 5000)
- Frontend build outputs to `dist/public/`, backend builds to `dist/`
- Development server proxies API calls to backend automatically
- All database tables are prefixed with `schoolpilot_*`
- Authentication tokens are stored in localStorage on the client
- The application supports both username and email login
