---
id: indexer-patterns
name: Indexer Patterns Protocol
category: coding
description: >-
  Patterns for using ANDL indexer tools effectively. Covers refactoring with
  call graph analysis, impact assessment, finding callers/callees, tracing
  dependencies, and assessing blast radius of code changes.
triggerDescription: >-
  FETCH when: @Dev using ANDL indexer tools for refactoring, impact analysis,
  call graph exploration, tracing dependencies, finding callers/callees, or
  assessing blast radius of changes. Indexer-specific patterns.
triggerKeywords:
  - indexer
  - refactor
  - refactoring
  - impact analysis
  - blast radius
  - call graph
  - callers
  - callees
  - who calls
  - what calls
  - used by
  - uses
  - dependencies
  - dependents
  - ripple effect
  - safe to change
  - breaking change
  - rename function
  - rename method
  - move function
  - extract method
  - change signature
version: 1.0.0
autoSuggest: true
estimatedTokens: 700
metadata:
  author: system
  createdAt: "2025-12-18"
  updatedAt: "2026-01-10"
---

# 🔍 INDEXER PATTERNS PROTOCOL

**MANDATORY:** Fetch this protocol when planning refactoring, analyzing impact of changes, or exploring function relationships.

---

## 🎯 When to Use Indexer Tools

### ✅ Use Indexer Tools FOR

- Finding all callers of a function you're about to modify
- Understanding the dependency graph of a module
- Assessing the "blast radius" of a signature change
- Tracing the call path between two functions
- Identifying code smells or technical debt programmatically
- Safe refactoring with full caller awareness

### 📁 Use Regular Tools FOR

- Searching literal strings in code/comments → `grep_search`
- Finding files by path pattern → `file_search`
- Reading file content → `read_file`
- Making edits → `replace_string_in_file`

---

## 🔧 Tool Selection Matrix

| Goal                             | Tool                         | Example                          |
| -------------------------------- | ---------------------------- | -------------------------------- |
| 📞 Find who calls `parseConfig`  | `graph.callers`              | Before modifying parseConfig     |
| 📤 Find what `parseConfig` calls | `graph.callees`              | Understanding dependencies       |
| 🔗 Path from A to B              | `graph.path`                 | Why does auth trigger logging?   |
| 📥 All imports of a file         | `indexer.graph_dependents`   | Who will break if I change this? |
| 📦 All files this imports        | `indexer.graph_dependencies` | What does this module need?      |
| 💥 Change impact                 | `analysis.impact`            | Is it safe to rename this?       |

---

## 🔄 Safe Refactoring Workflow

### Step 1️⃣: Impact Assessment

```text
1. analysis.impact({functionName: "targetFunction", changeType: "signature"})
   → Understand blast radius
2. If high impact: Pause and verify user wants to proceed
```

### Step 2️⃣: Find All Call Sites

```text
1. graph.callers({functionName: "targetFunction"})
   → Get complete list of callers
2. For each caller: Plan migration
```

### Step 3️⃣: Execute and Verify

```text
1. Make the change
2. Update all callers (from step 2)
3. Run tests to verify
4. Check get_errors for type issues
```

---

## ⚠️ Common Mistakes

| Mistake                                    | Why It's Bad              | Correct Approach                 |
| ------------------------------------------ | ------------------------- | -------------------------------- |
| ❌ Changing signature without caller check | Breaks unknown consumers  | Always run impact analysis first |
| ❌ Renaming without updating imports       | Creates broken references | Use indexer to find all usages   |
| ❌ Moving file without updating paths      | Breaks import statements  | Check dependents before moving   |

---

## 📊 Blast Radius Categories

| Impact        | Description                     | Action                          |
| ------------- | ------------------------------- | ------------------------------- |
| 🟢 **Low**    | 0-5 callers, all in same module | Proceed with caution            |
| 🟡 **Medium** | 6-15 callers, cross-module      | Plan carefully, test thoroughly |
| 🔴 **High**   | 16+ callers, or public API      | Consider deprecation strategy   |
