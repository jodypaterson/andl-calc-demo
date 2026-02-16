---
id: atp-flow-standard
name: Standard ATP Flow
version: 3.0.0
category: workflow
description: >-
  Default flow for normal ATP execution. Includes PM assessment for QA needs,
  optional code review gate, QA test execution with iteration cycles, and
  full verification before closure. All handoff examples include enhanced 
  context: flow context, chain of custody, expected actions, transition rationale,
  and disagreement handling reminders.
displayMode: full
criticality: normal
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  Always active. Default flow for all ATPs unless overridden by specific
  flow type (hotfix, bugfix, emergency, etc.).
triggerKeywords:
  - standard flow
  - normal flow
  - default flow
  - atp execution
estimatedTokens: 2000
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-02-03"
---

# 🔄 STANDARD ATP FLOW (v2.0)

**Default execution pattern with QA integration and optional code review.**

---

## Configuration Options (Set at UOW Level)

| Option           | Values                             | Description                               |
| ---------------- | ---------------------------------- | ----------------------------------------- |
| `codeReviewMode` | `none` / `high-risk-only` / `all`  | Whether to include @dev-supervisor review |
| `qaRequired`     | `always` / `pm-decision` / `never` | Whether QA testing is required            |

**Default:** `codeReviewMode: none`, `qaRequired: pm-decision`

---

## State Transition Table (Full Flow)

| #   | From State        | To State          | Agent           | Trigger             | Tool                                                                     | Conditional           |
| --- | ----------------- | ----------------- | --------------- | ------------------- | ------------------------------------------------------------------------ | --------------------- |
| 1   | Queued            | InProgress        | @PM             | Start ATP           | `governance.atp_change_status`, `message_send`                           | -                     |
| 2   | InProgress        | InProgress        | @Dev            | Receive directive   | `message_ack`                                                            | -                     |
| 3   | InProgress        | Blocked           | @Dev            | Hit blocker         | `governance.atp_change_status`                                           | -                     |
| 4   | Blocked           | InProgress        | @Dev            | Blocker resolved    | `governance.atp_change_status`                                           | -                     |
| 5   | InProgress        | Complete          | @Dev            | Work done           | `governance.atp_change_status`, `handoff`                                | -                     |
| 6   | Complete          | In Review         | @PM             | Route to review     | `message_send`                                                           | If codeReview enabled |
| 7   | In Review         | Changes Requested | @dev-supervisor | Issues found        | `message_send`                                                           | If issues             |
| 8   | Changes Requested | InProgress        | @Dev            | Address feedback    | `governance.atp_change_status`                                           | Loop to #5            |
| 9   | In Review         | Reviewed          | @dev-supervisor | Approved            | `message_send`                                                           | -                     |
| 10  | Complete/Reviewed | PM Assessment     | @PM             | Assess QA needs     | Internal                                                                 | -                     |
| 11  | PM Assessment     | In QA             | @PM             | QA required         | `governance.atp_change_status`, `message_send`                           | If QA needed          |
| 12  | PM Assessment     | Verified          | @PM             | QA not required     | `artifact_create` (PM Verification Report)                               | Skip to #20           |
| 13  | In QA             | QA Testing        | @QA             | Run test scripts    | Test tools                                                               | -                     |
| 14  | QA Testing        | QA Failed         | @QA             | Tests fail          | `message_send`                                                           | If failures           |
| 15  | QA Failed         | QA Testing        | @QA             | QA fixes issue      | Test tools                                                               | Minor fix loop        |
| 16  | QA Failed         | Escalated         | @QA             | Fundamental issue   | `message_send`                                                           | Need Dev/HITL         |
| 17  | Escalated         | InProgress        | @PM             | Route to Dev        | `governance.atp_change_status`, `message_send`                           | Loop to #5            |
| 18  | Escalated         | HITL              | @PM             | Need human decision | `message_send`                                                           | Escalate              |
| 19  | QA Testing        | Verified          | @QA             | All tests pass      | `artifact_create` (QA Test Report), `message_send`                       | -                     |
| 20  | Verified          | Closed            | @PM             | Final approval      | `artifact_create` (PM Verification), `atp_change_status`, `message_send` | -                     |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STANDARD ATP FLOW (with QA & Optional Code Review)        │
└──────────────────────────────────────────────────────────────────────────────┘

  ┌────────┐      ┌────────────┐      ┌──────────┐
  │ Queued │─────▶│ InProgress │─────▶│ Complete │
  └────────┘      └────────────┘      └──────────┘
      │                │  ▲                 │
      │ @PM            │  │                 │
      │ issues         ▼  │                 ▼
      │ directive ┌─────────┐    ┌─────────────────────┐
      │           │ Blocked │    │ Code Review Needed? │
      │           └─────────┘    └─────────────────────┘
      │                │               │          │
      │                │          YES  │          │ NO
      │                │               ▼          │
      │                │         ┌───────────┐    │
      │                │         │ In Review │◄───┤
      │                │         │ @dev-supv │    │
      │                │         └───────────┘    │
      │                │           │      │       │
      │                │    CHANGES│      │APPROVE│
      │                │           ▼      │       │
      │                │     ┌──────────┐ │       │
      │                │     │ Back to  │ │       │
      │                │     │   Dev    │─┘       │
      │                │     └──────────┘         │
      │                │           │              │
      │                │           ▼              ▼
      │                │    ┌─────────────────────────┐
      │                │    │   PM: QA Assessment     │
      │                │    │ (Write test scripts?)   │
      │                │    └─────────────────────────┘
      │                │         │             │
      │                │    QA NEEDED     QA NOT NEEDED
      │                │         │             │
      │                │         ▼             │
      │                │    ┌──────────┐       │
      │                │    │  In QA   │       │
      │                │    │  @qa     │       │
      │                │    └──────────┘       │
      │                │         │             │
      │                │    ┌────┴────┐        │
      │                │    ▼         ▼        │
      │                │  PASS      FAIL       │
      │                │    │         │        │
      │                │    │    ┌────┴────┐   │
      │                │    │    ▼         ▼   │
      │                │    │  QA FIX   ESCALATE
      │                │    │  (loop)      │   │
      │                │    │    │         │   │
      │                │    │    │    ┌────┴───┴───┐
      │                │    │    │    ▼            ▼
      │                │    │    │  DEV FIX      HITL
      │                │    │    │  (loop)        │
      │                │    │    │    │           │
      │                │    ▼    ▼    │           │
      │                │ ┌──────────┐ │           │
      │                │ │ Verified │◄┘           │
      │                │ └──────────┘             │
      │                │      │                   │
      │                │      ▼                   │
      │                │ ┌──────────┐             │
      └────────────────┴▶│  Closed  │◄────────────┘
                         └──────────┘
