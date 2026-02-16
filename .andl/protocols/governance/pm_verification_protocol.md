---
id: pm-verification-protocol
name: PM ATP Verification Protocol
version: 1.0.0
category: governance
description: >-
  Comprehensive verification protocol for @PM when receiving handoff from @Dev.
  Defines the 4-Phase Workflow: Strategic Verification, Executive Summary,
  Authorization Decision, and Directive Issuance. Includes quality gates,
  AUTO-PROCEED criteria, and defect classification.
displayMode: on-demand
criticality: critical
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  @PM MUST load this protocol when receiving any handoff from @Dev.
  Governs how PM verifies work completion and decides next action.
triggerKeywords:
  - pm verification
  - handoff review
  - quality gate
  - auto-proceed
  - directive
  - acceptance
estimatedTokens: 2500
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
  pmOnly: true
---

# 📋 PM ATP VERIFICATION PROTOCOL

**Mandatory protocol for @PM when receiving handoff from @Dev.**

---

## 🎯 PURPOSE

When @Dev completes work and hands off to @PM, the PM MUST execute this verification protocol before:

- Accepting the ATP as complete
- Issuing the next directive
- Closing the ATP

**Core Principle:** Never relay developer claims without independent verification.

---

## 🔄 4-PHASE WORKFLOW (MANDATORY)

### Phase 1: Strategic Verification & Quality Gate

Execute all verification steps BEFORE proceeding:

#### 1.1 ATP Query (Mandatory First Step)

```typescript
// Always query ATP state first
governance.atp_get({ atpId: "AT-XX-YY" });
```

- Verify current status matches expected (should be Complete or awaiting review)
- Check stage progression is valid
- Note any blockers or issues logged

#### 1.2 Evidence Verification

| Check               | Action                                       | Tool                    |
| ------------------- | -------------------------------------------- | ----------------------- |
| Files changed       | Verify claimed files exist and were modified | `read_file`             |
| Acceptance criteria | Each criterion met with evidence             | Manual review           |
| Tests passing       | Verify test evidence provided                | Check handoff artifacts |
| Build success       | Verify build completed                       | Check handoff artifacts |
| **QA Engagement**   | Verify @QA tested (if required)              | Check ATP history       |

#### 1.2a QA Verification Gate (MANDATORY for code ATPs)

**BEFORE accepting any ATP with code changes:**

1. **Check if QA was engaged:**
   - Query ATP history for `stage: "test"` transition
   - Verify @QA message exists in ATP messages
2. **If QA was NOT engaged (and should have been):**
   - **DO NOT ACCEPT** - This is a process violation
   - Set status back to `InProgress`, stage to `test`
   - Send correction directive to @Dev to hand off to @QA

```typescript
// If code ATP received directly from @Dev without QA
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "CorrectionDirective",
  priority: "P1-High",
  subject: "QA Gate Missing: AT-XX-YY",
  body: `## Process Violation: QA Not Engaged

This ATP contains code changes but was not routed through @QA for testing.

### Required Actions
1. Hand off to @QA for testing by setting stage: "test"
2. Wait for @QA verification before returning to @PM

### Reference
See atp_lifecycle_core.md Section 3: Standard ATP Flow requires @Dev → @QA → @PM for code ATPs.`,
});
```

3. **QA Bypass Allowed Only When:**
   - ATP metadata has `skipQa: true`
   - Directive explicitly stated "skip QA"
   - ATP type is `documentation` or `configuration` (no code changes)

#### 1.3 Code Quality Assessment (Score 1-10)

| Dimension       | Weight | Questions                             |
| --------------- | ------ | ------------------------------------- |
| Correctness     | 30%    | Does it work? Edge cases handled?     |
| Maintainability | 25%    | Clean code? Good abstractions?        |
| Completeness    | 25%    | All criteria met? Documentation?      |
| Testing         | 20%    | Tests adequate? Coverage appropriate? |

**Scoring Guidelines:**

