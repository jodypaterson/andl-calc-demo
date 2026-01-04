# UOW Specification: ANDL Demo Calculator Application

**Document Version:** 1.0.0  
**Created:** 2026-01-04  
**Status:** Draft  
**UOW Type:** Feature Demonstration  

---

## 1. Executive Summary

This specification defines a complete web application designed to showcase the full capabilities of the ANDL (Agentic-Native Development Lifecycle) framework. The deliverable is a production-quality, hosted web application featuring a modern glassmorphic UI, secure authentication system, user profile management, and an advanced scientific calculator—all built with enterprise-grade best practices.

### 1.1 Purpose

Demonstrate ANDL's ability to:
- Decompose complex requirements into atomic, executable tasks
- Generate production-ready, secure code
- Implement modern UI/UX patterns
- Follow security best practices for authentication
- Produce a fully functional, deployable application

### 1.2 Success Criteria

- [ ] Application is accessible via hosted URL
- [ ] User can log in with credentials: `admin` / `pass`
- [ ] Authentication uses industry-standard security practices
- [ ] UI is visually impressive ("sexy") with modern design patterns
- [ ] Calculator provides advanced scientific functionality
- [ ] Profile management is fully functional
- [ ] All OWASP Top 10 security concerns are addressed

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + TypeScript | Type safety, component architecture, ecosystem |
| **Styling** | Tailwind CSS + Framer Motion | Rapid development, animations, glassmorphism |
| **State** | Zustand | Lightweight, TypeScript-first state management |
| **Backend** | Node.js + Express + TypeScript | Unified language, mature ecosystem |
| **Database** | PostgreSQL 15 | ACID compliance, JSON support, enterprise-ready |
| **ORM** | Prisma | Type-safe queries, migrations, excellent DX |
| **Auth** | Passport.js + JWT + bcrypt | Industry standard, flexible strategies |
| **Hosting** | Docker + Cloud Run / Railway | Container-based, scalable, easy deployment |

### 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (TypeScript)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │   Auth UI   │  │  Dashboard  │  │ Calculator  │               │  │
│  │  │  (Login)    │  │  (Layout)   │  │  (Advanced) │               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  │                           │                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              Zustand State + React Query                     │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API SERVER (Express)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Auth      │  │   User      │  │  Profile    │  │  Calculator │   │
│  │  Middleware │  │  Routes     │  │  Routes     │  │   Routes    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                           │                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM + Validation                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ TCP/IP (Encrypted)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   users     │  │  sessions   │  │  profiles   │  │ calc_history│   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────┐
│        users         │       │       profiles       │
├──────────────────────┤       ├──────────────────────┤
│ id          UUID PK  │───┐   │ id          UUID PK  │
│ email       VARCHAR  │   │   │ user_id     UUID FK  │───┐
│ username    VARCHAR  │   └──▶│ display_name VARCHAR │   │
│ password_hash VARCHAR│       │ bio         TEXT     │   │
│ created_at  TIMESTAMP│       │ avatar_url  VARCHAR  │   │
│ updated_at  TIMESTAMP│       │ created_at  TIMESTAMP│   │
│ last_login  TIMESTAMP│       │ updated_at  TIMESTAMP│   │
│ is_active   BOOLEAN  │       └──────────────────────┘   │
│ failed_attempts INT  │                                   │
│ locked_until TIMESTAMP│                                  │
└──────────────────────┘                                   │
                                                           │
┌──────────────────────┐       ┌──────────────────────┐   │
│      sessions        │       │   calc_history       │   │
├──────────────────────┤       ├──────────────────────┤   │
│ id          UUID PK  │       │ id          UUID PK  │   │
│ user_id     UUID FK  │       │ user_id     UUID FK  │◀──┘
│ token_hash  VARCHAR  │       │ expression  TEXT     │
│ user_agent  VARCHAR  │       │ result      DECIMAL  │
│ ip_address  VARCHAR  │       │ created_at  TIMESTAMP│
│ created_at  TIMESTAMP│       └──────────────────────┘
│ expires_at  TIMESTAMP│
│ revoked     BOOLEAN  │
└──────────────────────┘
```

### 3.2 Prisma Schema Definition

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  username       String    @unique
  passwordHash   String    @map("password_hash")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  lastLogin      DateTime? @map("last_login")
  isActive       Boolean   @default(true) @map("is_active")
  failedAttempts Int       @default(0) @map("failed_attempts")
  lockedUntil    DateTime? @map("locked_until")
  
  profile        Profile?
  sessions       Session[]
  calcHistory    CalcHistory[]
  
  @@map("users")
}

model Profile {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  displayName String?  @map("display_name")
  bio         String?
  avatarUrl   String?  @map("avatar_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("profiles")
}

model Session {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  tokenHash  String   @map("token_hash")
  userAgent  String?  @map("user_agent")
  ipAddress  String?  @map("ip_address")
  createdAt  DateTime @default(now()) @map("created_at")
  expiresAt  DateTime @map("expires_at")
  revoked    Boolean  @default(false)
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model CalcHistory {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  expression String
  result     Decimal
  createdAt  DateTime @default(now()) @map("created_at")
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("calc_history")
  @@index([userId, createdAt(sort: Desc)])
}
```

