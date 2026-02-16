---
id: strategy-escalation
name: Strategy Escalation Protocol
category: workflow
description: >-
  Guidelines for escalating strategic decisions to the user rather than guessing.
  Covers architecture choices, multiple valid paths, unclear preferences, and
  high-impact decisions. Escalate with structured options rather than assumptions.
triggerDescription: >-
  FETCH when: Strategic decision required (which approach? what architecture?),
  multiple valid paths exist, user preference unclear, or decision significantly
  impacts project direction. Escalate rather than guess.
triggerKeywords:
  - should I
  - which approach
  - architecture decision
  - strategic choice
  - user preference
  - escalate
  - major decision
version: 1.0.0
autoSuggest: false
estimatedTokens: 290
metadata:
  author: system
  createdAt: "2025-12-18"
  updatedAt: "2026-01-10"
---

# 🚨 STRATEGY ESCALATION PROTOCOL

**Guidelines for when to escalate strategic decisions to the user.**

---

## 🔴 ALWAYS ESCALATE

| Decision Type                   | Why Escalate                               |
| ------------------------------- | ------------------------------------------ |
| 🏗️ **Architecture patterns**    | "Should I use Strategy or Observer?"       |
| 📦 **New dependencies**         | "Add library X or implement from scratch?" |
| 🔧 **Breaking changes**         | Any change to public interfaces            |
| 📁 **File structure decisions** | New directories, major reorganization      |
| 🛡️ **Security tradeoffs**       | Convenience vs. security choices           |
| 💰 **Cost implications**        | External API calls, storage decisions      |

---

## ✅ DECIDE AUTONOMOUSLY

| Decision Type             | Why Autonomous           |
| ------------------------- | ------------------------ |
| 📝 **Naming conventions** | Follow existing patterns |
| 🎨 **Code formatting**    | Apply project style      |
| ✏️ **Minor refactoring**  | Within directive scope   |
| 🐛 **Bug fix approach**   | Standard techniques      |
| 🔍 **Tool selection**     | grep vs file_search      |
| 📖 **Comment content**    | Documentation text       |

---

## 📋 ESCALATION FORMAT

```markdown
### 🤔 Strategic Decision Required

**Context:** [Why this decision point exists]

**Options:**
| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | [Approach A] | [Benefits] | [Drawbacks] |
| B | [Approach B] | [Benefits] | [Drawbacks] |

**My Recommendation:** Option [X] because [reasoning]

**What I Need From You:**

- Which option do you prefer?
- [Any specific clarifying question]
```

---

## 💡 DECISION PRINCIPLES

| Principle                    | Guidance                        |
| ---------------------------- | ------------------------------- |
| 🚫 **Don't decide for user** | Big choices need buy-in         |
| ✅ **Do propose options**    | Curated choices, not open-ended |
| 📊 **Include tradeoffs**     | Honest pros/cons for each       |
| 🎯 **Make recommendation**   | Don't be wishy-washy            |
| 📖 **Explain reasoning**     | Share your technical analysis   |

---

## ⏱️ ESCALATION TIMING

| Timing                    | Guideline                           |
| ------------------------- | ----------------------------------- |
| 🚀 **Early**              | Before significant work on any path |
| ⏸️ **At decision points** | When paths diverge                  |
| ❌ **Not after-the-fact** | Don't ask to ratify done work       |

---

## 🔍 GRAY AREA HEURISTICS

When unsure whether to escalate:

| Question                                        | If Yes →    |
| ----------------------------------------------- | ----------- |
| Would a rollback be costly (>15 minutes)?       | Escalate 🔴 |
| Could a senior developer disagree?              | Escalate 🔴 |
| Does this set a precedent?                      | Escalate 🔴 |
| Is this about user's preferences?               | Escalate 🔴 |
| Is this purely technical with one right answer? | Decide ✅   |
| Would waiting waste significant time?           | Decide ✅   |

---

## 🚫 ANTI-PATTERNS

| Anti-Pattern                      | Correct Behavior          |
| --------------------------------- | ------------------------- |
| ❌ Deciding without disclosure    | ✅ Document decision made |
| ❌ Asking about everything        | ✅ Be selective           |
| ❌ Analysis paralysis             | ✅ Propose and recommend  |
| ❌ Open-ended "what should I do?" | ✅ Curated options        |
| ❌ Hiding uncertainty             | ✅ Be transparent         |
