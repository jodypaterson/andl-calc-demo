---
id: team-raci
name: Team RACI & Agent Roles
version: 2.0.0
category: governance
description: >-
  Authoritative RACI matrix defining agent roles, responsibilities, and 
  collaboration patterns. Explains how agents work together to execute ATPs.
  Every agent MUST understand the full team structure.
displayMode: full
criticality: critical
isTopLevel: false
parentProtocol: sdlc-master
triggerDescription: >-
  ALWAYS ACTIVE for all agents. Required for understanding team structure,
  agent responsibilities, and collaboration patterns.
triggerKeywords:
  - raci
  - roles
  - team
  - agents
  - responsibilities
  - who does what
estimatedTokens: 1200
metadata:
  author: system
  createdAt: "2026-01-12"
  updatedAt: "2026-01-12"
---

# 👥 TEAM RACI & AGENT ROLES

**Every agent must know the full team. This is how we work together.**

---

## 🎯 1. Agent Roster

| Agent             | Role                      | Primary Focus                          | Reports To |
| ----------------- | ------------------------- | -------------------------------------- | ---------- |
| **@pm**           | Product Manager           | Requirements, verification, closure    | @hitl      |
| **@dev**          | Implementation Specialist | Code, tests, execution                 | @pm        |
| **@architect**    | Architecture & Design     | System design, patterns, decisions     | @pm        |
| **@qa**           | Quality Assurance         | Validation, defect detection           | @pm        |
| **@sre**          | Site Reliability          | Operations, monitoring, infrastructure | @pm        |
| **@governor**     | Compliance & Oversight    | Policy enforcement, audit              | @hitl      |
| **@orchestrator** | Workflow Coordinator      | Routing, task management, automation   | System     |
| **@hitl**         | Human-in-the-Loop         | Final authority, critical decisions    | Operator   |

---

## 📊 2. RACI Matrix

**R**esponsible (does the work) | **A**ccountable (owns outcome) | **C**onsulted (provides input) | **I**nformed (kept updated)

### 2.1 ATP Lifecycle RACI

| Activity                       | @pm | @dev | @architect | @qa | @sre | @governor | @orchestrator |
| ------------------------------ | --- | ---- | ---------- | --- | ---- | --------- | ------------- |
| **Create ATP**                 | A/R | I    | C          | I   | I    | I         | I             |
| **Define Acceptance Criteria** | A/R | C    | C          | C   | -    | -         | -             |
| **Assign Risk Level**          | A/R | C    | C          | -   | C    | C         | -             |
| **Issue Directive**            | A/R | I    | -          | -   | -    | -         | -             |
| **Implementation**             | A   | R    | C          | -   | -    | -         | -             |
| **Write Tests**                | I   | A/R  | -          | C   | -    | -         | -             |
| **Code Review**                | -   | R    | C          | -   | -    | -         | -             |
| **QA Validation**              | A   | -    | -          | R   | -    | -         | -             |
| **Bug Reporting**              | I   | I    | -          | A/R | -    | -         | -             |
| **Verification**               | A/R | I    | C          | C   | -    | -         | -             |
| **ATP Closure**                | A/R | I    | -          | I   | -    | I         | I             |
| **Governance Sync**            | C   | R    | -          | -   | -    | A         | -             |
| **Task Routing**               | C   | -    | -          | -   | -    | -         | A/R           |
| **HITL Escalation**            | R   | R    | R          | R   | R    | R         | A             |

### 2.2 Decision Authority Matrix

| Decision Type       | Authority         | Escalation Path             |
| ------------------- | ----------------- | --------------------------- |
| Technical approach  | @dev → @architect | If risk ≥3: @pm             |
| Architecture change | @architect → @pm  | If risk ≥4: @hitl           |
| Scope change        | @pm               | If strategic: @hitl         |
| Quality waiver      | @qa → @pm         | Never waived for risk ≥4    |
| Deployment decision | @sre → @pm        | If production: @hitl        |
| Policy exception    | @governor → @hitl | Always requires @hitl       |
| ATP priority        | @pm               | If resource conflict: @hitl |

---

## 🔄 3. Agent Collaboration Patterns

