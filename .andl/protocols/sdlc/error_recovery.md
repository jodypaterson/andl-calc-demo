---
id: error-recovery
name: Error Recovery Policy
version: 1.0.0
category: workflow
description: >-
  Handle failures, crashes, or unexpected errors during execution. Covers
  error classification (transient, permanent, logical), severity assessment,
  and structured recovery steps with escalation thresholds.
displayMode: on-demand
criticality: high
parentProtocol: sdlc-master
triggerDescription: >-
  FETCH when: Unhandled exception, crash recovery, unexpected error during
  execution, or need to resume after failure. Provides error classification
  (transient/permanent/logical) and structured recovery steps.
triggerKeywords:
  - error
  - failure
  - crash
  - exception
  - fix
  - recover
  - debug
---

# 🔧 ERROR RECOVERY POLICY

**Handle failures, crashes, or unexpected errors during execution.**

---

## 📊 1. Error Classification

### 1.1 Error Categories

| Category           | Severity | Examples                    | Recovery Path           |
| ------------------ | -------- | --------------------------- | ----------------------- |
| ⚡ **Transient**   | Low      | Network timeout, rate limit | Automatic retry         |
| 🔄 **Recoverable** | Medium   | Test failure, lint error    | Fix and retry           |
| 🚫 **Blocking**    | High     | Build failure, missing dep  | Escalate with diagnosis |
| 🔴 **Critical**    | Severe   | Data corruption, security   | HALT + immediate HITL   |

### 1.2 Error Sources

| Source               | Common Errors                    | First Response              |
| -------------------- | -------------------------------- | --------------------------- |
| 🔨 **Build/Compile** | Type errors, missing imports     | Read error, fix code        |
| 🧪 **Test**          | Assertion failures, timeouts     | Analyze test, fix code/test |
| 📝 **Lint**          | Style violations, complexity     | Auto-fix or manual fix      |
| 💥 **Runtime**       | Exceptions, crashes              | Debug with stack trace      |
| 🌐 **External**      | API failures, timeouts           | Retry with backoff          |
| 📋 **Governance**    | Sync failures, validation errors | Run governance repair       |

---

## 🔄 2. Recovery Procedures

### 2.1 Transient Error Recovery ⚡

**Automatic retry with exponential backoff:**

```text
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Attempt 4: Wait 4 seconds
Attempt 5: Wait 8 seconds
After 5 failures: Escalate as Blocking 🚫
```

**Tool invocation:**

```typescript
governance.error_recovery({
  type: "transient",
  operation: "api_call",
  maxRetries: 5,
  backoffMs: 1000,
});
```

---

### 2.2 Recoverable Error Recovery 🔄

**Fix → Verify → Continue cycle:**

| Step | Action                                                      |
| ---- | ----------------------------------------------------------- |
| 1️⃣   | **Identify error:** Read full error message and stack trace |
| 2️⃣   | **Diagnose cause:** Locate the source of the problem        |
| 3️⃣   | **Apply fix:** Make minimal change to address error         |
| 4️⃣   | **Verify fix:** Run relevant tests/build to confirm         |
| 5️⃣   | **Continue:** Resume normal workflow                        |

**Example for test failure:**

```bash
# 1. Run tests to see failure
pnpm -s test

# 2. Read failure output, identify failing test

# 3. Fix code or test as appropriate

# 4. Re-run specific test
pnpm -s test -- -t "failing test name"

# 5. Run full suite to confirm no regression
pnpm -s test
```

---

### 2.3 Blocking Error Recovery 🚫

**Diagnose → Document → Escalate:**

**Step 1: Gather diagnostics**

- Full error message and stack trace
- Environment state (node version, OS, deps)
- Steps to reproduce
- What changed recently

**Step 2: Document finding**

```markdown
## Error Diagnosis

**Error:** [Error message]
**Location:** [File:line or command]
**Reproduction:** [Steps to reproduce]

**Diagnostics:**

- Node version: [version]
- Recent changes: [list]
- Related files: [files]

**Attempted fixes:**

- [Fix 1]: [Result]
- [Fix 2]: [Result]
```

**Step 3: Escalate per DEV_ESCALATION_PROTOCOL**

---

### 2.4 Critical Error Recovery 🔴

