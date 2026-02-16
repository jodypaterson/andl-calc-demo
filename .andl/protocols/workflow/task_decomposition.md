---
id: task-decomposition
name: Task Decomposition Protocol
category: workflow
description: >-
  Governs task management within the current session. Covers request assessment
  (simple vs complex), ambiguity checks, task list creation (3-7 atomic tasks),
  sequential execution with 3-iteration limits, plan revision, and executive summary.
triggerDescription: >-
  ALWAYS ACTIVE. Before ANY action, classify: Simple (1-2 tools) → answer directly,
  Complex (3+ tools) → DECOMPOSE FIRST into 3-7 atomic tasks. Execute sequentially
  with verification. Max 2 plan revisions per session.
triggerKeywords:
  - complex
  - multi-step
  - plan
  - decompose
  - task
  - steps
  - breakdown
  - atomic
  - sequential
version: 1.0.0
displayMode: full
estimatedTokens: 600
metadata:
  author: system
  createdAt: "2026-01-10"
  updatedAt: "2026-01-10"
---

# 📋 TASK DECOMPOSITION PROTOCOL

**This protocol governs task management within the CURRENT SESSION.**

---

## 🎯 STEP 0: Request Assessment

**Before ANY action, classify the request:**

| Complexity     | Criteria                                       | Action          |
| -------------- | ---------------------------------------------- | --------------- |
| 🟢 **Simple**  | Direct answer, no tools, or 1-2 tool calls     | Answer directly |
| 🟠 **Complex** | ANY multi-step work, 3+ tool calls, multi-file | DECOMPOSE FIRST |

**Rule:** If you plan to use 3+ tools, create a task decomposition FIRST.

---

## ❓ STEP 0.5: Ambiguity Check

**STOP and ask ONE clarifying question if:**

- User says "fix the bug" without error log or file
- User references "the file" without specifics
- Request has multiple valid interpretations
- Critical context is missing for safe execution

**Format:**

```text
Before I proceed, I need one clarification:
[Specific question with options if applicable]
```

---

## 📝 STEP 1: Create Task List

For **Complex** requests, define 3-7 atomic tasks in your Thought:

```text
Thought: This is a Complex task. My plan:
1. [Task 1 title] - Acceptance: [criterion]
2. [Task 2 title] - Acceptance: [criterion]
3. [Task 3 title] - Acceptance: [criterion]
```

### Task Principles

| Principle         | Description                                |
| ----------------- | ------------------------------------------ |
| ⚡ **Atomic**     | Each task completable in 1-3 tool calls    |
| ✅ **Verifiable** | Acceptance criterion objectively checkable |
| 📊 **Sequential** | Order by dependency                        |
| 📦 **Bounded**    | 3-7 tasks maximum                          |

---

## ▶️ STEP 2: Execute Sequentially

**One task at a time.** For each task:

1. **State task** in Thought: "Starting task N: [title]"
2. **Execute** using ReAct loop (Thought → Action → Observation → Synthesis)
3. **Verify** acceptance criterion
4. **Confirm completion** in Thought: "Task N complete. Evidence: [proof]"

### ⏱️ 3-Iteration Limit Per Task

If task takes >3 tool calls:

- ✂️ Split into sub-tasks, OR
- ✅ Mark completed with partial results, OR
- ⏸️ Mark blocked if genuinely stuck

---

## 🔄 STEP 2.5: Plan Revision (When Needed)

After completing each task, assess:

| Assessment                           | Action                    |
| ------------------------------------ | ------------------------- |
| ✅ Plan still valid?                 | Continue                  |
| 🔍 Discovery invalidates assumption? | State revision in Thought |
| 📈 Scope expansion detected?         | Escalate if >2x original  |

**Max 2 major revisions per session.** After 2nd revision, escalate to user.

---

## 📊 STEP 3: Executive Summary

When ALL tasks complete, provide:

```text
✅ Objective: [what was requested]
📋 Completed: X/X tasks
📁 Changes Made: [list files changed]
✔️ Verification: [build/tests status]
```

---

## 🚫 Anti-Patterns

| ❌ Don't                                | ✅ Do Instead                        |
| --------------------------------------- | ------------------------------------ |
| Jump into complex task without planning | Assess complexity first              |
| Create 10+ granular tasks               | Keep to 3-7 atomic tasks             |
| Spend 10 iterations on one task         | Split or escalate after 3 iterations |
| Revise plan 5 times                     | Escalate after 2nd major revision    |
| Report complete without verification    | Always include verification evidence |

---

## ✅ Decomposition Checklist

Before executing:

- [ ] Request classified (Simple/Complex)
- [ ] Ambiguities clarified
- [ ] 3-7 atomic tasks defined (if Complex)
- [ ] Each task has acceptance criterion
- [ ] Tasks ordered by dependency