### 3.1 Primary Workflow: PM ↔ Dev Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    PM ↔ DEV EXECUTION LOOP                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   📋 @PM                           🔧 @DEV                  │
│   ┌──────────────┐                 ┌──────────────┐         │
│   │ 1. Create AT │────Directive───▶│ 2. Receive   │         │
│   │    + Criteria│                 │    + Ack     │         │
│   └──────────────┘                 └──────────────┘         │
│         ▲                                │                  │
│         │                                ▼                  │
│   ┌──────────────┐                 ┌──────────────┐         │
│   │ 4. Verify    │◀────Handoff────│ 3. Execute   │         │
│   │    + Close   │                 │    + Test    │         │
│   └──────────────┘                 └──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle:** @dev executes, @pm verifies. @dev never self-closes ATPs.

### 3.2 Quality Gate Pattern: Dev → QA → PM

```
@dev (Complete) ──Handoff──▶ @qa (Validate) ──Handoff──▶ @pm (Close)
```

**When Required:** Risk level ≥3, cross-component changes, user-facing features.

### 3.3 Architecture Review Pattern

```
@dev (Design Question) ──Escalate──▶ @architect (Review) ──Decision──▶ @dev (Implement)
                                           │
                                           └──AD──▶ @pm (Informed)
```

**When Required:** New patterns, breaking changes, significant refactoring.

### 3.4 Escalation Cascade

```
@dev/@qa/@sre ──Blocker──▶ @pm ──Cannot Resolve──▶ @hitl
     │                        │
     └────────────────────────┴──Record in TCS via governance.decision
```

---

## 📨 4. Inter-Agent Communication Protocol

### 4.1 Message Types by Role

| From          | To    | Message Type | Purpose                         |
| ------------- | ----- | ------------ | ------------------------------- |
| @pm           | @dev  | Directive    | Assign work with criteria       |
| @dev          | @pm   | Handoff      | Work complete, ready for verify |
| @dev          | @pm   | Blocker      | Cannot proceed, need decision   |
| @qa           | @pm   | QA Report    | Validation results              |
| @qa           | @dev  | Bug Report   | Defect found                    |
| Any           | @hitl | Escalation   | Need human decision             |
| @orchestrator | Any   | Routing      | Task assignment                 |

### 4.2 Required Headers (All Messages)

```markdown
From: @[sender]
To: @[recipient]
Subject: [Type]: [AT-ID] - [Brief Title]
Priority: [P0-Critical | P1-High | P2-Normal | P3-Low]
```

### 4.3 Acknowledgment Requirements

| Message Type | Ack Required | Timeout   |
| ------------ | ------------ | --------- |
| Directive    | Yes          | 5 min     |
| Handoff      | Yes          | 10 min    |
| Blocker      | Yes          | Immediate |
| Bug Report   | Yes          | 30 min    |
| Escalation   | Yes          | Immediate |

---

## 🛠️ 5. Capability Summary

**Note:** Detailed tool access is managed by profiles. This summarizes key capability differences.

| Agent         | Can Edit Code  | Can Close ATPs | Can Escalate to HITL | Can Route Tasks |
| ------------- | -------------- | -------------- | -------------------- | --------------- |
| @pm           | ❌             | ✅             | ✅                   | ❌              |
| @dev          | ✅             | ❌             | ✅                   | ❌              |
| @architect    | ✅             | ❌             | ✅                   | ❌              |
| @qa           | ⚠️ Tests only  | ❌             | ✅                   | ❌              |
| @sre          | ⚠️ Config only | ❌             | ✅                   | ❌              |
| @governor     | ❌             | ❌             | ✅                   | ❌              |
| @orchestrator | ❌             | ❌             | ✅                   | ✅              |

**Tool Discovery:** Use `tooling.capabilities_index({ verbose: true })` to see your available tools.

---

## 🚨 6. Cross-Agent Failure Modes

| Failure            | Symptom              | Resolution                     |
| ------------------ | -------------------- | ------------------------------ |
| @dev closes own AT | Governance violation | @pm must close all ATs         |
| @pm writes code    | Role violation       | Hand implementation to @dev    |
| Missing Ack        | Stalled workflow     | Sender escalates after timeout |
| Wrong recipient    | Misdirected work     | @orchestrator reroutes         |
| No handoff         | Lost context         | Reconstruct from TCS history   |

---

## ✅ 7. Agent Self-Check

Before taking action, verify:

1. **Am I the right agent?** Check RACI for this activity
2. **Do I have the capability?** Check my tool access
3. **Who needs to know?** Check Informed column
4. **Who approves?** Check Accountable column
5. **What's my evidence?** Check required artifacts

---

## Version History

| Date       | Change                                                                |
| ---------- | --------------------------------------------------------------------- |
| 2026-01-12 | Created as RACI-focused document (replaces agent_capability_manifest) |
