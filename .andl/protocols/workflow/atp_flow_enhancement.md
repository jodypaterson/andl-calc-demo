---
id: atp-flow-enhancement
name: Enhancement ATP Flow
version: 1.0.0
category: workflow
description: >-
  Flow for new feature development. Includes @dev-supervisor code review
  as standard, thorough QA verification, and documentation requirements.
  Used for all new capability additions.
displayMode: on-demand
criticality: normal
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  On-demand policy. Load when implementing new features, capabilities,
  or significant enhancements to existing functionality.
triggerKeywords:
  - enhancement
  - feature
  - new feature
  - capability
  - improvement
estimatedTokens: 650
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
---

# ✨ ENHANCEMENT ATP FLOW

**Feature development flow with code review and comprehensive verification.**

---

## State Transition Table

| #   | From State        | To State          | Agent           | Trigger                | Conditional             |
| --- | ----------------- | ----------------- | --------------- | ---------------------- | ----------------------- |
| 1   | (backlog)         | Queued            | @PM             | Feature prioritized    | -                       |
| 2   | Queued            | InProgress        | @PM             | Sprint planning        | -                       |
| 3   | InProgress        | InProgress        | @Dev            | Receive directive      | -                       |
| 4   | InProgress        | Blocked           | @Dev            | Question/dependency    | -                       |
| 5   | Blocked           | InProgress        | @PM             | Clarification provided | -                       |
| 6   | InProgress        | Complete          | @Dev            | Feature done           | -                       |
| 7   | Complete          | In Review         | @PM             | Route to review        | Always for enhancements |
| 8   | In Review         | Changes Requested | @dev-supervisor | Issues found           | If issues               |
| 9   | Changes Requested | InProgress        | @Dev            | Address feedback       | Loop to #6              |
| 10  | In Review         | Reviewed          | @dev-supervisor | Approved               | -                       |
| 11  | Reviewed          | In QA             | @PM             | Route to QA            | Always for enhancements |
| 12  | In QA             | QA Failed         | @QA             | Tests fail             | If failures             |
| 13  | QA Failed         | In QA             | @QA             | QA fixes minor issue   | Minor fix loop          |
| 14  | QA Failed         | Escalated         | @QA             | Fundamental issue      | Need Dev/HITL           |
| 15  | Escalated         | InProgress        | @PM             | Route to Dev           | Loop to #6              |
| 16  | Escalated         | HITL              | @PM             | Need human decision    | Escalate                |
| 17  | In QA             | Verified          | @QA             | All tests pass         | -                       |
| 18  | Verified          | Closed            | @PM             | Final approval         | -                       |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│              ENHANCEMENT ATP FLOW (with QA Iteration)           │
└──────────────────────────────────────────────────────────────────┘

┌─────────┐   ┌────────┐   ┌────────────┐   ┌──────────┐
│ Backlog │──▶│ Queued │──▶│ InProgress │──▶│ Complete │
└─────────┘   └────────┘   └────────────┘   └──────────┘
                  │              │  ▲              │
                  │ @PM          │  │              │ @PM routes
                  │ prioritizes  │  │              │ to review
                  │              ▼  │              │
                  │         ┌─────────┐            ▼
                  │         │ Blocked │      ┌───────────┐
                  │         └─────────┘      │ In Review │◄────┐
                  │              │           │ @dev-supv │     │
                  │              │           └───────────┘     │
                  │              │                │            │
                  │              │         APPROVE│    CHANGES │
                  │              │                │            │
                  │              │                ▼            │
                  │              │           ┌──────────┐      │
                  │              │           │ Reviewed │      │
                  │              │           └──────────┘      │
                  │              │                │            │
                  │              │                ▼            │
                  │              │           ┌──────────┐      │
                  │              │           │  In QA   │◄──┐  │
                  │              │           └──────────┘   │  │
                  │              │              │   │       │  │
                  │              │         PASS │   │ FAIL  │  │
                  │              │              │   │       │  │
                  │              │              │ ┌─┴───┐   │  │
                  │              │              │ │MINOR│───┘  │
                  │              │              │ │FIX  │QA    │
                  │              │              │ │loop │fixes │
                  │              │              │ └─────┘      │
                  │              │              │   │          │
                  │              │              │ ESCALATE     │
                  │              │              │   │          │
                  │              │              │   ▼          │
                  │              │              │┌────────┐    │
                  │              │              ││ DEV FIX│────┘
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

