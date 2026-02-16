# Testing Plan: ANDL Demo Calculator Application

**Project:** andl-demo-cicd  
**Version:** 0.1.0-alpha.3  
**Created:** 2026-02-01  
**Owner:** QA Team  

---

## 1. Testing Architecture

### 1.1 Framework Selection

| Framework | Purpose | Rationale |
|-----------|---------|----------|
| **Vitest** | Unit & Integration Tests | Fast, Vite-native, TypeScript-first, modern API |
| **Playwright** | E2E Tests | Cross-browser support, reliable selectors, excellent debugging |
| **@faker-js/faker** | Test Data Generation | Rich data generation library for realistic test fixtures |
| **@vitest/coverage-v8** | Code Coverage | Built-in V8 coverage with 80% threshold enforcement |

### 1.2 Directory Structure

```
tests/
├── fixtures/                  # Centralized test data factories
│   ├── index.ts              # Barrel file for all fixtures
│   ├── user.fixtures.ts      # User creation factories
│   ├── auth.fixtures.ts      # Authentication/session mocks
│   ├── calculator.fixtures.ts # Expression test data
│   └── mocks/
│       └── api.mock.ts       # API response mocks
├── unit/                     # Unit tests (isolated functions)
├── integration/              # Integration tests (cross-component)
└── e2e/                      # End-to-end tests (full user flows)
```

### 1.3 Test Pyramid Strategy

```
        /\
       /  \     E2E Tests (few, slow, high confidence)
      /----\
     /      \   Integration Tests (medium count)
    /--------\
   /          \ Unit Tests (many, fast, isolated)
  /------------\
```

**Coverage Targets:**
- **Unit Tests:** 85% (primary safety net)
- **Integration Tests:** 70% (component interactions)
- **E2E Tests:** Critical user paths 100%
- **Overall:** 80% minimum (enforced in vitest.config.ts)

---

## 2. Test Data Strategy

### 2.1 Fixture Factories

All test data is generated via factory functions using `@faker-js/faker` for consistency and randomness.

**User Fixtures (`tests/fixtures/user.fixtures.ts`):**
```typescript
createValidUser(overrides?: Partial<User>): User
createAdminUser(overrides?: Partial<User>): User
```

**Auth Fixtures (`tests/fixtures/auth.fixtures.ts`):**
```typescript
createMockSession(overrides?: Partial<Session>): Session
createExpiredToken(): string
createValidJWT(): string
```

**Calculator Fixtures (`tests/fixtures/calculator.fixtures.ts`):**
```typescript
validExpressions: Array<{input: string, expected: number}>
invalidExpressions: Array<{input: string, error: string}>
edgeCaseExpressions: Array<{input: string, expected: number|special}>
```

**API Mocks (`tests/fixtures/mocks/api.mock.ts`):**
```typescript
mockAuthResponse(success: boolean): {status, data}
mockCalculatorResponse(result: number): {status, data}
```

### 2.2 Test Data Principles

| Principle | Implementation |
|-----------|---------------|
| **Predictable** | Fixtures return consistent structure |
| **Flexible** | Override mechanism for edge cases |
| **Isolated** | Each test gets fresh data |
| **Realistic** | faker.js generates real-looking data |
| **Reusable** | Centralized in fixtures/ directory |

### 2.3 Mock Strategy

- **API Responses:** Mock HTTP responses for auth, calculator endpoints
- **External Services:** Mock third-party integrations (future)
- **Time/Date:** Use fixed timestamps for deterministic tests
- **Random Values:** Seed faker.js for reproducible randomness (if needed)

---

## 3. ATP Coverage Matrix

This section maps all 41 ATPs from the UOW to their test locations and coverage requirements.

### 3.1 Phase 0: Project Setup (§01)

| ATP ID | Title | Test Location | Coverage |
|--------|-------|--------------|----------|
| ATP-5 | Initialize Project Structure | N/A (infrastructure) | Build validation only |
| **ATP-6** | **Create QA Infrastructure** | **tests/unit/sample.test.ts** | **Fixture validation** |

### 3.2 Phase 1: Authentication (§04)

