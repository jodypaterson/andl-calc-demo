---
id: response-size-management
name: Response Size Management
category: workflow
description: >-
  CRITICAL policy for preventing "Response too long" errors. Core rule: ONE ACTION
  PER ITERATION. Provides size guidelines for file creation (~200 lines), edits
  (~100 lines), terminal output (~50 lines). Essential for reliable execution.
triggerDescription: >-
  ALWAYS ACTIVE. CRITICAL: Prevents "Response too long" errors. ONE ACTION PER
  ITERATION. File creation ~200 lines max, edits ~100 lines, terminal output
  ~50 lines. Split large work into multiple iterations.
triggerKeywords:
  - response
  - size
  - long
  - chunking
  - iteration
  - multiple
  - files
version: 1.0.0
displayMode: full
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 🚨 RESPONSE SIZE MANAGEMENT (CRITICAL)

**This policy prevents 'Response too long' errors. Applies to ALL actions.**

---

## ⛔ CORE RULE: ONE ACTION PER ITERATION

For ANY multi-step task, you MUST:

1. **Execute ONE action** per iteration
2. **Wait for observation** (success/failure)
3. **Then proceed** to the next action in a NEW iteration

---

## ❌ FORBIDDEN: Multiple Actions

```text
❌ BAD:
Action: { "tool": "create_file", ... }  // File 1
Action: { "tool": "create_file", ... }  // File 2
Action: { "tool": "create_file", ... }  // File 3
```

## ✅ CORRECT: One File Per Iteration

```text
✅ GOOD:
Iteration 1: Create file 1 → Observation →
Iteration 2: Create file 2 → Observation →
Iteration 3: Create file 3 → Observation
```

---

## 📊 Size Guidelines

| Content Type        | Max Per Response | Strategy                    |
| ------------------- | ---------------- | --------------------------- |
| 📄 New file content | ~200 lines       | Split into skeleton + fills |
| ✏️ Edit content     | ~100 lines       | Multiple smaller edits      |
| 💻 Terminal output  | ~50 lines        | Use `head`/`tail`/`grep`    |
| 📖 File reads       | ~150 lines       | Use line ranges             |
| 📝 Total response   | ~500 lines       | Multiple iterations         |

---

## ❓ Why This Matters

### 1️⃣ VS Code LM API Has Response Limits

- Exceeding limits = immediate failure
- Large responses get truncated or rejected

### 2️⃣ UI Updates Per Iteration

- User sees progress after each action
- Better user experience

### 3️⃣ Error Recovery

- If one action fails, previous work is saved
- Easier to retry single actions

### 4️⃣ Context Preservation

- Smaller responses = more context for next iteration
- Better decision making

---

## 💡 The Golden Rule

**Small responses, many iterations > Large response that fails**

---

## ✅ Size Checklist

Before responding, verify:

- [ ] Only ONE action in this iteration
- [ ] File content under ~200 lines
- [ ] Edit changes under ~100 lines
- [ ] Terminal output filtered/limited
- [ ] Total response under ~500 lines
