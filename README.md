# ANDL Demo - CI/CD Pipeline & Advanced Calculator

A minimal Node.js project used for ANDL PE demonstrations.

## Purpose

This repository serves as the **target project** for demonstrating ANDL's
autonomous SDLC capabilities. During the demo, ANDL will read `SPEC.md`
and generate a complete CI/CD pipeline. Or compiing an advanced calculator.

## Current State

This is the "seed" state - a basic Node.js project with no CI/CD configuration.

```
├── package.json      # Project manifest
├── tsconfig.json     # TypeScript config
├── SPEC.md           # Design specification (demo input)
├── src/
│   └── index.ts      # Simple entry point
└── tests/
    └── index.test.ts # Basic test
```

## After ANDL Execution

After running the design spec through ANDL, this repo will contain:

```
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # Main CI workflow
│   └── actions/
│       └── coverage-check/
│           ├── action.yml            # Reusable action
│           └── check.sh              # Coverage script
├── docs/
│   ├── CI_SETUP.md                   # Usage documentation
│   └── CONTRIBUTING.md               # Contribution guide
└── ... (existing files)
```

## Running Locally

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Database Setup

### Prerequisites

- PostgreSQL 14+ running locally or via Docker
- Environment variable `DATABASE_URL` configured in `.env`

### Quick Start

1. **Start PostgreSQL** (if using Docker):
```bash
docker run --name andl-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

2. **Configure environment** (create `.env` file):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/andl_demo?schema=public"
```

3. **Install dependencies** (including ts-node for seed script):
```bash
pnpm install
```

4. **Apply database migration**:
```bash
pnpm prisma migrate deploy
```

This creates the database schema with tables:
- `User` - User accounts with authentication
- `Profile` - User profile information  
- `Session` - Active user sessions
- `CalcHistory` - Calculation history records

5. **Seed the database with sample data**:
```bash
pnpm prisma db seed
```

This populates the database with:
- 3 demo users (alice, bob, charlie)
- User profiles
- Sample calculation history (5 entries)

6. **Verify setup**:
```bash
# Check migration status
pnpm prisma migrate status

# Open database browser UI
pnpm prisma studio
```

### Database Schema

See `prisma/schema.prisma` for complete data model.

**Key features:**
- User authentication with password hashing
- Account lockout after failed login attempts
- Calculation history with mode tracking (DEG/RAD)
- Profile customization (display name, bio, avatar)
- Session management

### Seed Script

The seed script (`prisma/seed.ts`) is **idempotent** - safe to run multiple times. It:
1. Clears existing data (calcHistory, session, profile, user)
2. Creates 3 demo users with profiles
3. Populates sample calculation history
4. Reports statistics

**Demo users:**
- `alice@example.com` - 3 calculation history entries (basic arithmetic, trigonometry in DEG mode)
- `bob@example.com` - 2 calculation history entries (pi calculations in RAD mode)  
- `charlie@example.com` - No calculation history (new user scenario)

**Note:** In production, use proper password hashing (bcrypt) instead of placeholder hashes in seed data.

## License

MIT