---

## 4. Authentication System

### 4.1 Security Requirements (OWASP Compliance)

| Requirement | Implementation |
|-------------|----------------|
| **Password Storage** | bcrypt with cost factor 12 (≥10 required) |
| **Password Policy** | Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special |
| **Brute Force Protection** | Account lockout after 5 failed attempts (15 min) |
| **Session Management** | JWT with 15-min access token, 7-day refresh token (httpOnly cookie) |
| **Token Storage** | Access token in memory, refresh token in httpOnly secure cookie |
| **CSRF Protection** | SameSite=Strict cookies + CSRF token for mutations |
| **Rate Limiting** | 100 requests/min per IP, 5 login attempts/min per username |
| **Transport Security** | HTTPS only, HSTS enabled, TLS 1.3 |
| **Input Validation** | Server-side validation with Zod schemas |
| **SQL Injection** | Parameterized queries via Prisma ORM |
| **XSS Prevention** | React's default escaping + CSP headers |

### 4.2 Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │   API   │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  POST /api/auth/login        │                              │
     │  { username, password }      │                              │
     │─────────────────────────────▶│                              │
     │                              │                              │
     │                              │  SELECT user WHERE username  │
     │                              │─────────────────────────────▶│
     │                              │                              │
     │                              │◀─────────────────────────────│
     │                              │  User record                 │
     │                              │                              │
     │                              │  bcrypt.compare(password,    │
     │                              │    user.passwordHash)        │
     │                              │                              │
     │                              │  ✓ Match                     │
     │                              │                              │
     │                              │  Generate JWT access token   │
     │                              │  Generate refresh token      │
     │                              │                              │
     │                              │  INSERT session              │
     │                              │─────────────────────────────▶│
     │                              │                              │
     │  200 OK                      │                              │
     │  { accessToken, user }       │                              │
     │  Set-Cookie: refreshToken    │                              │
     │◀─────────────────────────────│                              │
     │                              │                              │
     │  Store accessToken in memory │                              │
     │                              │                              │
```

### 4.3 JWT Token Structure

```typescript
// Access Token Payload (15 min expiry)
interface AccessTokenPayload {
  sub: string;        // User ID
  username: string;
  email: string;
  iat: number;        // Issued at
  exp: number;        // Expires at
  type: 'access';
}

// Refresh Token Payload (7 day expiry)
interface RefreshTokenPayload {
  sub: string;        // User ID
  sessionId: string;  // Session ID for revocation
  iat: number;
  exp: number;
  type: 'refresh';
}
```

### 4.4 Demo Credentials Seeding

```typescript
// seed.ts - Database seeding script
async function seedAdminUser() {
  const passwordHash = await bcrypt.hash('pass', 12);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      email: 'admin@andl-demo.local',
      username: 'admin',
      passwordHash,
      isActive: true,
      profile: {
        create: {
          displayName: 'Administrator',
          bio: 'ANDL Demo Administrator Account',
        }
      }
    }
  });
}
```

---

## 5. User Interface Specification

### 5.1 Design System

#### 5.1.1 Color Palette

```css
:root {
  /* Primary Gradient */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-dark: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%);
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --glass-blur: blur(16px);
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
}
```

#### 5.1.2 Typography

```css
/* Font Stack */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 5.2 Page Layouts

