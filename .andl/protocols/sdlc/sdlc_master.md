---
id: sdlc-master
name: SDLC Master Policy
version: 3.0.0
category: sdlc
description: >-
  THE ONE-STOP SHOP for all ANDL software development lifecycle governance.
  Defines team roles (RACI), stage guidance, communication protocols, artifact
  templates, and references to detailed sub-policies. Every agent starts here.
displayMode: full
criticality: critical
isTopLevel: true
triggerDescription: >-
  ALWAYS ACTIVE for ALL agents. This is the master policy that explains how
  the entire system works - roles, processes, artifacts, and communication.
triggerKeywords:
  - sdlc
  - lifecycle
  - process
  - how it works
  - governance
  - roles
  - raci
estimatedTokens: 3500
metadata:
  author: system
  createdAt: "2026-01-10"
  updatedAt: "2026-01-12"
---

# 🏗️ SDLC MASTER POLICY (v3.0 - One-Stop Shop)

**THE authoritative source for how ANDL agents work together to deliver software.**

---

## 📚 How to Use This Document

This is the **master policy**. It explains:

1. **Who does what** - Team roles and RACI matrix
2. **How we communicate** - Message formats and templates
3. **The stages of work** - From Analyze to Finalize
4. **Required artifacts** - Directives, Handoffs, Reports
5. **Where to find details** - Links to sub-policies

**Rule:** If you're unsure how the process works, start here.

---

## 👥 PART 1: TEAM ROLES & RACI

### 1.1 Agent Roster

| Agent             | Role                      | Primary Focus                           |
| ----------------- | ------------------------- | --------------------------------------- |
| **@pm**           | Product Manager           | Requirements, verification, ATP closure |
| **@dev**          | Implementation Specialist | Code, tests, execution                  |
| **@architect**    | Architecture & Design     | System design, patterns                 |
| **@qa**           | Quality Assurance         | Validation, defect detection            |
| **@sre**          | Site Reliability          | Operations, infrastructure              |
| **@governor**     | Compliance & Oversight    | Policy enforcement, audit               |
| **@orchestrator** | Workflow Coordinator      | Routing, automation                     |
| **@hitl**         | Human-in-the-Loop         | Final authority                         |

### 1.2 RACI Matrix (Core Activities)

| Activity        | @pm     | @dev    | @qa   | @architect | Notes                  |
| --------------- | ------- | ------- | ----- | ---------- | ---------------------- |
| Create ATP      | **A/R** | I       | I     | C          | PM owns ATP definition |
| Issue Directive | **A/R** | I       | -     | -          | PM assigns work        |
| Implementation  | A       | **R**   | -     | C          | Dev executes           |
| Write Tests     | I       | **A/R** | C     | -          | Dev tests own code     |
| QA Validation   | A       | -       | **R** | -          | QA validates           |
| Verification    | **A/R** | I       | C     | C          | PM verifies completion |
| ATP Closure     | **A/R** | I       | I     | -          | PM closes              |
| HITL Escalation | R       | R       | R     | R          | Anyone can escalate    |

**Legend:** **R**=Responsible (does work), **A**=Accountable (owns outcome), **C**=Consulted, **I**=Informed

### 1.3 Decision Authority

| Decision            | Authority         | Escalation       |
| ------------------- | ----------------- | ---------------- |
| Technical approach  | @dev → @architect | Risk ≥3: @pm     |
| Architecture change | @architect → @pm  | Risk ≥4: @hitl   |
| Scope change        | @pm               | Strategic: @hitl |
| Quality waiver      | @qa → @pm         | Risk ≥4: Never   |
| Policy exception    | @governor → @hitl | Always           |

**Full RACI details:** See [team_raci.md](../governance/team_raci.md)

---

## 🔄 PART 2: THE PM ↔ DEV EXECUTION LOOP

This is the core workflow that drives all ATP execution:

```
       @PM                                @DEV
        │                                  │
 ┌──────┴──────┐                           │
 │ 1. CREATE   │                           │
 │    ATP      │                           │
 │  + Criteria │                           │
 └──────┬──────┘                           │
        │          DIRECTIVE               │
        ├─────────────────────────────────>│
        │                           ┌──────┴──────┐
        │                           │ 3. RECEIVE  │
        │                           │    + ACK    │
        │                           └──────┬──────┘
        │                                  │
        │                           ┌──────┴──────┐
        │                           │ 4. EXECUTE  │
        │                           │    + TEST   │
        │                           └──────┬──────┘
        │           HANDOFF                │
        │<─────────────────────────────────┤
 ┌──────┴──────┐                           │
 │ 5. VERIFY   │                           │
 │   Evidence  │                           │
 └──────┬──────┘                           │
        │                                  │
 ┌──────┴──────┐                           │
 │ 6. CLOSE    │                           │
 │    ATP      │                           │
 │  + Report   │                           │
 └─────────────┘                           │
```

**Key Rule:** @dev executes, @pm verifies. @dev NEVER self-closes ATPs.

---

## 📨 PART 3: COMMUNICATION PROTOCOL

### 3.1 Message Header (REQUIRED)

**Every inter-agent message MUST include:**

```markdown
From: @[sender]
To: @[recipient]  
Subject: [Type]: [AT-ID] - [Brief Title]
Priority: [P0-Critical | P1-High | P2-Normal | P3-Low]
```

### 3.2 Directive Template (@PM → @Dev)

````markdown
From: @pm
To: @dev
Subject: Directive: AT-YYYYMMDD-NN - [Task Title]
Priority: P2-Normal

## Context

[Background and why this work is needed]

## Acceptance Criteria

- [ ] [Criterion 1 - specific, verifiable]
- [ ] [Criterion 2 - specific, verifiable]
- [ ] [Criterion 3 - specific, verifiable]

## Scope

**In Scope:**

- [Explicit inclusions]

**Out of Scope:**

- [Explicit exclusions]

## Risk Level

[1-5] - [Justification]

## Policy Requirements

**MANDATORY: @PM has evaluated this ATP and identified the following policies.**

**Full Policies (Always Active):**

- sdlc-master (this document) - core workflow
- atp-format - ATP structure requirements
- [Additional based on work type]

**On-Demand Policies to Fetch:**
| Policy ID | Fetch When | Why Needed |
|-----------|------------|------------|
| `hitl-escalation` | Risk ≥4 or uncertainty >50% | Escalation format required |
| `error-recovery` | Errors during execution | Recovery procedures |
| [Additional based on ATP analysis] |

**Closure Policies (MANDATORY at ATP end):**

- pm-verification-protocol - 4-phase PM verification and closure workflow
- atp-flow-standard - flow policies with closure states and MESSAGE BOUNDARY rules

**⚠️ CONTINUOUS POLICY CHECK REQUIRED:**
During execution, you MUST check if additional policies are needed when:

- Encountering errors → fetch `error-recovery`
- Uncertainty >50% → fetch `hitl-escalation`
- Creating bugs → fetch `defect-reporting`
- Agent transitions → fetch `agent-handoff`
  Use: `fetch_protocol({ id: "policy-id" })` to load any policy.

## Closure Requirements

**At ATP closure, the following artifacts are MANDATORY:**

1. **Closure Report** - verification, metrics, evidence
2. **ATP Changelog** - formatted changelog entries
3. **Architectural Update** - decisions and file changes
4. **Lessons Learned** - what worked, improvements
5. **README Update** - if user-facing changes
6. **Activity Log (Issue Log)** - timeline narrative, blockers, events

**Tool Call Required:**

```typescript
governance.atp_close({
  atpId: "AT-XX-YY",
  generateReport: true,
  compileIssueLog: true, // MANDATORY - creates Activity Log
  generateArtifacts: {
    closureReport: true,
    changelog: true,
    architecturalUpdate: true,
    lessonsLearned: true,
    activityLog: true,
  },
});
```
````

## Suggested Starting Points

- `path/to/relevant/file.ts`
- `path/to/another/file.ts`