```

---

## Handoff Sequences

### 1. PM → Dev (Directive)

```typescript
// Use governance.atp_change_status for safe status updates
governance.atp_change_status({
  atpId: "AT-XX-YY",
  status: "InProgress",
  stage: "implement",
  agent: "@pm",
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P2-Normal",
  subject: "Directive: AT-XX-YY - [Feature Title]",
  body: `## Directive: @pm → @dev

### Flow Context
This ATP was created during planning for UOW [X]. You are receiving this because
the planning phase is complete and implementation is required.

**Chain of Custody:**
1. @PM - Created ATP, planning complete (today)
2. → @Dev - **YOU ARE HERE** - Implementation phase

### What's Expected of You
Implement the feature according to the acceptance criteria below. When complete,
run the test suite, ensure build passes, and hand back to @PM for QA assessment.

**Your exit criteria:** All acceptance criteria met, tests pass, handoff to @PM.

### Transition Rationale
I'm assigning this to @Dev because the requirements are defined and implementation
can begin. You have the technical expertise to build this feature correctly.

## Acceptance Criteria
[List specific, measurable criteria]

## Technical Context
[Relevant architecture notes, related files, dependencies]

## Configuration
- Code Review: \${codeReviewMode}
- QA Mode: \${qaRequired}

### Disagreement Reminder
- Minor: Make reasonable adjustments, document in your handoff
- Medium: Ask me for clarification before significant deviation
- Significant: Escalate immediately before proceeding
`,
});
```

### 2. Dev → PM (Handoff)

```typescript
// Use governance.atp_change_status for safe status updates
governance.atp_change_status({
  atpId: "AT-XX-YY",
  status: "Complete",
  stage: "review",
  agent: "@dev",
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P2-Normal",
  subject: "Handoff: AT-XX-YY - [Feature] Complete",
  body: `## Handoff: @dev → @pm

### Flow Context
I (@dev) received this ATP from @PM after the planning phase. My role was to 
implement the feature according to the acceptance criteria in the directive.
This is the standard ATP flow: PM (planning) → Dev (implementation) → now 
handing back for QA assessment.

**Chain of Custody:**
1. @PM - Created ATP, issued directive (YYYY-MM-DD)
2. @Dev - Implementation complete (today)
3. → @PM - **YOU ARE HERE** - QA assessment & routing

### Completed Work
- All acceptance criteria met
- Unit tests added and passing
- [Specific files modified]

### What's Expected of You
Assess whether QA testing is required for this ATP. If QA is needed, route to 
@QA with test requirements. If no QA needed (documentation only, minor config),
proceed to verification and closure.

**Your exit criteria:** ATP routed to @QA or verified and closed.

### Transition Rationale
I'm handing back to @PM because implementation is complete. Per the standard 
flow, @PM makes the QA assessment decision - determining whether this change
requires QA validation before closure.

### Pending Work
- PM QA assessment decision
- QA testing (if required)
- Final verification and closure

### Evidence
- Build passes
- Tests pass

### Disagreement Reminder
- Minor: Fix yourself, inform next agent
- Medium: Ask me for clarification
- Significant: Escalate to @PM`,
  requiresAck: false,
});
```

### 3. PM → @dev-supervisor (Code Review) _If Enabled_

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev-supervisor",
  messageType: "ReviewRequest",
  priority: "P2-Normal",
  subject: "Code Review: AT-XX-YY",
  body: `## Review Request
  
