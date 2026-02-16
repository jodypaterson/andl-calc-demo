---
id: atp-flow-bugfix
name: Bugfix ATP Flow
version: 1.0.0
category: workflow
description: >-
  Flow for tracked defect resolution. Includes mandatory QA verification
  before closure. Standard priority, normal queue, requires regression
  test as part of completion criteria.
displayMode: on-demand
criticality: normal
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  On-demand policy. Load when handling tracked bugs from bug reports
  or defect tracking system.
triggerKeywords:
  - bugfix
  - defect
  - bug fix
  - regression
  - tracked bug
estimatedTokens: 600
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
---

# 🐛 BUGFIX ATP FLOW

**Standard flow for tracked defect resolution with QA verification.**

---

## State Transition Table

| #   | From State   | To State   | Agent | Trigger              | Conditional       |
| --- | ------------ | ---------- | ----- | -------------------- | ----------------- |
| 1   | (bug report) | Queued     | @PM   | Bug triaged          | -                 |
| 2   | Queued       | InProgress | @PM   | Priority assigned    | -                 |
| 3   | InProgress   | InProgress | @Dev  | Receive directive    | -                 |
| 4   | InProgress   | Blocked    | @Dev  | Need info            | -                 |
| 5   | Blocked      | InProgress | @Dev  | Info received        | -                 |
| 6   | InProgress   | Complete   | @Dev  | Fix + test           | -                 |
| 7   | Complete     | In QA      | @PM   | Route to QA          | Always for bugfix |
| 8   | In QA        | QA Failed  | @QA   | Issue found          | If failures       |
| 9   | QA Failed    | In QA      | @QA   | QA fixes minor issue | Minor fix loop    |
| 10  | QA Failed    | Escalated  | @QA   | Fundamental issue    | Need Dev/HITL     |
| 11  | Escalated    | InProgress | @PM   | Route to Dev         | Loop to #6        |
| 12  | Escalated    | HITL       | @PM   | Need human decision  | Escalate          |
| 13  | In QA        | Verified   | @QA   | Tests pass           | -                 |
| 14  | Verified     | Closed     | @PM   | Final approval       | -                 |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│               BUGFIX ATP FLOW (with QA Iteration)                │
└──────────────────────────────────────────────────────────────────┘

┌────────┐    ┌────────┐    ┌────────────┐    ┌──────────┐
│  Bug   │───▶│ Queued │───▶│ InProgress │───▶│ Complete │
│ Report │    └────────┘    └────────────┘    └──────────┘
└────────┘         │              │  ▲              │
                   │              │  │              │
                   │ @PM          │  │              │ @PM routes
                   │ triages      ▼  │              │ to QA
                   │         ┌─────────┐            │
                   │         │ Blocked │            │
                   │         └─────────┘            ▼
                   │              │           ┌──────────┐
                   │              │           │  In QA   │◄──┐
                   │              │           └──────────┘   │
                   │              │              │   │       │
                   │              │         PASS │   │ FAIL  │
                   │              │              │   │       │
                   │              │              │ ┌─┴───┐   │
                   │              │              │ │MINOR│───┘
                   │              │              │ │FIX  │QA
                   │              │              │ │loop │fixes
                   │              │              │ └─────┘
                   │              │              │   │
                   │              │              │ ESCALATE
                   │              │              │   │
                   │              │              │   ▼
                   │              │              │┌────────┐
                   │              │◀─────────────┤│ DEV FIX│
                   │              │              │└────────┘
                   │              │              │   │
                   │              │              │   ▼ HITL (if needed)
                   │              │              ▼
                   │              │           ┌──────────┐
                   │              └──────────▶│  Closed  │
                   │                          └──────────┘
                   └──────────────────────────────▶
