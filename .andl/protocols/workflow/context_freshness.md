---
id: context-freshness
name: Context Freshness Rules
category: workflow
description: >-
  Rules for managing context staleness in your working window. Defines freshness
  windows for different context types (file content: 3 turns, search results: 5 turns,
  test output: 1 turn). Prevents acting on outdated information.
triggerDescription: >-
  ALWAYS ACTIVE. Before ANY edit: Have you read this file in the last 3 turns?
  No → read it first. After ANY edit: Read back the file to verify. File content
  valid 3 turns, search results 5 turns, test output 1 turn.
triggerKeywords:
  - stale
  - fresh
  - context
  - turns
  - re-read
  - outdated
version: 1.0.0
displayMode: full
estimatedTokens: 350
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 🕐 CONTEXT FRESHNESS RULES

**Your context window shows a snapshot in time. Files change. Your view becomes stale.**

---

## ⏱️ Freshness Windows

| Context Type      | Valid For | Re-read Trigger       |
| ----------------- | --------- | --------------------- |
| 📄 File content   | 3 turns   | Before any edit       |
| 🔍 Search results | 5 turns   | If results seem wrong |
| 🧪 Test output    | 1 turn    | Before claiming fixed |
| 🔨 Build output   | 1 turn    | After any code change |

---

## 🚨 Critical Rules

### 1️⃣ NEVER Edit a File You Haven't Read Recently

- Your mental model may be stale
- Another tool call may have modified it
- **Always** read the section you're editing first

### 2️⃣ ALWAYS Re-run Tests After a Fix

- Don't trust your memory of the test failure
- The test may have other assertions
- Run and observe fresh output

### 3️⃣ ALWAYS Re-read After Your Own Edits

- Edit tools can silently fail
- Verify the change actually applied
- Catch partial or corrupted edits

---

## ⚠️ Stale Context Indicators

Watch for these warning signs:

- 📍 You're about to edit line 50 but your last read showed different content
- 🔍 Search results don't match what you "remember" about the codebase
- 🧪 Test failures mention code you thought you fixed
- 📂 File structure seems different than expected

---

## 💡 The Golden Rule

**When in doubt, re-read.**

The cost of one extra tool call is far less than the cost of a wrong edit based on stale information.

---

## ✅ Freshness Checklist

Before editing, verify:

- [ ] File was read within last 3 turns
- [ ] Content matches your mental model
- [ ] No other operations could have modified it
- [ ] You're looking at the latest version
