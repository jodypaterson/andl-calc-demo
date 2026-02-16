---
id: dev-escalation
name: Dev Escalation
category: workflow
description: >-
  Escalation protocol for @Dev when encountering technical blockers requiring
  PM decision, expertise changes, architectural decisions, or human input.
  Provides structured escalation template with context and options.
triggerDescription: >-
  FETCH when: @Dev encounters technical blocker requiring PM decision, expertise
  change needed (wrong agent for task), architectural decision required, or
  cannot proceed without human input. Escalation template provided.
triggerKeywords:
  - blocker
  - stuck
  - blocked
  - can't proceed
  - need help
  - escalate
  - PM decision
estimatedTokens: 1838
parentProtocol: sdlc-master
metadata:
  updatedAt: "2026-01-10T18:40:37.945Z"
---

# 🚨 DEV ESCALATION PROTOCOL

**Technical blockers that require PM intervention or expertise change.**

---

## 🔴 1. Escalation Triggers

@dev should escalate to @pm when encountering:

### 1.1 Technical Blockers

| Blocker Type                    | Threshold                  | Example                                  |
| ------------------------------- | -------------------------- | ---------------------------------------- |
| 📄 **Missing Dependency**       | Cannot proceed without it  | Design doc missing, API spec unavailable |
| ⚔️ **Conflicting Requirements** | 2+ requirements contradict | Feature A needs X, Feature B prohibits X |
| 🚫 **Technical Impossibility**  | Approach cannot work       | Performance target unachievable          |
| 🌐 **External Dependency**      | Waiting on external party  | Third-party API down, awaiting response  |

### 1.2 Scope Concerns

| Concern                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| 📈 **Scope Creep**     | Directive implies more work than AT description     |
| ❓ **Scope Ambiguity** | Multiple interpretations possible                   |
| ⚔️ **Scope Conflict**  | New work conflicts with existing implementation     |
| 📭 **Missing Context** | Not enough information for implementation decisions |

### 1.3 Risk Discovery

| Risk Type                 | Description                              |
| ------------------------- | ---------------------------------------- |
| 📊 **Risk Level Upgrade** | Task appears higher risk than estimated  |
| 🔒 **Security Concern**   | Potential vulnerability discovered       |
| 💾 **Data Risk**          | Implementation may impact data integrity |
| ⚖️ **Compliance Risk**    | Regulatory or policy implications found  |

### 1.4 Effort Mismatch

| Mismatch                | Threshold                             |
| ----------------------- | ------------------------------------- |
| 📈 **Underestimated**   | Task requires >2x estimated effort    |
| ⏱️ **Blocked Time**     | >2 hours spent without progress       |
| 🔍 **Complexity Spike** | Hidden complexity discovered mid-task |

---

## 📝 2. Escalation Format

Use this template when escalating to PM:

```markdown
From: @Dev
To: @PM
Subject: 🚨 Blocker: [Brief Title] (AT-XXX)

---

## Blocker Report

**AT Context:** AT-XXX: [Title]
**Risk Level:** [Updated assessment if changed]
**Time Blocked:** [Duration since blocker encountered]

### 🚫 Blocker Description

[Clear, concise description of what is preventing progress]

### 🔍 Root Cause

[Why this blocker exists - missing info, technical limitation, etc.]

### 🔧 Attempted Solutions

1. [What I tried first and why it didn't work]
2. [Second attempt and result]
3. [Third attempt if applicable]

### 📊 Impact Assessment

- **Current Task:** [Blocked|Partially blocked|Delayed]
- **Dependencies:** [Other tasks affected]
- **Timeline:** [Estimated delay if not resolved]

### 💡 Proposed Resolution Options

**Option A: [Resolution approach]**

- Effort: [Time estimate]
- Risk: [Assessment]
- Trade-offs: [What we give up]

**Option B: [Alternative approach]**

- Effort: [Time estimate]
- Risk: [Assessment]
- Trade-offs: [What we give up]

### ✅ Recommendation

I recommend **Option [X]** because [rationale].

### ❓ Input Needed

[Specific question or decision required from PM]

---

Awaiting PM guidance before proceeding.
```