```

---

## Key Characteristics

| Aspect          | Bugfix Behavior          |
| --------------- | ------------------------ |
| Queue           | Normal priority          |
| QA verification | **MANDATORY**            |
| Regression test | **REQUIRED**             |
| Code review     | Optional (based on risk) |
| Documentation   | Bug report update        |

---

## Bugfix Handoff Sequence

### 1. PM Creates Bugfix ATP

```typescript
// From bug report
governance.atp_create({
  title: "Bugfix: [Bug Description]",
  type: "bugfix",
  sourceRef: "BUG-123", // Reference to bug report
  priority: "P2-Normal",
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P2-Normal",
  subject: "Bugfix: [Bug Description]",
  body: `## Bug Details
  
**Reported:** [Date]
**Reporter:** [Name]
**Severity:** [Level]

## Steps to Reproduce
1. ...
2. ...

## Expected vs Actual
- Expected: ...
- Actual: ...

## Acceptance Criteria
- [ ] Bug no longer reproducible
- [ ] Regression test added
- [ ] No new issues introduced
`,
});
```

### 2. Dev Fix + Regression Test

```typescript
// Complete with regression test evidence
governance.atp_set({
  atpId: "AT-XX-YY",
  status: "Complete",
  agent: "@dev",
  evidence: [
    "fix: src/module.ts:+15,-3",
    "test: tests/regression/bug-123.test.ts:+45",
    "run: npm test -- regression → PASS",
  ],
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P2-Normal",
  subject: "Handoff: AT-XX-YY - Bug Fixed",
  body: `## Bug Fixed with Regression Test

### Completed Work
- Fix implemented
- Regression test added

### Pending Work
- Route to QA
- QA verification
- Close

### Evidence
- fix: src/module.ts:+15,-3
- test: tests/regression/bug-123.test.ts:+45
- run: npm test -- regression → PASS`,
  requiresAck: false,
});
```

### 3. PM Routes to QA

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@qa",
  messageType: "QARequest",
  priority: "P2-Normal",
  subject: "QA Verification: Bugfix AT-XX-YY",
  body: `## Bug Fixed
  
Please verify:
1. Original bug no longer reproducible
2. Regression test passes
3. No new issues introduced

**Original Bug:** [Description]
**Fix Applied:** [Summary]
`,
});
```

### 4. QA Verification

```typescript
// If PASS
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@qa",
  toAgent: "@pm",
  messageType: "QAApproval",
  priority: "P2-Normal",
  subject: "✅ QA Passed: AT-XX-YY",
  body: "Bug verified fixed. No regressions found.",
});

// If FAIL
governance.bug_create({
  atpId: "AT-XX-YY",
  title: "Regression: [Description]",
  severity: "Medium",
  priority: "P2-Normal",
  foundBy: "@qa",
  assignTo: "@dev",
  description: "Issue found during verification...",
  stepsToReproduce: ["1. ...", "2. ..."],
  expected: "...",
  actual: "...",
});
```

### 5. PM Closes After QA Pass

```typescript
// Create PM Verification Report
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY",
  content: "... executive summary, quality score ...",
  persist: "both",
});

// Close ATP
governance.atp_change_status({
  atpId: "AT-XX-YY",
  status: "Closed",
});

// HITL notification
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  subject: "ATP Closed: AT-XX-YY",
  body: "Bug fixed and verified...",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE

**Closure ENDS your message.** Do NOT continue with next ATP in the same message.

---

## Quality Gates

| Gate            | Agent | Criteria                          |
| --------------- | ----- | --------------------------------- |
| Pre-directive   | @PM   | Bug well-defined, reproducible    |
| Pre-handoff     | @Dev  | Fix tested, regression test added |
| QA verification | @QA   | Bug fixed, no regressions         |
| Pre-closure     | @PM   | QA approved                       |

---

## When to Use

✅ Tracked bug reports
✅ Customer-reported issues
✅ QA-found defects
✅ Production bugs (non-critical)
✅ Any defect needing verification

---

## Regression Test Requirements

**Every bugfix MUST include:**

1. Test that reproduces the original bug
2. Test that verifies the fix
3. Test runs in CI pipeline

---

## Related Flows

- `atp-flow-hotfix` - For urgent production bugs
- `atp-flow-emergency` - For Sev-1 incidents
- `atp-flow-standard` - Normal development
