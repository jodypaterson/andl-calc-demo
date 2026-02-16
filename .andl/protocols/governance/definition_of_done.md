---
id: definition-of-done
name: Definition of Done Protocol
category: governance
description: >-
  Definition of Done checklist ensuring work meets quality standards before
  completion. Covers: tests pass, documentation updated, no regressions,
  acceptance criteria verified, governance artifacts synced.
triggerDescription: >-
  FETCH when: About to mark task complete, validating deliverable meets quality
  standards, or preparing work for review. DoD checklist ensures: tests pass,
  docs updated, no regressions, acceptance criteria met.
triggerKeywords:
  - complete
  - completed
  - done
  - finished
  - final answer
  - task complete
  - marking complete
  - verification
  - DoD
version: 1.0.0
autoSuggest: true
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2025-12-03"
  updatedAt: "2026-01-10"
---

# ✅ DEFINITION OF DONE (DoD)

**A task is NOT `completed` until ALL of the following are verified.**

---

## 1️⃣ Technical Integrity

- ✅ **Compiles/Parses:** Modified files have no syntax errors
- ✅ **No Regressions:** Existing tests still pass (if test suite exists)
- ✅ **Type-Safe:** No new TypeScript/type errors introduced

---

## 2️⃣ Verification Evidence

- 📖 **Blind Read:** Final `read_file` on edited files confirms content matches intent
- 🧪 **Proof of Function:** At least ONE of:
  - Test passed
  - Build succeeded
  - Manual verification command executed

---

## 3️⃣ Session Hygiene

- 🧹 **No Orphans:** Temporary test files or debug scripts created during session are deleted
- 🐛 **No Debug Residue:** `console.log`, `debugger`, or test-only code removed
- 📝 **Comments Updated:** If logic changed, accompanying JSDoc/comments reflect the change

---

## 4️⃣ Honest Status Reporting

**Task status MUST reflect reality:**

| Status           | Meaning                               |
| ---------------- | ------------------------------------- |
| ✅ `completed`   | ALL DoD criteria verified             |
| 🔄 `in-progress` | Still working, criteria not yet met   |
| ⏸️ `blocked`     | Cannot proceed without external input |

---

## 🚨 Integrity Rule

**If you cannot verify the DoD criteria, the task is NOT complete.**

Do not report `completed` based on assumptions.

---

## ✅ Quick Checklist

Before marking complete:

- [ ] Code compiles without errors
- [ ] Read file back to verify changes
- [ ] Tests pass (or no test regression)
- [ ] No debug/temporary code left
- [ ] Comments updated if logic changed