| ATP ID | Title | Test Location | Coverage Target |
|--------|-------|--------------|----------------|
| AT-04.01 | JWT Generation & Validation | tests/unit/auth/jwt.test.ts | 95% (security critical) |
| AT-04.02 | Password Hashing Service | tests/unit/auth/password.test.ts | 95% (security critical) |
| AT-04.03 | Authentication Middleware | tests/integration/auth/middleware.test.ts | 90% |
| AT-04.04 | Auth State Management | tests/unit/auth/state.test.ts | 85% |

**Fixtures Used:** `createValidUser`, `createMockSession`, `createValidJWT`

### 3.3 Phase 1: Calculator Engine (§06)

| ATP ID | Title | Test Location | Coverage Target |
|--------|-------|--------------|----------------|
| AT-06.01 | Expression Parser | tests/unit/calculator/parser.test.ts | 95% (core logic) |
| AT-06.02 | Math Functions Library | tests/unit/calculator/functions.test.ts | 95% |
| AT-06.03 | Calculator API Endpoint | tests/integration/calculator/api.test.ts | 90% |

**Fixtures Used:** `validExpressions`, `invalidExpressions`, `edgeCaseExpressions`

### 3.4 Phase 2: API Endpoints (§08)

| ATP ID | Title | Test Location | Coverage Target |
|--------|-------|--------------|----------------|
| AT-08.01 | User API Endpoints | tests/integration/api/user.test.ts | 90% |
| AT-08.02 | History API Endpoints | tests/integration/api/history.test.ts | 85% |
| AT-08.03 | Error Handling Middleware | tests/integration/api/errors.test.ts | 95% |

**Fixtures Used:** `createValidUser`, `mockAuthResponse`, `mockCalculatorResponse`

### 3.5 Phase 2: UI Components (§10)

| ATP ID | Title | Test Location | Coverage Target |
|--------|-------|--------------|----------------|
| AT-10.01 | Calculator Display | tests/unit/ui/Display.test.tsx | 85% |
| AT-10.02 | Button Grid | tests/unit/ui/ButtonGrid.test.tsx | 90% |
| AT-10.03 | History Panel | tests/unit/ui/History.test.tsx | 85% |
| AT-10.04 | App Layout | tests/integration/ui/App.test.tsx | 80% |

**Fixtures Used:** `validExpressions`, `createValidUser`

### 3.6 Phase 3: Testing & Documentation (§12)

| ATP ID | Title | Test Location | Coverage Target |
|--------|-------|--------------|----------------|
| AT-12.01 | Unit Test Suite | tests/unit/**/*.test.ts | 85% overall |
| AT-12.02 | Integration Test Suite | tests/integration/**/*.test.ts | 70% overall |
| AT-12.03 | Component Test Coverage | tests/unit/ui/**/*.test.tsx | 80% components |
| AT-12.04 | E2E Test Suite | tests/e2e/**/*.spec.ts | 100% critical paths |

**Note:** AT-12.04 will implement full Playwright E2E tests using `playwright.config.ts`

### 3.7 Summary: Test File Organization

```
tests/
├── unit/
│   ├── auth/
│   │   ├── jwt.test.ts           (AT-04.01)
│   │   ├── password.test.ts      (AT-04.02)
│   │   └── state.test.ts         (AT-04.04)
│   ├── calculator/
│   │   ├── parser.test.ts        (AT-06.01)
│   │   └── functions.test.ts     (AT-06.02)
│   └── ui/
│       ├── Display.test.tsx      (AT-10.01)
│       ├── ButtonGrid.test.tsx   (AT-10.02)
│       └── History.test.tsx      (AT-10.03)
├── integration/
│   ├── auth/
│   │   └── middleware.test.ts    (AT-04.03)
│   ├── calculator/
│   │   └── api.test.ts           (AT-06.03)
│   ├── api/
│   │   ├── user.test.ts          (AT-08.01)
│   │   ├── history.test.ts       (AT-08.02)
│   │   └── errors.test.ts        (AT-08.03)
│   └── ui/
│       └── App.test.tsx          (AT-10.04)
└── e2e/
    ├── auth-flow.spec.ts         (AT-12.04)
    ├── calculator-flow.spec.ts   (AT-12.04)
    └── history-flow.spec.ts      (AT-12.04)
```

---

## 4. CI/CD Integration

### 4.1 GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main`