- **9-10:** Exceptional - exceeds requirements
- **7-8:** Good - meets all requirements
- **5-6:** Acceptable - meets minimum, has gaps
- **3-4:** Deficient - significant issues
- **1-2:** Unacceptable - major problems

#### 1.4 Defect Classification (Criticality Scale)

| Criticality | Category     | Action Required             |
| ----------- | ------------ | --------------------------- |
| 8-10        | **CRITICAL** | Block immediately, escalate |
| 5-7         | **MAJOR**    | Must fix before acceptance  |
| 3-4         | **MINOR**    | Should fix, can defer       |
| 1-2         | **TRIVIAL**  | Optional improvement        |

**Examples by Criticality:**

| Crit | Example                                |
| ---- | -------------------------------------- |
| 10   | Security vulnerability, data loss risk |
| 9    | Core functionality broken              |
| 8    | Acceptance criteria not met            |
| 7    | Missing error handling                 |
| 6    | Poor test coverage (<50%)              |
| 5    | Documentation incomplete               |
| 4    | Code style violations                  |
| 3    | Minor refactoring opportunity          |
| 2    | Naming suggestions                     |
| 1    | Formatting preferences                 |

#### 1.5 Issue Handling Policy (MANDATORY)

**NEVER ignore detected issues.** When PM discovers issues during verification, classify and handle them according to this policy:

##### Issue Classification

| Classification  | Definition                                                                                           | Examples                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **ATP-RELATED** | Issue directly impacts current ATP scope, acceptance criteria, or deliverables                       | Missing test coverage for ATP feature, incomplete acceptance criteria, broken functionality in ATP scope |
| **UNRELATED**   | Issue exists but is outside current ATP scope (pre-existing, different feature area, infrastructure) | Pre-existing test failures, dependency issues unrelated to ATP, code style in untouched files            |

##### Handling Protocol

**For ATP-RELATED Issues:**

1. **DO NOT ACCEPT** - Mark as REQUEST_CHANGES
2. **Send correction directive to @dev** with specific remediation steps
3. **Set criticality** using Section 1.4 scale
4. **Document in verification report** with clear acceptance criteria for fix

```typescript
// ATP-Related: Automatic correction directive
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "CorrectionDirective",
  priority: "P1-High",
  subject: "Remediation Required: [Issue Title]",
  body: `## Issue Detected During Verification

**Classification:** ATP-RELATED
**Criticality:** X/10

### Issue Description
[Clear description of the issue]

### Required Remediation
1. [Specific step 1]
2. [Specific step 2]

### Acceptance Criteria for Fix
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]`,
});
```

**For UNRELATED Issues:**

1. **DO NOT IGNORE** - Issues must still be addressed
2. **Raise HITL to @operator** with options and recommendation
3. **Continue ATP processing** while awaiting HITL response (non-blocking unless critical)

```typescript
// UNRELATED: Escalate to operator with options
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P2-Normal",
  subject: "Issue Detected (Unrelated to ATP): [Issue Title]",
  body: `## Issue Detected During ATP Verification

**Classification:** UNRELATED TO ATP
**Discovered During:** AT-XX-YY verification
**Impact on ATP:** None (ATP can proceed/close independently)

### Issue Description
[Clear description of the issue]

### Options for Resolution

**Option A: Create New ATP** (Recommended if Criticality ≥5)
- Create dedicated ATP to address this issue
- Prioritize appropriately in backlog
- Track separately from current work

**Option B: Defer to Backlog**
- Log issue in project backlog for future sprint
- Appropriate for Criticality 1-4 issues

**Option C: Immediate Fix** (Only if quick fix, <15 min)
- Create and assign micro-ATP
- Block current flow until resolved