#### 5.2.1 Login Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                     ╔═══════════════════════════════╗                  │
│   Animated          ║                               ║                  │
│   Gradient          ║      🔮 ANDL Calculator       ║                  │
│   Background        ║                               ║                  │
│   with              ║   ┌─────────────────────┐     ║                  │
│   Floating          ║   │ Username            │     ║                  │
│   Particles         ║   └─────────────────────┘     ║                  │
│                     ║                               ║                  │
│                     ║   ┌─────────────────────┐     ║                  │
│                     ║   │ Password        👁   │     ║                  │
│                     ║   └─────────────────────┘     ║                  │
│                     ║                               ║                  │
│                     ║   ☑ Remember me               ║                  │
│                     ║                               ║                  │
│                     ║   ┌─────────────────────┐     ║                  │
│                     ║   │      Sign In        │     ║   Glassmorphic   │
│                     ║   └─────────────────────┘     ║   Card           │
│                     ║                               ║                  │
│                     ╚═══════════════════════════════╝                  │
│                                                                         │
│                     "Powered by ANDL Framework"                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 5.2.2 Dashboard Layout (Post-Login)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔮 ANDL Demo                                    👤 admin ▾      │   │
│  │                                                 ┌──────────────┐│   │
│  │                                                 │ Edit Profile ││   │
│  │                                                 │ Settings     ││   │
│  │                                                 │ ───────────  ││   │
│  │                                                 │ 🚪 Logout    ││   │
│  │                                                 └──────────────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────┐  ┌───────────────────────────────────────────────┐   │
│  │              │  │                                               │   │
│  │  📊 Dashboard│  │                                               │   │
│  │              │  │              CONTENT AREA                     │   │
│  │  🧮 Calculator│  │                                               │   │
│  │     ←Active  │  │    (Calculator / Dashboard / Profile)        │   │
│  │              │  │                                               │   │
│  │  ⚙️ Settings │  │                                               │   │
│  │              │  │                                               │   │
│  │              │  │                                               │   │
│  │              │  │                                               │   │
│  │              │  │                                               │   │
│  └──────────────┘  └───────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Component Specifications

#### 5.3.1 User Menu Dropdown (Top Right)

**Trigger:** Click on username/avatar in header  
**Position:** Anchored to top-right, dropdown below  
**Animation:** Fade + scale from 0.95 to 1.0 (150ms ease-out)

```typescript
interface UserMenuProps {
  user: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  onEditProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

// Menu Items
const menuItems = [
  { icon: '👤', label: 'Edit Profile', action: 'editProfile' },
  { icon: '⚙️', label: 'Settings', action: 'settings' },
  { divider: true },
  { icon: '🚪', label: 'Logout', action: 'logout', variant: 'danger' },
];
```

#### 5.3.2 Profile Edit Modal

**Trigger:** Click "Edit Profile" from user menu  
**Type:** Modal overlay with glassmorphic card  
**Sections:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Edit Profile                        ✕    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         ┌─────────┐                                             │
│         │  👤     │  ← Click to upload                         │
│         │  Avatar │     (Drag & drop supported)                 │
│         └─────────┘                                             │
│                                                                 │
│   Display Name                                                  │
│   ┌─────────────────────────────────────────────────────┐      │
│   │ Administrator                                        │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   Bio                                                           │
│   ┌─────────────────────────────────────────────────────┐      │
│   │ ANDL Demo Administrator Account                      │      │
│   │                                                      │      │
│   │                                                      │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   ─────────────── Change Password ───────────────              │
│                                                                 │
│   Current Password                                              │
│   ┌─────────────────────────────────────────────────────┐      │
│   │ ••••••••                                        👁   │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│   New Password                                                  │
│   ┌─────────────────────────────────────────────────────┐      │
│   │                                                  👁   │      │
│   └─────────────────────────────────────────────────────┘      │
│   Password strength: ████████░░ Strong                          │
│                                                                 │
│   Confirm New Password                                          │
│   ┌─────────────────────────────────────────────────────┐      │
│   │                                                  👁   │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
│                                ┌────────┐  ┌────────────┐      │
│                                │ Cancel │  │ Save Changes│      │
│                                └────────┘  └────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

**Avatar Upload Requirements:**
- Accepted formats: JPEG, PNG, WebP, GIF
- Max file size: 5MB
- Automatic resize to 256x256
- Stored in object storage (S3-compatible) or base64 in DB for demo
- Drag-and-drop or click-to-upload

#### 5.3.3 Advanced Scientific Calculator

