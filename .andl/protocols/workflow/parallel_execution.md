---
id: parallel-execution
name: Parallel Execution Protocol
category: workflow
description: >-
  Guidance for safe parallelization of tool calls. When to use parallel execution
  (independent reads, multi-file context gathering) vs. sequential execution
  (writes, dependent operations). Prevents race conditions and conflicts.
triggerDescription: >-
  FETCH when: Considering multiple independent tool calls in single turn, need
  to gather context from multiple files simultaneously, or coordinating parallel
  work streams. Provides patterns for safe parallelization.
triggerKeywords:
  - parallel
  - multiple tools
  - batch
  - simultaneously
  - at once
  - concurrent
  - gather context
  - read multiple files
version: 1.0.0
autoSuggest: false
estimatedTokens: 350
metadata:
  author: system
  createdAt: "2025-12-18"
  updatedAt: "2026-01-10"
---

# ⚡ PARALLEL EXECUTION PROTOCOL

**Guidance for when to parallelize tool calls vs. serialize them.**

---

## ✅ PARALLELIZE WHEN

All of these conditions are true:

1. **Tools are independent** - Neither depends on the other's output
2. **Combined results needed** - Both results inform a single decision
3. **No state mutation** - Neither tool modifies state the other reads

---

## 📋 Examples - PARALLEL

### 📖 Reading Multiple Files for Comparison

```json
[
  { "tool": "read_file", "args": { "filePath": "src/old-impl.ts" } },
  { "tool": "read_file", "args": { "filePath": "src/new-impl.ts" } }
]
```

### 🔍 Gathering Context from Different Sources

```json
[
  { "tool": "file_search", "args": { "query": "**/*.test.ts" } },
  { "tool": "grep_search", "args": { "query": "describe\\(" } }
]
```

### ⚠️ Checking Errors in Multiple Files

```json
[
  { "tool": "get_errors", "args": { "filePath": "src/a.ts" } },
  { "tool": "get_errors", "args": { "filePath": "src/b.ts" } }
]
```

---

## ❌ SERIALIZE WHEN

Any of these conditions are true:

1. **Data dependency** - Second tool needs first tool's result
2. **State mutation** - First tool changes what second would read
3. **Verification flow** - Read → Edit → Verify pattern

---

## 📋 Examples - SEQUENTIAL

| Sequence                                       | Why Sequential             |
| ---------------------------------------------- | -------------------------- |
| `read_file` → `replace_string` → `read_file`   | Read → Edit → Verify       |
| `file_search` → `read_file(result[0])`         | Dependent on search result |
| `run_tests` → `edit file`                      | Fix based on test result   |
| `run_in_terminal(build)` → `read_file(output)` | Need build output          |

---

## 🚫 NEVER PARALLELIZE

| Operation Type            | Reason                                |
| ------------------------- | ------------------------------------- |
| ✏️ **Edit operations**    | Race conditions, partial updates      |
| 💻 **Terminal commands**  | Output interleaving, state conflicts  |
| 🔗 **Dependent reads**    | Need result to parameterize next call |
| ✅ **Verification flows** | Must observe result before deciding   |

---

## 📊 Decision Flowchart

```text
Considering multiple tool calls?
│
├─ Does Tool B need Tool A's output? → SEQUENTIAL
│
├─ Does Tool A modify state Tool B reads? → SEQUENTIAL
│
├─ Is either an edit/terminal command? → SEQUENTIAL
│
└─ All independent, read-only, context gathering? → PARALLEL ✅
```

---

## 💡 Efficiency Guidelines

| Guideline                        | Benefit                            |
| -------------------------------- | ---------------------------------- |
| 📦 **Batch reads when possible** | 3 parallel reads = 1 turn, not 3   |
| ⚖️ **Don't over-parallelize**    | 5+ parallel calls may be excessive |
| 🛡️ **Prefer quality over speed** | If unsure, serialize is safer      |