**Changed Files:** [List]
**Risk Level:** [Low/Medium/High]

Please assess:
- Code quality and maintainability
- Architectural alignment
- Test coverage adequacy
`,
});
```

### 4. PM QA Assessment Decision

**After code review (if enabled) or directly after Dev handoff:**

```typescript
// PM evaluates:
// 1. Does this ATP affect existing functionality?
// 2. Are integration tests needed?
// 3. Should QA write new test scripts?
// 4. Is regression testing required?

// If QA needed:
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@qa",
  messageType: "QARequest",
  priority: "P2-Normal",
  subject: "QA Testing: AT-XX-YY - [Feature Title]",
  body: `## Handoff: @pm → @qa

### Flow Context
This ATP was created by me (@pm) and assigned to @Dev for implementation.
@Dev has completed implementation and handed back. I've assessed that this
change requires QA validation before closure.

**Chain of Custody:**
1. @PM - Created ATP, issued directive
2. @Dev - Implementation complete
3. @PM - QA assessment: validation required
4. → @QA - **YOU ARE HERE** - Test and validate

### What's Expected of You
Validate the implementation meets acceptance criteria. Run appropriate tests:
integration, regression, and any new test scripts needed. If all passes, hand
back to @PM for closure. If issues found, either fix minor ones yourself or
escalate fundamental issues.

**Scope:**
- [ ] Write test scripts for new functionality
- [ ] Integration tests
- [ ] Regression testing

**Your exit criteria:** All tests pass, QA Test Report created, handed to @PM.

### Transition Rationale
I'm handing to @QA because @Dev's implementation is complete and this change
affects functionality that requires independent validation. @QA has the
expertise to verify correctness from a user/system perspective.

### Context for Testing
**Test Plan Integration:** Add tests to: [test plan location]
**Changed Areas:** [List of affected functionality]
**Risk Areas:** [Any specific areas to focus on]

### Disagreement Reminder
- Minor: Fix yourself, inform @PM in your handoff
- Medium: Ask me for clarification before proceeding
- Significant: Escalate to me immediately for resolution
`,
});
```

### 5. QA Test Execution & Iteration

```typescript
// QA runs test scripts
// If tests fail:

// Option A: QA can fix (minor issue)
// QA iterates and fixes, re-runs tests

// Option B: Fundamental issue - escalate to PM
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@qa",
  toAgent: "@pm",
  messageType: "QAEscalation",
  priority: "P1-High",
  subject: "⚠️ QA Escalation: AT-XX-YY",
  body: `## Test Failure Escalation

**Issue Type:** Fundamental / Cannot self-fix
**Failed Tests:** [List]
**Root Cause Analysis:** [Description]