### PM Recommendation
[PM's recommended option with rationale]

### Current ATP Status
[Whether current ATP will be approved/closed regardless of this decision]`,
});
```

##### Anti-Patterns

| ❌ NEVER                                          | ✅ ALWAYS                                |
| ------------------------------------------------- | ---------------------------------------- |
| Classify issue as "out of scope" and ignore       | Classify and escalate appropriately      |
| Document for "future resolution" without tracking | Create ATP or backlog entry for tracking |
| Assume unrelated issues will be caught later      | Raise HITL for operator decision         |
| Block ATP for unrelated issues without escalation | Allow ATP to proceed while HITL pending  |

---

### Phase 2: Executive Summary

**Generate concise summary for governance record:**

```markdown
## Verification Summary: AT-XX-YY

**Quality Score:** X/10
**Status:** APPROVED / REQUEST_CHANGES / BLOCKED

**What Accomplished:**

- [Key outcome 1]
- [Key outcome 2]

**Issues Found:** [Count by criticality]

- Critical: 0
- Major: 0
- Minor: X

**Risk Assessment:** LOW / MEDIUM / HIGH
```

**Brevity Rule:** If quality ≥8/10 with no issues → single-line attestation sufficient.

---

### Phase 3: Authorization Decision

#### AUTO-PROCEED Criteria (ALL must be true)

✅ Quality score ≥ 8/10
✅ No defects with criticality ≥ 5
✅ All acceptance criteria verified
✅ Evidence artifacts present
✅ Next task is LOW RISK (see below)
✅ No escalation or clarification needed

**If ALL criteria met → AUTO-PROCEED to Phase 4**

#### WAIT Criteria (ANY triggers WAIT)

❌ Quality score < 8/10
❌ Any defect with criticality ≥ 5
❌ Missing acceptance criteria evidence
❌ HIGH RISK next action
❌ Clarification needed from @operator
❌ Strategic decision required

**If ANY triggered → Report to @operator, await guidance**

#### Risk Classification for Next ATP

| LOW RISK          | HIGH RISK        |
| ----------------- | ---------------- |
| Additive changes  | Breaking changes |
| Reversible        | Irreversible     |
| Clear scope       | Ambiguous scope  |
| Independent       | Cross-cutting    |
| Standard patterns | Novel approaches |

---

### Phase 4: Directive Issuance (or Closure)

#### If APPROVED and Ready for Close:

**CRITICAL: Tool calls MUST be ACTUAL tool invocations, not text descriptions.**
Do NOT write "I will call governance.artifact_create..." - you MUST actually invoke the tool.

1. **Create PM Verification Report artifact (MANDATORY - MUST INVOKE):**

   **You MUST call this tool - do not just describe it:**

   ```typescript
   governance.artifact_create({
     atpId: 'AT-XX-YY',
     artifactType: 'PMVerificationReport',
     title: 'PM Verification Report: AT-XX-YY',
     content: `# PM Verification Report: AT-XX-YY
   ```

## Executive Summary

**Quality Score:** X/10
**Status:** ✅ APPROVED

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
| --------- | ------ | -------- |
| AC-1      | ✅ Met | [proof]  |

## Quality Assessment

- Correctness: X/10
- Maintainability: X/10
- Completeness: X/10
- Testing: X/10

## Defects Found

- Critical: 0
- Major: 0
- Minor: X

## Recommendation

APPROVED for closure.
`,
persist: 'both'
})

````

2. **Close current ATP (MUST INVOKE):**
```typescript
governance.atp_change_status({
  atpId: 'AT-XX-YY',
  status: 'Closed',
  stage: 'done'
})
````

3. **Send Completion Notification (READ-ONLY - NO EXECUTION - MUST INVOKE):**

   ```typescript
   governance.message_send({
     atpId: "AT-XX-YY",
     fromAgent: "@pm",
     toAgent: "@operator",
     messageType: "CompletionNotification", // NOT HITLNotification - this is informational only
     priority: "P3-Informational",
     subject: "ATP Closed: AT-XX-YY - Completion Notification",
     body: "Summary...",
   });
   ```

   **CRITICAL:** `CompletionNotification` messages are:
   - **READ-ONLY** - Operator can read but no execution allowed
   - **INFORMATIONAL** - Does NOT trigger HITL workflow
   - **TERMINAL** - This is the final message for this ATP

4. **STOP** - Do NOT send any further messages for this ATP. The ATP is now CLOSED and no further communication should occur on this ATP. Any acknowledgments or follow-up creates infinite loops.

5. **In NEXT orchestration turn:** If there is a next ATP in the UOW, issue directive for that ATP. Do NOT continue in the same message chain.

#### If REQUEST_CHANGES:

1. **Update status:**

   ```typescript
   governance.atp_change_status({
     atpId: "AT-XX-YY",
     status: "InProgress",
     stage: "implement",
     agent: "@pm",
   });
   ```

2. **Send correction directive:**
   ```typescript
   governance.message_send({
     atpId: "AT-XX-YY",
     fromAgent: "@pm",
     toAgent: "@dev",
     messageType: "CorrectionDirective",
     priority: "P1-High",
     subject: "Revisions Required: AT-XX-YY",
     body: "List of required changes...",
   });
   ```

---

## 📊 VERIFICATION CHECKLIST

Use this checklist for every verification:

```markdown
## PM Verification Checklist: AT-XX-YY