**Location:** Side menu item "Calculator"  
**Features:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Advanced Calculator                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  sin(45) × √(144) + log(1000)                          │   │
│  │                                                    ↵    │   │
│  │                                          = 11.4749...   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Mode: [DEG] [RAD]        Memory: M+ M- MR MC                  │
│                                                                 │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐            │
│  │ sin │ cos │ tan │ log │ ln  │  π  │  e  │  (  │            │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│  │ sin⁻¹│cos⁻¹│tan⁻¹│ 10ˣ │ eˣ  │  √  │  ∛  │  )  │            │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│  │  7  │  8  │  9  │  ÷  │  %  │ x²  │ xⁿ  │  ⌫  │            │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│  │  4  │  5  │  6  │  ×  │ 1/x │ |x| │  !  │  C  │            │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│  │  1  │  2  │  3  │  −  │ mod │ ⌊x⌋ │ ⌈x⌉ │ AC  │            │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │
│  │  0  │  .  │ ±   │  +  │ Ans │     │     │  =  │            │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘            │
│                                                                 │
│  ────────────────── History ──────────────────                 │
│                                                                 │
│  │ sin(45) × √(144) + log(1000) = 11.4749...   │ 📋          │
│  │ 2^10 = 1024                                  │ 📋          │
│  │ factorial(10) = 3628800                      │ 📋          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Calculator Features:**
| Category | Functions |
|----------|-----------|
| **Basic** | +, −, ×, ÷, %, ± |
| **Scientific** | sin, cos, tan, asin, acos, atan |
| **Logarithmic** | log (base 10), ln (natural), 10^x, e^x |
| **Power/Root** | x², xⁿ, √, ∛, 1/x |
| **Constants** | π, e, Ans (last answer) |
| **Other** | factorial (!), abs, floor, ceil, mod |
| **Memory** | M+, M−, MR, MC |
| **Mode** | DEG/RAD toggle for trigonometry |
| **History** | Persistent calculation history (last 50) |

---

## 6. API Specification

### 6.1 Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/logout` | Revoke session | Yes |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| GET | `/api/users/me` | Get current user | Yes |
| PATCH | `/api/users/me` | Update current user | Yes |
| PATCH | `/api/users/me/password` | Change password | Yes |
| POST | `/api/users/me/avatar` | Upload avatar | Yes |
| DELETE | `/api/users/me/avatar` | Remove avatar | Yes |
| GET | `/api/profile` | Get user profile | Yes |
| PATCH | `/api/profile` | Update profile | Yes |
| POST | `/api/calculator/evaluate` | Evaluate expression | Yes |
| GET | `/api/calculator/history` | Get calculation history | Yes |
| DELETE | `/api/calculator/history` | Clear history | Yes |

### 6.2 Request/Response Schemas

#### 6.2.1 Login

```typescript
// POST /api/auth/login
// Request
interface LoginRequest {
  username: string;   // "admin"
  password: string;   // "pass"
  rememberMe?: boolean;
}

// Response (200 OK)
interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
  accessToken: string;  // JWT, 15 min expiry
  expiresIn: number;    // Seconds until expiry
}
// + Set-Cookie: refreshToken (httpOnly, secure, sameSite=strict)

// Response (401 Unauthorized)
interface LoginErrorResponse {
  error: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_DISABLED';
  message: string;
  retryAfter?: number;  // Seconds until unlock (if locked)
}
```

#### 6.2.2 Profile Update

```typescript
// PATCH /api/profile
// Request
interface ProfileUpdateRequest {
  displayName?: string;
  bio?: string;
}

// Response (200 OK)
interface ProfileResponse {
  id: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  updatedAt: string;  // ISO 8601
}
```

#### 6.2.3 Password Change

```typescript
// PATCH /api/users/me/password
// Request
interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response (200 OK)
interface PasswordChangeResponse {
  message: 'Password changed successfully';
  sessionRevoked: boolean;  // true = all other sessions revoked
}

// Response (400 Bad Request)
interface PasswordChangeErrorResponse {
  error: 'INVALID_CURRENT_PASSWORD' | 'PASSWORD_TOO_WEAK' | 'PASSWORDS_MISMATCH';
  message: string;
  requirements?: string[];  // Password requirements not met
}
```

#### 6.2.4 Calculator Evaluate

```typescript
// POST /api/calculator/evaluate
// Request
interface CalculateRequest {
  expression: string;  // e.g., "sin(45) * sqrt(144) + log(1000)"
  mode: 'deg' | 'rad';
}

// Response (200 OK)
interface CalculateResponse {
  expression: string;
  result: string;       // String to preserve precision
  numericResult: number;
  historyId: string;
}

// Response (400 Bad Request)
interface CalculateErrorResponse {
  error: 'INVALID_EXPRESSION' | 'DIVISION_BY_ZERO' | 'OVERFLOW';
  message: string;
  position?: number;  // Character position of error
}
```

