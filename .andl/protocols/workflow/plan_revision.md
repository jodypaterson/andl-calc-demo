---
id: plan-revision
name: Plan Revision Protocol
category: workflow
description: >-
  Guidelines for when and how to revise an existing plan. Covers discovery
  invalidation, repeated failures, and scope changes. Provides structured
  revision workflow: assess impact, revise plan, validate, continue.
triggerDescription: >-
  FETCH when: Discovery invalidates current plan, task step fails repeatedly,
  new context suggests different approach needed, or scope has changed mid-
  execution. Provides revision protocol: assess → revise → validate → continue.
triggerKeywords:
  - revise plan
  - plan failed
  - wrong approach
  - different strategy
  - change direction
  - adapt
  - pivot
  - new information
version: 1.0.0
autoSuggest: false
estimatedTokens: 320
metadata:
  author: system
  createdAt: "2025-12-18"
  updatedAt: "2026-01-10"
---

# 🔄 PLAN REVISION PROTOCOL

**Guidelines for when and how to revise an existing plan.**

---

## 🔍 WHEN TO REVISE

| Trigger                             | Meaning                                                   |
| ----------------------------------- | --------------------------------------------------------- |
| 🚫 **Blocker discovered**           | Required file missing, API unavailable, permission denied |
| ⚠️ **Assumption invalidated**       | Structure differs from expected, dependencies missing     |
| 📖 **New context changes approach** | Reading code reveals better pattern                       |
| ❌ **Step fails repeatedly**        | 2+ attempts with same failure mode                        |
| 📢 **User provides new direction**  | Explicit feedback or updated requirements                 |

---

## 🔴 WHEN NOT TO REVISE

| Scenario                | Action                      |
| ----------------------- | --------------------------- |
| 🤔 First attempt failed | Debug and retry first       |
| 📝 Minor obstacle       | Work around it              |
| 📉 Personal preference  | Stick to established plan   |
| 🔧 Could be "better"    | Complete current plan first |

---

## 📋 REVISION FORMAT

```markdown
### 🔄 Plan Revision Required

**Original Plan:** [Brief description]
**Revision Trigger:** [What happened that requires revision]
**What Changed:** [New information/context]

**Revised Plan:**

1. [New step 1]
2. [New step 2]
   ...

**Why This Works Better:**
[Brief explanation of why revised approach is superior]
```

---

## 💡 REVISION PRINCIPLES

| Principle                   | Description                                    |
| --------------------------- | ---------------------------------------------- |
| 🎯 **Explain the pivot**    | User needs to understand why direction changed |
| ⚡ **Revise early**         | Don't sink effort into doomed approach         |
| 📝 **Document what failed** | Helps avoid repeating mistakes                 |
| 🔍 **Preserve learnings**   | What did we discover?                          |
| 🔗 **Maintain continuity**  | Connect old and new approach                   |

---

## ⚠️ MAJOR VS MINOR REVISIONS

### Minor Revision (Document, Continue)

- Tool substitution (grep → file_search)
- Order change (edit A before B)
- Skip unnecessary step
- Add clarifying step

### Major Revision (Full Re-Plan)

- Fundamental approach change
- New requirements discovered
- Architecture constraints found
- User redirects scope

---

## 🚨 ESCALATION TRIGGERS

Escalate to user when revision involves:

| Escalation Condition             | Why                         |
| -------------------------------- | --------------------------- |
| 📊 **>50% plan change**          | User may have preferences   |
| 📁 **New files/directories**     | Scope expansion             |
| ⏱️ **Significant time addition** | >2x original estimate       |
| ⚠️ **Risk introduction**         | Breaking changes, data loss |

---

## ✅ REVISION CHECKLIST

- [ ] Documented what triggered revision
- [ ] Explained what changed
- [ ] New plan is complete (not just "figure it out later")
- [ ] Preserved useful work from original plan
- [ ] User understands the pivot (if major)