---

## ✅ 3. Escalation Quality Requirements

A good escalation:

| Requirement                 | Description                       |
| --------------------------- | --------------------------------- |
| 📖 **Clear description**    | PM can understand without context |
| 🔧 **Shows work attempted** | Proves investigation happened     |
| 💡 **Offers options**       | Doesn't just dump problem on PM   |
| ❓ **Has clear ask**        | PM knows exactly what to decide   |

---

## 📬 4. PM Response Protocol

### 4.1 Acknowledgment

PM should acknowledge escalation promptly:

```markdown
From: @PM
To: @Dev
Subject: ACK: Blocker (AT-XXX)

✅ Blocker received. Analyzing options. ETA for decision: [timeframe].
```

### 4.2 Resolution Options

| Response Type        | When Used                  | Dev Action                            |
| -------------------- | -------------------------- | ------------------------------------- |
| ✅ **Decision**      | PM picks option            | Proceed with selected approach        |
| 📋 **New Directive** | Scope change needed        | Update AT understanding, proceed      |
| 🔍 **Investigation** | More info needed           | Provide requested details             |
| 🔄 **Reassignment**  | Different expertise needed | Hand off per protocol                 |
| ⏸️ **Deprioritize**  | Defer for now              | Move to backlog, proceed with next AT |

### 4.3 Decision Documentation

PM decision should be documented:

```markdown
### Blocker Resolution (AT-XXX)

**Decision:** Option [A/B]
**Rationale:** [Why this option chosen]
**Next Action:** [What @dev should do]
**AD Created:** [Yes/No - if autonomy decision needed]
```

---

## ⏱️ 5. Escalation Timing

| Timing                      | Guideline                                 |
| --------------------------- | ----------------------------------------- |
| 🚀 **Early**                | Don't sink 4+ hours before escalating     |
| ⚡ **Clear assessment**     | 15-30 min to understand before escalating |
| 📊 **After investigation**  | Show attempted solutions                  |
| ⏰ **Time-box exploration** | Max 2 hours before escalating             |

---

## 🚫 6. Anti-Patterns

| ❌ Anti-Pattern             | ✅ Correct Behavior                   |
| --------------------------- | ------------------------------------- |
| Escalating immediately      | Investigate first (15-30 min minimum) |
| "I'm stuck" with no context | Full blocker report with options      |
| No proposed solutions       | Always offer at least 2 options       |
| Hiding uncertainty          | Be transparent about unknowns         |
| Waiting too long            | Escalate at 2-hour mark               |
| Vague impact assessment     | Quantify delay/affected tasks         |

---

## 💡 7. Escalation Decision Heuristics

| Question                                       | If Yes →     |
| ---------------------------------------------- | ------------ |
| 🔧 Can I make progress with reasonable effort? | Keep working |
| 📊 Is the path forward clear?                  | Keep working |
| 📋 Do I have needed information?               | Keep working |
| 🚫 Am I blocked on external decision?          | Escalate     |
| ❓ Is scope unclear/ambiguous?                 | Escalate     |
| ⚠️ Did I discover higher risk?                 | Escalate     |
| ⏱️ Have I spent 2+ hours without progress?     | Escalate     |

---

## 📊 8. Severity Levels

| Level           | Description                        | Response Time |
| --------------- | ---------------------------------- | ------------- |
| 🔴 **Critical** | Work completely stopped            | Immediate     |
| 🟠 **High**     | Major feature blocked              | Within hours  |
| 🟡 **Medium**   | Workaround possible but suboptimal | Within 1 day  |
| 🟢 **Low**      | Clarification needed, can proceed  | Next sync     |