| Aspect          | Enhancement Behavior               |
| --------------- | ---------------------------------- |
| Queue           | Normal priority                    |
| Code review     | **STANDARD** (via @dev-supervisor) |
| QA verification | **MANDATORY**                      |
| Documentation   | **REQUIRED**                       |
| Demo            | Recommended                        |

---

## Enhancement Handoff Sequence

### 1. PM Creates Enhancement ATP

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P2-Normal",
  subject: "Enhancement: [Feature Name]",
  body: `## Feature Specification

**Goal:** [What this feature accomplishes]

**User Story:** As a [user], I want [capability] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Documentation updated
- [ ] Tests added

## Technical Approach
[High-level design guidance]

## Out of Scope
- [What NOT to include]
`,
});
```

### 2. Dev Implements Feature

```typescript
// On completion
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P2-Normal",
  subject: "Handoff: AT-XX-YY - Feature Complete",
  body: `## Feature Implemented with Tests

### Completed Work
- All acceptance criteria met
- Tests passing

### Pending Work
- Code review
- QA verification
- Close

### Evidence
- demo: [link or instructions]
- docs: docs/feature.md
- tests: tests/feature.test.ts`,
  requiresAck: false,
});
```

### 3. PM Routes to Code Review

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev-supervisor",
  messageType: "ReviewRequest",
  priority: "P2-Normal",
  subject: "Code Review: Enhancement AT-XX-YY",
  body: `## Feature Review Request

**Feature:** [Name]
**Changed Files:** [List]

## Review Focus
- Architectural fit
- Code quality
- Test coverage
- Documentation completeness

## Acceptance Criteria
[List from directive]
`,
});
```

### 4. Dev-Supervisor Reviews

```typescript
// Review completed
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev-supervisor",
  toAgent: "@pm",
  messageType: "ReviewComplete",
  priority: "P2-Normal",
  subject: "Review Complete: AT-XX-YY",
  body: `## Code Review: [Feature Name]

### Summary
**Decision:** APPROVE / REQUEST_CHANGES

### Quality Scores
- Correctness: 9/10
- Maintainability: 8/10
- Test Coverage: 8/10
- Documentation: 9/10

### Findings
[List of issues or positive observations]

### Recommendations
[Suggestions for improvement]
`,
});
```

### 5. PM Routes to QA

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@qa",
  messageType: "QARequest",
  priority: "P2-Normal",
  subject: "QA Verification: Enhancement AT-XX-YY",
  body: `## Feature Verification

**Feature:** [Name]
**Review Status:** Approved by @dev-supervisor

## Test Scenarios
1. [Happy path]
2. [Edge cases]
3. [Error conditions]

## Acceptance Criteria
[List to verify]
`,
});
```

### 6. PM Closes

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
  body: "Feature implemented, reviewed, and verified...",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE

**Closure ENDS your message.** Do NOT continue with next ATP in the same message.

---

## Quality Gates

| Gate            | Agent           | Criteria                     |
| --------------- | --------------- | ---------------------------- |
| Pre-directive   | @PM             | Feature well-specified       |
| Pre-handoff     | @Dev            | All criteria met, tests pass |
| Code review     | @dev-supervisor | Quality ≥8/10                |
| QA verification | @QA             | All scenarios pass           |
| Pre-closure     | @PM             | Review + QA approved         |

---

## Documentation Requirements

**Every enhancement MUST include:**

1. Updated README if public API changes
2. CHANGELOG entry
3. Inline code documentation
4. Usage examples (if applicable)

---

## When to Use

✅ New features
✅ Significant capability additions
✅ Major refactoring
✅ New integrations
✅ User-facing changes

---

## Related Flows

- `atp-flow-standard` - Simple changes
- `atp-flow-bugfix` - Defect fixes
- `atp-flow-documentation` - Docs-only
