---
id: multi-file-coherence
name: Multi-File Coherence Protocol
category: coding
description: >-
  Protocol for maintaining coherence across related files. Covers coordinated
  updates when changing types, interfaces, function signatures, exports, and
  imports. Prevents orphaned references and type mismatches.
triggerDescription: >-
  FETCH when: @Dev or @Architect editing multiple related files, changing
  types/interfaces, modifying function signatures, renaming exports, or any
  change requiring coordinated updates across files.
triggerKeywords:
  - multi-file
  - multiple files
  - cross-file
  - interface change
  - type change
  - signature change
  - rename export
  - rename function
  - rename type
  - add parameter
  - remove parameter
  - change return type
  - breaking change
  - update callers
  - update consumers
  - API change
  - export change
  - import path change
version: 1.0.0
autoSuggest: true
estimatedTokens: 600
metadata:
  author: system
  createdAt: "2025-12-18"
  updatedAt: "2026-01-10"
---

# 🔗 MULTI-FILE COHERENCE PROTOCOL

**MANDATORY:** Fetch this protocol when making changes that will affect multiple files to ensure coordinated, consistent updates.

---

## 🎯 When This Applies

### Multi-File Operations Include

- 📝 **Interface/Type Changes:** Adding/removing/renaming properties
- 🔧 **Function Signature Changes:** Parameters, return types
- 📤 **Export Renames:** Changing exported names that others import
- 📁 **Module Restructuring:** Moving code between files
- 🔢 **Shared Constant Changes:** Values used across multiple files

---

## 🔄 The Coherence Workflow

### Step 1️⃣: Identify All Affected Files

**BEFORE making the change:**

```text
1. Use indexer.graph_dependents or grep_search to find all consumers
2. Create a mental list of files that need updates
3. Estimate: Is this 2 files? 10 files? 50 files?
```

### Step 2️⃣: Choose Your Strategy

| Scope             | Strategy                                         |
| ----------------- | ------------------------------------------------ |
| 📦 **2-5 files**  | Update all in sequence, verify each              |
| 📚 **6-15 files** | Group by similarity, update in batches           |
| 🏢 **16+ files**  | Consider automated refactoring or staged rollout |

### Step 3️⃣: Execute Atomically

**CRITICAL:** Do not leave the codebase in a broken state.

```text
For each affected file:
  1. Read the current state
  2. Apply the coordinated change
  3. Verify the edit applied correctly
```

### Step 4️⃣: Verify Coherence

```text
1. Run get_errors on ALL modified files
2. Run relevant tests
3. Confirm no orphaned references
```

---

## ⛔ The Cardinal Sin: Partial Updates

### ❌ NEVER DO THIS

```text
Change interface in types.ts
"I'll update the callers later..."
→ Creates compile errors and broken state
```

### ✅ ALWAYS DO THIS

```text
1. Plan all changes needed
2. Execute ALL updates in sequence
3. Verify build passes before reporting complete
```

---

## 📊 Change Impact Matrix

| Change Type               | Typical Impact | Files Affected |
| ------------------------- | -------------- | -------------- |
| 🟢 Add optional property  | Low            | Usually none   |
| 🟡 Add required property  | Medium         | All consumers  |
| 🟠 Rename property        | Medium-High    | All usages     |
| 🔴 Remove property        | High           | All usages     |
| 🔴 Change parameter order | High           | All callers    |

---

## ✅ Coherence Checklist

Before reporting complete:

- [ ] All affected files identified
- [ ] All files updated consistently
- [ ] No compile errors (`get_errors` clean)
- [ ] Tests still pass
- [ ] No orphaned references
