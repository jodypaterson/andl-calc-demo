---
id: failure-recovery
name: Failure Recovery Protocol
category: safety
description: >-
  Structured recovery from tool call failures and errors. Covers error
  classification (transient, permanent, logical), diagnosis steps, recovery
  strategies, and step-back patterns for getting unstuck.
triggerDescription: >-
  FETCH when: Tool call returns error, 3+ consecutive failures, ENOENT/FileNotFound,
  StringNotFound in edit, or step-back recovery needed. Provides structured
  recovery: diagnose → classify → recover → verify.
triggerKeywords:
  - error
  - failed
  - retry
  - stuck
  - not found
  - cannot
  - blocked
  - ENOENT
  - FileNotFound
  - StringNotFound
version: 1.0.0
autoSuggest: true
estimatedTokens: 900
metadata:
  author: system
  createdAt: "2025-12-02"
  updatedAt: "2026-01-10"
---

# 🔄 FAILURE RECOVERY PROTOCOL

**This protocol defines HOW TO RECOVER when things go wrong.**

---

## 🔁 The Double-Fault Rule (Step-Back Recovery)

**Trigger:** You have attempted the SAME logical step 2 times and failed both times.

### Examples of "Same Logical Step"

- Two failed attempts to read a file (different paths count as same step)
- Two failed tool calls trying to accomplish the same goal
- Two test runs that both failed for related reasons

### ⛔ Action: STOP. Do NOT attempt a 3rd time.

### 🔄 Recovery Protocol

1. **Acknowledge:** State clearly: "Two attempts failed. Triggering Step-Back Recovery."
2. **Zoom Out:** Re-read the User's ORIGINAL objective (not your interpreted sub-goal)
3. **Re-strategize:** Propose a FUNDAMENTALLY DIFFERENT approach
4. **Document:** Note what was tried and why it failed before proceeding

---

## 📋 Step-Back Examples

### ❌ WRONG (3rd attempt at same approach)

```text
Attempt 1: read_file('src/auth.ts') → File not found
Attempt 2: read_file('src/Auth.ts') → File not found
Attempt 3: read_file('src/AUTH.ts') → STOP! This is looping.
```

### ✅ CORRECT (Step-Back after 2 failures)

```text
Attempt 1: read_file('src/auth.ts') → File not found
Attempt 2: read_file('src/Auth.ts') → File not found
Step-Back: "Two read attempts failed. Let me search for auth-related files instead."
New Approach: file_search('**/auth*') → Found src/authentication/index.ts
```

---

## ⚠️ Smart Error Diagnosis

**When a tool returns an error, follow this diagnosis protocol:**

### 📄 Error: `FileNotFound` / `ENOENT`

| Don't                     | Do                                                          |
| ------------------------- | ----------------------------------------------------------- |
| ❌ Guess a different path | ✅ Use `file_search` or `list_dir` to discover actual paths |

### ✏️ Error: `StringNotFound` (during replace)

| Don't                                  | Do                                                  |
| -------------------------------------- | --------------------------------------------------- |
| ❌ Retry with slightly modified string | ✅ Read the file FRESH to get exact current content |

### 🔧 Error: `UNKNOWN_TOOL`

| Don't                     | Do                                        |
| ------------------------- | ----------------------------------------- |
| ❌ Try similar tool names | ✅ Check available tools and capabilities |

### 💻 Error: Syntax/Compiler Error (after edit)

| Don't                              | Do                                                                |
| ---------------------------------- | ----------------------------------------------------------------- |
| ❌ Say "I will fix it" and move on | ✅ Treat the fix as a NEW sub-task. Current task is NOT complete. |

### 🧪 Error: Test Failure

| Don't                                             | Do                                                      |
| ------------------------------------------------- | ------------------------------------------------------- |
| ❌ Mark task complete with "tests need attention" | ✅ Analyze failure output, fix root cause, re-run tests |

---

## 🚨 Unrecoverable Situations

**Mark task as `blocked` and report to user if:**

- 🔒 Permission denied (cannot be resolved without user action)
- 🌐 External service unavailable (API down, rate limited)
- ⚡ Conflicting requirements discovered
- 🔄 Step-Back recovery attempted but new approach also failed

---

## 📝 Blocked Report Format

```markdown
## ⏸️ BLOCKED: [Task title]

**Reason:** [Specific error or conflict]
**Attempted:** [What approaches were tried]
**Needed:** [What user action or information would unblock]
```