## Deadline (if applicable)

[Date/time or "Best effort"]

`````

### 3.3 Handoff Template (@Dev → @PM)

````markdown
From: @dev
To: @pm
Subject: Handoff: AT-YYYYMMDD-NN - [Task Title]
Priority: P2-Normal

## Summary

[Brief description of what was accomplished]

## Acceptance Criteria Status

- [x] [Criterion 1] - [Evidence: test file, line X]
- [x] [Criterion 2] - [Evidence: build log]
- [x] [Criterion 3] - [Evidence: manual verification]

## Changes Made

| File              | Change Type | Description      |
| ----------------- | ----------- | ---------------- |
| `path/to/file.ts` | Modified    | Added feature X  |
| `path/to/test.ts` | Created     | Unit tests for X |

## Verification Commands Run

```bash
pnpm -s build        # ✅ PASS
pnpm -s test         # ✅ PASS
pnpm -s lint         # ✅ PASS
`````

```

## Outstanding Items

- None / [List any known issues or follow-ups]

## Ready for Verification

Awaiting @pm review and ATP closure.

```

### 3.4 Blocker Template (Any Agent)

```markdown
From: @[agent]
To: @pm
Subject: Blocker: AT-YYYYMMDD-NN - [Brief Issue]
Priority: P1-High

## Blocker Description

[What is preventing progress]

## Diagnosis

[Root cause analysis - why is this happening?]

## Recovery Options

| Option        | Pros      | Cons       | Recommendation |
| ------------- | --------- | ---------- | -------------- |
| A: [Approach] | [Benefit] | [Drawback] | Recommended    |
| B: [Approach] | [Benefit] | [Drawback] | -              |

## Decision Needed

[Specific question for @pm to answer]

## Impact if Unresolved