---

## 7. Security Hardening

### 7.1 HTTP Security Headers

```typescript
// Security middleware configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",  // For Tailwind
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ].join('; ')
};
```

### 7.2 Rate Limiting Configuration

```typescript
// Rate limiting rules
const rateLimits = {
  // Global API rate limit
  global: {
    windowMs: 60 * 1000,  // 1 minute
    max: 100,              // 100 requests per minute
  },
  
  // Login endpoint (stricter)
  login: {
    windowMs: 60 * 1000,
    max: 5,                // 5 attempts per minute
    skipSuccessfulRequests: true,
  },
  
  // Password change (strictest)
  passwordChange: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 3,                     // 3 attempts per hour
  }
};
```

### 7.3 Input Validation Schemas (Zod)

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid username format'),
  password: z.string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

export const profileUpdateSchema = z.object({
  displayName: z.string()
    .max(100, 'Display name too long')
    .optional()
    .nullable(),
  bio: z.string()
    .max(500, 'Bio too long')
    .optional()
    .nullable(),
});

export const calculatorSchema = z.object({
  expression: z.string()
    .min(1, 'Expression required')
    .max(1000, 'Expression too long'),
  mode: z.enum(['deg', 'rad']).default('deg'),
});
```

---

## 8. Deployment Specification

### 8.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && \
    pnpm prisma generate && \
    pnpm build

# Production
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 8.2 Environment Variables

```bash
# .env.example

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/andl_demo?schema=public

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=<generate-random-64-byte-base64>
JWT_REFRESH_SECRET=<generate-different-random-64-byte-base64>

# Cookie
COOKIE_SECRET=<generate-random-32-byte-base64>
COOKIE_DOMAIN=.yourdomain.com

# File Upload (optional - use DB storage for demo)
UPLOAD_PROVIDER=database  # or 's3'
S3_BUCKET=andl-demo-avatars
S3_REGION=us-east-1
S3_ACCESS_KEY=<aws-access-key>
S3_SECRET_KEY=<aws-secret-key>

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=info
```

### 8.3 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/andl_demo
      - JWT_ACCESS_SECRET=dev-access-secret-change-in-production
      - JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: andl_demo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 9. Project Structure

```
andl-calculator-demo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed admin user
├── src/
│   ├── client/                 # React frontend
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── calculator/
│   │   │   │   ├── Calculator.tsx
│   │   │   │   ├── Display.tsx
│   │   │   │   ├── Keypad.tsx
│   │   │   │   └── History.tsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ProfileModal.tsx
│   │   │   │   ├── AvatarUpload.tsx
│   │   │   │   └── PasswordChange.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCalculator.ts
│   │   │   └── useProfile.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── calculator-engine.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── CalculatorPage.tsx
│   │   ├── store/
│   │   │   └── auth.store.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── server/                 # Express backend
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rate-limit.ts
│   │   │   ├── security.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── profile.routes.ts
│   │   │   └── calculator.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── profile.service.ts
│   │   │   └── calculator.service.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── logger.ts
│   │   ├── db.ts               # Prisma client
│   │   └── server.ts           # Express app entry
│   └── shared/                 # Shared types
│       ├── types.ts
│       └── schemas.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 10. Acceptance Criteria Checklist

### 10.1 Authentication

- [ ] Login page displays with modern glassmorphic design
- [ ] Login with `admin` / `pass` succeeds
- [ ] Invalid credentials show appropriate error
- [ ] Account locks after 5 failed attempts
- [ ] JWT tokens issued correctly (access + refresh)
- [ ] Logout revokes session
- [ ] Refresh token rotation works
- [ ] "Remember me" extends session

### 10.2 User Interface

- [ ] UI uses dark gradient background with glassmorphism
- [ ] Animations are smooth (Framer Motion)
- [ ] Sidebar navigation functional
- [ ] Active menu item highlighted
- [ ] Responsive design (mobile-friendly)
- [ ] Loading states shown during API calls
- [ ] Toast notifications for success/error

### 10.3 User Menu (Top Right)

- [ ] Shows username and avatar (or default icon)
- [ ] Dropdown appears on click with animation
- [ ] "Edit Profile" opens modal
- [ ] "Logout" logs out and redirects

### 10.4 Profile Management

- [ ] Profile modal opens from user menu
- [ ] Avatar upload via click or drag-drop
- [ ] Avatar preview before save
- [ ] Display name editable
- [ ] Bio editable (textarea)
- [ ] Password change with current password verification
- [ ] Password strength indicator
- [ ] Changes persist after save

