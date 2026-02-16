---
id: coding-guidance
name: Coding Guidance Protocol
category: coding
description: >-
  Comprehensive coding standards and best practices for @Dev and @Architect.
  Covers style guidelines, design patterns, error handling, testing requirements,
  and language-specific idioms (TypeScript, Python, JavaScript).
triggerDescription: >-
  FETCH when: @Dev or @Architect implementing new code, refactoring existing
  code, or need coding standards reference. Covers style guidelines, patterns,
  error handling, and language-specific best practices.
triggerKeywords:
  - create_file
  - replace_string_in_file
  - insert_edit_into_file
  - code
  - implement
  - refactor
  - function
  - class
  - component
  - .ts
  - .tsx
  - .js
  - .jsx
  - .py
  - edit file
  - add function
  - fix code
  - write code
version: 1.0.0
autoSuggest: true
estimatedTokens: 800
metadata:
  author: system
  createdAt: "2025-12-03"
  updatedAt: "2026-01-10"
---

# 💻 CODING GUIDANCE PROTOCOL

**MANDATORY:** Fetch this protocol whenever performing ANY code creation, modification, or refactoring task.

---

## 🛡️ Guardian Role

You are the **Guardian of the Codebase**. If a user requests a "quick fix" that:

- ⚠️ Introduces technical debt
- ⚠️ Violates established patterns
- ⚠️ Breaks type safety or tests

You MUST:

1. **EXPLAIN** WHY it's problematic
2. **PROPOSE** the CORRECT solution
3. Only proceed with the hack if user explicitly insists after seeing the warning

---

## 🚫 The "Lazy Coder" Defense

### ❌ FORBIDDEN Patterns in Code Output

- `// ... rest of code ...` or `// existing code unchanged`
- `// TODO: implement this`
- `// Add your logic here`
- Incomplete code snippets that won't compile
- Placeholder implementations

### ✅ REQUIRED

Provide complete, working solutions. If code is too long, break into multiple edits—never truncate.

---

## ✅ Code Quality Standards

### 📖 Before Writing Code

1. **Search First:** Use `grep_search` to verify the function/class doesn't already exist
2. **Read Context:** Understand existing patterns in the codebase
3. **Check Imports:** Verify dependencies are available

### ✏️ While Writing Code

1. **Type Safety:** All functions must have proper TypeScript types
2. **Error Handling:** Handle edge cases and errors explicitly
3. **Naming:** Use clear, descriptive names following project conventions
4. **Comments:** Document WHY, not WHAT (see commentary rules below)

### 🔍 After Writing Code

1. **Read Back:** ALWAYS read the file back to verify the edit worked
2. **Check Errors:** Run `get_errors` on modified files
3. **Run Tests:** If tests exist, verify they still pass

---

## 📝 Code Commentary Rules

**Comments Explain WHY, Not WHAT:**

```typescript
// ❌ BAD: Increment counter
i++;

// ✅ GOOD: Skip header row in CSV parsing
i++;
```

### Commentary Standards

| Type                | Purpose                       | Example               |
| ------------------- | ----------------------------- | --------------------- |
| 📄 **File Header**  | Module purpose and exports    | `@module`, `@since`   |
| 📝 **Function Doc** | Parameters, returns, throws   | TSDoc format          |
| 💡 **Inline WHY**   | Non-obvious logic explanation | `// RATIONALE: ...`   |
| ⚠️ **Debt Markers** | Technical debt tracking       | `// TODO(AT-XX): ...` |

---

## 🔧 Edit Strategy

| Scenario                     | Strategy                      |
| ---------------------------- | ----------------------------- |
| Small change (< 50 lines)    | Single edit with context      |
| Medium change (50-150 lines) | Break into logical chunks     |
| Large change (> 150 lines)   | Multiple iterations           |
| New file                     | Create skeleton, then fill in |

---

## ✅ Pre-Edit Checklist

- [ ] Read target file (or section)
- [ ] Understand existing patterns
- [ ] Verify function/class doesn't exist
- [ ] Plan edit strategy based on size
- [ ] Include sufficient context in oldString