[What happens if we don't resolve this?]
```

### 3.5 Acknowledgment Template

```markdown
From: @[recipient]
To: @[sender]
Subject: ACK: AT-YYYYMMDD-NN - [Original Title]

✅ Received and understood.

[Optional: Brief note about when you'll start / any immediate questions]
```

---

## 📊 PART 4: SDLC STAGES

### 4.1 Stage Overview

| Stage        | Owner | Entry Criteria     | Exit Criteria           |
| ------------ | ----- | ------------------ | ----------------------- |
| **Analyze**  | @pm   | ATP assigned       | Requirements documented |
| **Plan**     | @pm   | Requirements clear | AT breakdown complete   |
| **Develop**  | @dev  | Directive received | Tests pass, DoD met     |
| **QA**       | @qa   | Dev complete       | Validation passed       |
| **Finalize** | @pm   | QA passed          | ATP closed              |

### 4.2 Stage: Analyze 🔍

**Owner:** @pm  
**Purpose:** Understand requirements and assess feasibility.

| Entry        | Activities              | Exit                      |
| ------------ | ----------------------- | ------------------------- |
| ATP assigned | Parse requirements      | ☐ Requirements documented |
|              | Identify affected files | ☐ Risk level assigned     |
|              | Map dependencies        | ☐ Dependencies identified |
|              | Assess risk (1-5)       | ☐ Blockers surfaced       |

### 4.3 Stage: Plan 📋

**Owner:** @pm  
**Purpose:** Create actionable implementation plan.

| Entry            | Activities               | Exit                        |
| ---------------- | ------------------------ | --------------------------- |
| Analyze complete | Break into atomic tasks  | ☐ AT decomposition complete |
|                  | Estimate effort          | ☐ Estimates assigned        |
|                  | Sequence by dependencies | ☐ Dependencies mapped       |
|                  | Define verification      | ☐ Test strategy defined     |

### 4.4 Stage: Develop 💻

**Owner:** @dev  
**Purpose:** Implement the planned changes.

| Entry              | Activities         | Exit                      |
| ------------------ | ------------------ | ------------------------- |
| Directive received | Implement per spec | ☐ Implementation complete |
|                    | Write/update tests | ☐ Code follows standards  |
|                    | Run targeted tests | ☐ Targeted tests passing  |
|                    | Document decisions | ☐ No TS/lint errors       |

### 4.5 Stage: QA 🧪

**Owner:** @qa  
**Purpose:** Verify implementation quality.

| Entry        | Activities                 | Exit                   |
| ------------ | -------------------------- | ---------------------- |
| Dev complete | Run full test suite        | ☐ Full tests passing   |
|              | Verify acceptance criteria | ☐ Criteria verified    |
|              | Check for regressions      | ☐ No new issues        |
|              | Report defects             | ☐ Bugs logged if found |

### 4.6 Stage: Finalize ✅

**Owner:** @pm  
**Purpose:** Complete governance and close ATP.

| Entry     | Activities                 | Exit                 |
| --------- | -------------------------- | -------------------- |
| QA passed | Verify all evidence        | ☐ Evidence confirmed |
|           | Update changelog           | ☐ Changelog updated  |
|           | Generate completion report | ☐ Report generated   |
|           | Close ATP                  | ☐ ATP closed in TCS  |

---

## 📊 PART 5: EVIDENCE & RISK LEVELS

### 5.1 Risk Levels

| Level          | Description        | Evidence Required       | Approval Gate |
| -------------- | ------------------ | ----------------------- | ------------- |
| **1** Trivial  | Docs, comments     | Compile pass            | None          |
| **2** Low      | Isolated changes   | Compile + tests         | None          |
| **3** Medium   | Cross-component    | Full suite + governance | None          |
| **4** High     | Schema/API changes | All + PM verification   | @pm           |
| **5** Critical | Security, breaking | All + HITL approval     | @hitl         |

### 5.2 Risk Heuristics

| Level | Examples                                         |
| ----- | ------------------------------------------------ |
| 1     | Typos, comments, documentation                   |
| 2     | Bug fixes, new tests, isolated features          |
| 3     | Refactoring, cross-file changes, new deps        |
| 4     | Schema migrations, API changes, config           |
| 5     | Auth/security, data migrations, breaking changes |

---

## 🛠️ PART 6: GOVERNANCE TOOLS

### 6.1 Core Tools for ATP Workflow

| Tool                      | Purpose                        | When to Use               |
| ------------------------- | ------------------------------ | ------------------------- |
| `governance.message_send` | Send Directive/Handoff/Blocker | Agent communication       |
| `governance.message_ack`  | Acknowledge receipt            | After receiving message   |
| `governance.atp_set`      | Update ATP state               | Status changes            |
| `governance.atp_close`    | Close ATP with report          | PM closes after verify    |
| `governance.decision`     | Record AD                      | Autonomy decisions        |
| `governance.sync`         | Sync governance artifacts      | After significant changes |
| `governance.bug_create`   | Create bug report              | QA finds defects          |

### 6.2 Tool Usage Pattern

```typescript
// 1. PM issues directive
await governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  subject: "Implement X",
  body: "[content]",
});

// 2. Dev acknowledges
await governance.message_ack({ messageId: "MSG-123", agent: "@dev" });

// 3. Dev updates status
await governance.atp_set({ atpId: "AT-XX-YY", status: "InProgress" });

// 4. Dev hands off to PM
await governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P2-Normal",
  subject: "Handoff: AT-XX-YY Complete",
  body: "## Summary\nDone\n\n## Evidence\n- Tests pass\n- Build OK",
  requiresAck: false,
});

// 5. PM closes ATP
await governance.atp_close({
  atpId: "AT-XX-YY",
  summary: "Feature X complete",
  acceptanceCriteriaMet: true,
});
```

---

## 📜 PART 7: POLICY HIERARCHY

This SDLC Master Policy is the top-level document. Sub-policies provide detail:

```
sdlc_master.md (THIS DOCUMENT)
├── governance/
│   ├── team_raci.md ← Full RACI matrix
│   ├── atp_lifecycle.md ← ATP state machine
│   ├── pm_verification_protocol.md ← PM verification & closure
│   └── definition_of_done.md ← Quality criteria
├── workflow/
│   ├── agent-handoff.md ← Handoff protocol
│   ├── atp_flow_standard.md ← Standard ATP flow
│   └── react_execution.md ← ReAct pattern
├── sdlc/
│   ├── hitl_escalation.md ← Escalation rules
│   ├── defect_reporting.md ← Bug workflow
│   ├── error_recovery.md ← Failure recovery
│   └── test_design_patterns.md ← Testing guidance
└── safety/
    ├── enterprise_security.md ← Security constraints
    └── failure_recovery.md ← System failure handling