**Steps:**
1. Checkout code
2. Setup Node.js 20.x
3. Setup pnpm
4. Install dependencies (`pnpm install --frozen-lockfile`)
5. Run linter (`pnpm lint`)
6. Run tests with coverage (`pnpm test:coverage`)
7. Upload coverage to Codecov

### 4.2 Quality Gates

| Gate | Threshold | Action on Fail |
|------|-----------|----------------|
| **Build** | Must succeed | Block PR merge |
| **Lint** | Zero errors | Block PR merge |
| **Unit Tests** | 100% pass | Block PR merge |
| **Coverage (Overall)** | ≥80% | Block PR merge |
| **Coverage (Critical)** | ≥95% | Block PR merge (auth, calculator) |
| **E2E Tests** | 100% pass | Block PR merge (when implemented) |

### 4.3 Local Development Commands

| Command | Purpose |
|---------|--------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm lint` | Check code style |
| `pnpm build` | Verify TypeScript compilation |

### 4.4 Coverage Reports

**Generated Artifacts:**
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - Machine-readable format for CI
- Terminal output - Quick pass/fail summary

**Viewing Coverage:**
```bash
pnpm test:coverage
open coverage/index.html  # macOS
```

---

## 5. Quality Gates

### 5.1 Pre-Commit Gates

| Check | Tool | Enforcement |
|-------|------|------------|
| TypeScript compilation | `tsc -b` | Local + CI |
| ESLint rules | `eslint .` | Local + CI |
| Prettier formatting | Auto-format on save | IDE |

### 5.2 Pre-Merge Gates (Pull Request)

| Check | Threshold | Blocker? |
|-------|-----------|----------|
| All tests pass | 100% | ✅ YES |
| Coverage overall | ≥80% | ✅ YES |
| Coverage critical paths | ≥95% | ✅ YES |
| Lint errors | 0 | ✅ YES |
| Build success | Pass | ✅ YES |
| E2E tests (when impl) | 100% pass | ✅ YES |

### 5.3 ATP-Specific Coverage Requirements

**Security-Critical ATPs (95% minimum):**
- AT-04.01: JWT Generation & Validation
- AT-04.02: Password Hashing Service
- AT-04.03: Authentication Middleware

**Core Logic ATPs (95% minimum):**
- AT-06.01: Expression Parser
- AT-06.02: Math Functions Library

**Integration ATPs (90% minimum):**
- AT-06.03: Calculator API Endpoint
- AT-08.03: Error Handling Middleware

**UI Component ATPs (80-90%):**
- AT-10.01: Calculator Display (85%)
- AT-10.02: Button Grid (90%)
- AT-10.03: History Panel (85%)
- AT-10.04: App Layout (80%)

### 5.4 Test Maintenance Standards

| Standard | Requirement |
|----------|------------|
| **Test Naming** | `describe('ComponentName', () => it('should X when Y'))` |
| **Fixture Usage** | Always use fixtures, never hardcoded data |
| **Test Isolation** | Each test runs independently, no shared state |
| **Flaky Tests** | Zero tolerance - fix or quarantine immediately |
| **Test Speed** | Unit tests <100ms each, integration <500ms |
| **Documentation** | Complex test logic must have inline comments |

### 5.5 Regression Testing Policy

Every bug fix MUST include:
1. **Reproduction test** - Fails before fix
2. **Fix implementation** - Makes test pass
3. **Regression suite** - Test added to permanent suite

---

## Appendices

### A. Testing Best Practices

- **AAA Pattern:** Arrange → Act → Assert
- **One assertion focus per test** (multiple assertions OK if testing same concept)
- **Descriptive test names** that explain WHAT and WHY
- **Fast tests** - mock external dependencies
- **Deterministic tests** - no flaky behavior
- **Clean test data** - use fixtures, not magic values

### B. Common Test Patterns

**Testing async operations:**
```typescript
it('should fetch user data', async () => {
  const user = await fetchUser('123');
  expect(user.id).toBe('123');
});
```

**Testing error conditions:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse('')).toThrow('Empty expression');
});
```

**Testing React components:**
```typescript
it('should render calculator display', () => {
  render(<Display value="123" />);
  expect(screen.getByText('123')).toBeInTheDocument();
});
```

### C. Reference Links

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Coverage V8 Provider](https://vitest.dev/guide/coverage)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-01  
**Next Review:** After Phase 1 completion (AT-04.04, AT-06.03)