**Recommendation:**
- [ ] Route back to @Dev for fix
- [ ] HITL decision required

**Evidence:**
[Test output, screenshots, logs]
`,
});
```

### 6. PM Escalation Handling

```typescript
// Option A: Route to Dev
governance.atp_change_status({
  atpId: "AT-XX-YY",
  status: "InProgress",
  stage: "implement",
  agent: "@pm",
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "CorrectionDirective",
  priority: "P1-High",
  subject: "Fix Required: AT-XX-YY (QA Escalation)",
  body: `## QA-Identified Issues

[Issues from QA escalation]

## Required Fixes
1. ...
2. ...

After fixes, flow returns to Dev handoff → QA testing cycle.
`,
});

// Option B: HITL Escalation
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLEscalation",
  priority: "P0-Critical",
  subject: "🚨 HITL Required: AT-XX-YY",
  body: `## Human Decision Required

**Issue:** [Description]
**Options Analyzed:** [List with trade-offs]
**PM Recommendation:** [If any]
**Awaiting:** Human guidance to proceed
`,
});
```

### 7. QA Pass → Artifact & Closure

```typescript
// QA confirms all tests pass - CREATE QA TEST REPORT ARTIFACT
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "QATestReport",
  title: "QA Test Report: AT-XX-YY",
  content: `# QA Test Report: AT-XX-YY

## Summary
**ATP:** AT-XX-YY - [Title]
**QA Agent:** @qa
**Date:** ${new Date().toISOString()}
**Result:** ✅ PASSED

## Test Results

| Test Category | Tests Run | Passed | Failed | Coverage |
|--------------|-----------|--------|--------|----------|
| Unit Tests   | X         | X      | 0      | Y%       |
| Integration  | X         | X      | 0      | -        |
| Regression   | X         | X      | 0      | -        |

## Test Scripts Added
- [List of new test scripts created]

## Test Plan Updated
- Location: [test plan path]
- Changes: [What was added/modified]

## Iteration History
- Run 1: [Pass/Fail - details]
- Run 2: [Pass/Fail - details if applicable]

## Notes
[Any observations, edge cases discovered, etc.]
`,
  persist: "both", // Store in TCS and file
});

// Notify PM with enhanced context
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@qa",
  toAgent: "@pm",
  messageType: "QAApproval",
  priority: "P2-Normal",
  subject: "✅ QA Passed: AT-XX-YY",
  body: `## Handoff: @qa → @pm

### Flow Context
I (@qa) received this ATP from @PM after @Dev completed implementation. My role 
was to validate the implementation meets acceptance criteria and run the test suite.

**Chain of Custody:**
1. @PM - Created ATP, issued directive
2. @Dev - Implementation complete
3. @PM - Routed to QA for validation
4. @QA - Testing complete (today)
5. → @PM - **YOU ARE HERE** - Final verification & closure

### Completed Work
- Ran full test suite (unit, integration, regression)
- All tests passing
- Created QA Test Report artifact

**Test Results:**
- Unit tests: ✅ Pass
- Integration tests: ✅ Pass  
- Regression tests: ✅ Pass

### What's Expected of You
Review the QA Test Report and verify acceptance criteria are met. If satisfied,
close the ATP with a PM Verification Report. If issues found, route appropriately.

**Your exit criteria:** ATP closed with PM Verification Report, or issues escalated.

### Transition Rationale
I'm handing back to @PM because QA validation is complete and all tests pass.
Per the standard flow, @PM performs final verification and closes the ATP.

### Pending Work
- PM final verification
- Closure with verification report

**Artifact Created:** QA Test Report saved to TCS

### Disagreement Reminder
- Minor: Fix yourself, inform next agent
- Medium: Ask me for clarification
- Significant: Escalate within PM responsibilities
`,
});
```

### 8. PM Verification → Artifact & Closure

```typescript
// PM completes verification - CREATE PM VERIFICATION REPORT ARTIFACT
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY",
  content: `# PM Verification Report: AT-XX-YY

## Executive Summary
**ATP:** AT-XX-YY - [Title]
**PM Agent:** @pm
**Date:** ${new Date().toISOString()}
**Verification Result:** ✅ APPROVED