```

**Discovery:** Use `fetch_protocol({ id: "protocol-id" })` to load any protocol.

---

## ⚡ PART 8: AUTONOMOUS OVERRIDE AUTHORITY

Agents may override specific policy requirements when justified.

### 8.1 Override Triggers

- ⚔️ **Policy Conflict** - Two policies contradict
- ❓ **Novel Situation** - Scenario not addressed
- 🚨 **Time-Critical** - Delay would cause harm
- 👤 **Operator Override** - Human explicitly requests
- 🚫 **Practical Impossibility** - Cannot be met with tools

### 8.2 Override Documentation

When invoking override authority:

```markdown
**Override Decision:**

- **Policy Overridden:** [Section reference]
- **Trigger:** [Why override needed]
- **Alternative Action:** [What was done instead]
- **Justification:** [Why this is safe/appropriate]
```

### 8.3 Override Constraints

| ❌ Cannot Override    | ✅ Can Override     |
| --------------------- | ------------------- |
| Safety policies       | Process steps       |
| HITL thresholds       | Timing/ordering     |
| Evidence requirements | Formatting          |
| Approval gates        | Tooling preferences |

---

## 🚫 PART 9: ANTI-PATTERNS

| ❌ Wrong               | ✅ Right                         |
| ---------------------- | -------------------------------- |
| @dev closes own ATP    | @pm closes all ATPs              |
| @pm writes code        | @dev does all implementation     |
| Skipping stages        | Complete all stages              |
| Chat-only handoffs     | Use `governance.message_send({ messageType: 'Handoff' })` |
| No acknowledgment      | Always ACK messages              |
| Undocumented decisions | Record via `governance.decision` |

---

## ✅ PART 10: QUICK REFERENCE

### Before Starting Work

1. **Who am I?** Check my role in RACI
2. **What's expected?** Check acceptance criteria
3. **What tools do I have?** Run `tooling.capabilities_index()`
4. **What's the risk level?** Check and verify appropriate

### After Completing Work

1. **Did I meet all criteria?** Verify with evidence
2. **Did tests pass?** Run build/test/lint
3. **Did I hand off properly?** Use handoff template
4. **Did recipient acknowledge?** Confirm ACK

### When Stuck

1. **Document the blocker** - Use blocker template
2. **Propose options** - Always give alternatives
3. **Escalate appropriately** - PM first, then HITL
4. **Keep working on other items** - Don't fully stop

---

## 🔗 Related Policies

| Policy ID                  | Name                     | Purpose                              |
| -------------------------- | ------------------------ | ------------------------------------ |
| `atp-format`               | ATP Format Policy        | Canonical ATP structure and fields   |
| `pm-verification-protocol` | PM Verification Protocol | PM verification & closure workflow   |
| `changelog-format`         | Changelog Format         | Keep a Changelog entry format        |
| `hitl-escalation`          | HITL Escalation          | Human-in-the-loop escalation rules   |
| `defect-reporting`         | Defect Reporting         | Bug tracking and resolution process  |
| `error-recovery`           | Error Recovery           | Error handling and recovery patterns |

---

## Version History

| Date       | Version | Change                                                                |
| ---------- | ------- | --------------------------------------------------------------------- |
| 2026-01-12 | 3.0.0   | Major evolution to "one-stop shop" with RACI, templates, full process |
| 2026-01-11 | 2.0.0   | Tool-driven approach                                                  |
| 2026-01-10 | 1.0.0   | Initial version                                                       |