### 1. ATP State (MANDATORY)

- [ ] Queried ATP via governance.atp_get()
- [ ] Status is Complete or awaiting review
- [ ] No unresolved blockers

### 2. Evidence Review

- [ ] All claimed file changes verified
- [ ] Build evidence provided
- [ ] Test evidence provided

### 3. Acceptance Criteria

- [ ] Criterion 1: [Met/Not Met] - Evidence: \_\_\_
- [ ] Criterion 2: [Met/Not Met] - Evidence: \_\_\_
- [ ] Criterion 3: [Met/Not Met] - Evidence: \_\_\_

### 4. Quality Assessment

- [ ] Correctness: \_/10
- [ ] Maintainability: \_/10
- [ ] Completeness: \_/10
- [ ] Testing: \_/10
- [ ] **Overall: \_/10**

### 5. Defects Found

- [ ] Critical (8-10): 0
- [ ] Major (5-7): 0
- [ ] Minor (3-4): \_
- [ ] Trivial (1-2): \_

### 6. Decision

- [ ] AUTO-PROCEED (all criteria met)
- [ ] WAIT (report to operator)
- [ ] REQUEST_CHANGES (return to @dev)

### 7. Action Taken

- [ ] ATP closed (if approved)
- [ ] Completion notification sent (NOT HITL - informational only)
- [ ] STOPPED all communication for this ATP
- [ ] Next directive issued ONLY in separate orchestration turn
```

---

## 🔄 CODE REVIEW INTEGRATION (Optional)

**When UOW code review mode is enabled:**

### None (Default)

- PM verifies directly without @dev-supervisor

### High-Risk Only

- PM routes HIGH RISK ATPs to @dev-supervisor before acceptance
- HIGH RISK = any ATP with risk factors (see Phase 3)

### All ATPs

- Every ATP routed to @dev-supervisor before acceptance
- PM reviews @dev-supervisor feedback before decision

### Routing to @dev-supervisor

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev-supervisor",
  messageType: "ReviewRequest",
  priority: "P2-Normal",
  subject: "Code Review Request: AT-XX-YY",
  body: "Please review implementation for [ATP description]...",
});
```

---

## ⚠️ ANTI-PATTERNS

| ❌ Never Do                             | ✅ Always Do                         |
| --------------------------------------- | ------------------------------------ |
| Accept without verification             | Query ATP + read evidence            |
| Rely on dev claims alone                | Independent verification             |
| Skip quality scoring                    | Document quality assessment          |
| Auto-proceed on high-risk               | Evaluate risk before proceeding      |
| Close + issue directive in same message | Separate closure from next directive |
| Ignore minor issues                     | Log all issues for improvement       |
| **Send HITLNotification for closure**   | **Use CompletionNotification**       |
| **Continue messaging after ATP closed** | **STOP all comms for closed ATP**    |
| **Acknowledge closure notifications**   | **No response to closures needed**   |

---

## 📎 Related Protocols

- `atp-lifecycle` - Parent protocol for ATP state machine
- `team-raci` - Agent responsibilities matrix
- `code-review-protocol` - @dev-supervisor review process
- `hitl-escalation` - When to escalate to operator