### 10.5 Calculator

- [ ] Calculator accessible from sidebar
- [ ] All basic operations work (+, −, ×, ÷)
- [ ] Scientific functions work (sin, cos, tan, log, etc.)
- [ ] DEG/RAD mode toggle
- [ ] Memory functions (M+, M−, MR, MC)
- [ ] History shows last 50 calculations
- [ ] History persists across sessions
- [ ] Copy result to clipboard

### 10.6 Security

- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] CSP headers set
- [ ] No sensitive data in logs
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevented (React escaping)

### 10.7 Deployment

- [ ] Docker image builds successfully
- [ ] Database migrations apply
- [ ] Seed script creates admin user
- [ ] Application starts on port 3000
- [ ] Health check endpoint responds
- [ ] Environment variables documented

---

## 11. Atomic Task Decomposition (Preview)

This UOW will be decomposed into the following high-level atomic tasks:

| AT ID | Title | Estimated Effort |
|-------|-------|------------------|
| AT-CALC-001 | Initialize project structure and tooling | 2h |
| AT-CALC-002 | Define Prisma schema and migrations | 1h |
| AT-CALC-003 | Implement authentication service | 4h |
| AT-CALC-004 | Build login page UI | 3h |
| AT-CALC-005 | Create dashboard layout with sidebar | 2h |
| AT-CALC-006 | Implement user menu dropdown | 1h |
| AT-CALC-007 | Build profile edit modal | 3h |
| AT-CALC-008 | Implement avatar upload | 2h |
| AT-CALC-009 | Create password change functionality | 2h |
| AT-CALC-010 | Build calculator UI | 4h |
| AT-CALC-011 | Implement calculator engine | 3h |
| AT-CALC-012 | Add calculation history | 2h |
| AT-CALC-013 | Add security headers and rate limiting | 1h |
| AT-CALC-014 | Create Docker configuration | 1h |
| AT-CALC-015 | Database seeding for demo user | 0.5h |
| AT-CALC-016 | E2E testing | 3h |
| AT-CALC-017 | Deployment and hosting setup | 2h |

**Total Estimated Effort:** ~36 hours

---

## 12. Appendix

### A. Calculator Expression Grammar (EBNF)

```ebnf
expression  = term { ("+" | "-") term } ;
term        = factor { ("*" | "/" | "mod") factor } ;
factor      = base { "^" exponent } ;
base        = unary | function | number | constant | "(" expression ")" ;
unary       = ("-" | "+") base ;
function    = name "(" expression ")" ;
name        = "sin" | "cos" | "tan" | "asin" | "acos" | "atan" 
            | "log" | "ln" | "sqrt" | "cbrt" | "abs" | "floor" | "ceil" 
            | "factorial" ;
constant    = "pi" | "e" | "ans" ;
number      = digit { digit } [ "." { digit } ] ;
digit       = "0" | "1" | ... | "9" ;
```

### B. Keyboard Shortcuts (Calculator)

| Key | Action |
|-----|--------|
| `0-9` | Number input |
| `.` | Decimal point |
| `+` `-` `*` `/` | Operations |
| `Enter` `=` | Evaluate |
| `Escape` | Clear (C) |
| `Backspace` | Delete last |
| `Ctrl+Shift+C` | Clear all (AC) |
| `m` | Toggle memory panel |

### C. Error Messages

| Code | Message |
|------|---------|
| `AUTH_001` | Invalid username or password |
| `AUTH_002` | Account temporarily locked due to too many failed attempts |
| `AUTH_003` | Session expired, please log in again |
| `AUTH_004` | Account is disabled |
| `PROFILE_001` | Display name too long (max 100 characters) |
| `PROFILE_002` | Bio too long (max 500 characters) |
| `PROFILE_003` | Invalid image format (JPEG, PNG, WebP, GIF allowed) |
| `PROFILE_004` | Image too large (max 5MB) |
| `PASSWORD_001` | Current password is incorrect |
| `PASSWORD_002` | Password does not meet requirements |
| `PASSWORD_003` | New passwords do not match |
| `CALC_001` | Invalid expression syntax |
| `CALC_002` | Division by zero |
| `CALC_003` | Result overflow |
| `CALC_004` | Invalid function argument |

---

**Document End**

*This specification serves as the complete blueprint for the ANDL Calculator Demo application. All atomic tasks derived from this UOW shall reference this document as the source of truth.*