## Strategic Assessment
- **Phase Alignment:** [How this advances phase goals]
- **Decoupling Progress:** [Impact on architectural goals]
- **Quality Score:** X/10

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| AC-1      | ✅ Met | [Link/proof] |
| AC-2      | ✅ Met | [Link/proof] |
| AC-3      | ✅ Met | [Link/proof] |

## Quality Gates Passed

| Gate | Agent | Result |
|------|-------|--------|
| Code Complete | @dev | ✅ Pass |
| Code Review | @dev-supervisor | ✅ Pass / N/A |
| QA Testing | @qa | ✅ Pass / N/A |
| PM Verification | @pm | ✅ Pass |

## Code Review Summary (if applicable)
- Reviewer: @dev-supervisor
- Quality Score: X/10
- Findings: [Summary]

## QA Summary (if applicable)
- Tests Run: X
- Coverage: Y%
- Regressions: None

## Risk Assessment
- Risk Level: [Low/Medium/High]
- Mitigations: [Applied mitigations]

## Lessons Learned
- [Insight 1]
- [Insight 2]

## Recommendation
APPROVED for closure.
`,
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
  body: "Summary of accomplishments...",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE (MANDATORY)

**CRITICAL: Closure ENDS your message. Do NOT continue.**

After closing an ATP:

1. ✅ Report the closure summary
2. ✅ Confirm artifacts generated
3. ✅ **END THE MESSAGE**

**NEVER do these after closing an ATP:**

- ❌ Issue directive for the next ATP
- ❌ Start planning the next work item
- ❌ Discuss what's coming next
- ❌ Any content about a different ATP

**Pattern:**

```
Message N:   Close AT-01-01 → END
Message N+1: Issue directive for AT-01-02
```

**Why:** Each ATP has its own governance lifecycle. Mixing ATPs breaks audit trails and creates governance state ambiguity.

---

## Mandatory Artifacts

| Artifact Type              | Created By | When Created                       | Persist Mode        |
| -------------------------- | ---------- | ---------------------------------- | ------------------- |
| **QA Test Report**         | @QA        | On QA pass (step 19)               | `both` (TCS + file) |
| **PM Verification Report** | @PM        | On verification complete (step 20) | `both` (TCS + file) |
| **Completion Report**      | @PM        | On ATP close (step 20)             | `both` (TCS + file) |

---

## Quality Gates

| Gate          | Agent           | Criteria                                | Conditional              |
| ------------- | --------------- | --------------------------------------- | ------------------------ |
| Pre-directive | @PM             | ATP well-defined, criteria clear        | Always                   |
| Pre-handoff   | @Dev            | All criteria met, unit tests pass       | Always                   |
| Code Review   | @dev-supervisor | Quality ≥8/10, no major issues          | If codeReviewMode ≠ none |
| QA Assessment | @PM             | Determine if QA testing needed          | Always                   |
| QA Testing    | @QA             | All test scripts pass, no regressions   | If QA required           |
| Pre-closure   | @PM             | All gates passed, verification complete | Always                   |

---

## Iteration Cycles

### QA Self-Fix Cycle

```
QA runs tests → Fail (minor) → QA fixes → Re-run → Pass ✅
                              ↳ Fail (still minor) → QA fixes → Re-run → ...
```

### Dev Fix Cycle (Escalated)

```
QA Fail (fundamental) → PM → Dev → Dev fixes → Dev handoff →
  → [Code Review if enabled] → PM QA Assessment → QA Testing → ...
```

### HITL Cycle

```
QA Fail (fundamental) → PM → HITL Escalation → Operator decision →
  → Dev fix / Scope change / Accept as-is → Continue flow
```

---

## When to Use

✅ Normal development work
✅ Standard feature implementation  
✅ Routine changes with potential regression risk
✅ Configuration changes
✅ Test additions

---

## PM QA Assessment Criteria

**QA IS LIKELY NEEDED when:**

- ATP modifies existing functionality
- Changes affect integration points
- Risk of regression to other features
- New user-facing functionality
- Security-related changes

**QA MAY BE SKIPPED when:**

- Pure documentation changes
- Internal refactoring with existing test coverage
- Trivial changes (typos, comments)
- Already extensively unit tested

---

## Related Flows

- `atp-flow-bugfix` - For tracked defects (QA always required)
- `atp-flow-enhancement` - For new features (code review + QA standard)
- `atp-flow-documentation` - For docs-only (simplified, no QA)