**HALT → Secure → Escalate:**

| Step                    | Action                                            |
| ----------------------- | ------------------------------------------------- |
| 🛑 **HALT immediately** | Stop all work, do not proceed                     |
| 🔒 **Secure state**     | Don't commit corrupted data, preserve error state |
| 🚨 **Escalate to HITL** | Use critical error template                       |

**Critical escalation template:**

```markdown
## 🔴 CRITICAL ERROR - HALTED

**Error Type:** [Data corruption|Security|etc.]
**Impact:** [What is affected]
**Current State:** [HALTED - awaiting guidance]

**DO NOT PROCEED without human confirmation.**
```

---

## 🔨 3. Error-Specific Procedures

### 3.1 Build Errors

| Error Type             | Recovery                     |
| ---------------------- | ---------------------------- |
| 📦 Missing import      | Add import statement         |
| 🔴 Type error          | Fix type mismatch            |
| 🔗 Circular dependency | Refactor dependency chain    |
| 📝 Syntax error        | Fix syntax at indicated line |

**Commands:**

```bash
# Check TypeScript errors
pnpm -s typecheck

# Build with verbose output
pnpm -s build 2>&1 | head -50
```

---

### 3.2 Test Errors

| Error Type           | Recovery                            |
| -------------------- | ----------------------------------- |
| ❌ Assertion failure | Fix code or update test expectation |
| ⏱️ Timeout           | Increase timeout or optimize test   |
| 📦 Setup failure     | Check test dependencies/mocks       |
| 🔀 Flaky test        | Add stability fixes                 |

**Commands:**

```bash
# Run single test with verbose
pnpm -s test -- -t "test name" --verbose

# Run with debugging
DEBUG=* pnpm -s test
```

---

### 3.3 Lint Errors

| Error Type         | Recovery                            |
| ------------------ | ----------------------------------- |
| 📝 Style violation | Auto-fix or manual fix              |
| 📊 Complexity      | Refactor to reduce complexity       |
| ⚠️ Unused code     | Remove or add ignore if intentional |

**Commands:**

```bash
# Auto-fix what's possible
pnpm -s lint --fix

# Check specific file
pnpm -s lint src/file.ts
```

---

### 3.4 Governance Errors

| Error Type            | Recovery                    |
| --------------------- | --------------------------- |
| 🔗 STATE-SYNC failure | Run governance repair       |
| 📊 Size violation     | Archive or compress content |
| 📋 Missing artifact   | Create required artifact    |

**Commands:**

```bash
# Check governance status
npm run governance:status

# Repair common issues
npm run governance:repair

# Full optimization
npm run governance:optimize
```

---

## 📊 4. Error Documentation

### 4.1 Error Report Format

```markdown
## Error Report

**Error ID:** ERR-YYYYMMDD-NN
**Category:** [Transient|Recoverable|Blocking|Critical]
**Occurred:** [Timestamp]

### Error Details

**Message:** [Full error message]
**Stack Trace:** [If available]
**Context:** [What operation was being performed]

### Recovery Actions

1. [Action taken]
2. [Result]

### Resolution

**Status:** [Resolved|Escalated|Ongoing]
**Fix Applied:** [Description of fix]
**Prevention:** [How to prevent recurrence]
```

---

## 🚫 5. Anti-Patterns

| ❌ Anti-Pattern                 | ✅ Correct Behavior           |
| ------------------------------- | ----------------------------- |
| Ignoring errors                 | Always investigate            |
| Infinite retry loops            | Bounded retries with backoff  |
| Proceeding after critical error | HALT immediately              |
| Not documenting fixes           | Record what worked            |
| Guessing at fixes               | Diagnose root cause first     |
| Silent failures                 | Surface and report all errors |

---

## 💡 6. Best Practices

| Practice                       | Benefit                     |
| ------------------------------ | --------------------------- |
| 📖 **Read full error message** | Often contains the solution |
| 🔍 **Check recent changes**    | Usually the cause           |
| 🎯 **Minimal fix**             | Don't fix unrelated things  |
| ✅ **Verify after fix**        | Ensure actually resolved    |
| 📝 **Document what worked**    | Helps future occurrences    |
| ⏱️ **Time-box debugging**      | Escalate if >2 hours        |
