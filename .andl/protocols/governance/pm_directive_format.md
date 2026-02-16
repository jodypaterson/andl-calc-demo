---
id: pm-directive-format
name: PM Directive Generation Protocol
version: 2.0.0
category: governance
description: >-
  COMPREHENSIVE protocol for @PM when issuing initial directives to execution agents.
  A directive is the "beginning handoff" - it must contain ALL information needed
  to execute the ATP without clarifying questions. This protocol covers data fetching,
  pre-validation, memory assessment, custody management, status updates, handoff
  requirements, and escalation procedures.
displayMode: full
criticality: critical
isTopLevel: true
parentProtocol: sdlc-master
triggerDescription: >-
  MANDATORY when @PM is issuing an initial directive for an ATP.
  System provides only ATP ID - all other data fetched via tools.
triggerKeywords:
  - directive
  - issue directive
  - assign atp
  - pm directive
  - start work
  - begin implementation
advertisement: >-
  🚨 CRITICAL: Load this protocol BEFORE issuing ANY directive to @Dev or other agents.
  Use: fetch_protocol({ id: 'pm-directive-format' })
estimatedTokens: 5000
metadata:
  author: system
  createdAt: '2026-02-04'
  updatedAt: '2026-02-04'
---

# 🚨 PM DIRECTIVE GENERATION PROTOCOL v2.0

**This protocol is MANDATORY when @PM issues an initial directive for an ATP.**

A directive is the "beginning handoff" - it must contain ALL information the execution agent needs to complete the ATP without clarifying questions. If you issue a complete directive, normal ATP processing should be straightforward.

---

## 1. FETCH ATP DATA (MANDATORY FIRST STEP)

The system only provides the ATP ID. You MUST fetch full data via tools:

```typescript
// STEP 1: Get full ATP record
const atp = await governance.atp_get({ atpId: '<target-atp-id>' });

// STEP 2: Verify ATP exists
if (!atp) {
  // BLOCKER: Escalate to operator
  governance.message_send({
    toAgent: '@operator',
    messageType: 'Escalation',
    subject: `HITL: ATP ${atpId} not found`,
    body: 'Cannot issue directive - ATP does not exist in TCS. Verify ATP ID is correct.',
  });
  return; // HALT - do not proceed
}

// STEP 3: Extract key fields
const {
  id,
  title,
  status,
  stage,
  uowId,
  metadata: {
    project,
    phase,
    section,
    owner,
    assignedAgent,
    objective,
    context,
    problemStatement,
    solutionApproach,
    implementationSteps,
    filesToModify,
    existingCodeToReuse,
    dependencies,
    externalDependencies,
    acceptanceCriteria,
    executionConditions,
    exitConditions,
    testStrategy,
    buildCommand,
    testCommand,
    risk,
    riskMitigation,
    rollbackPlan,
    estimatedHours,
    priority,
  },
} = atp;
```

---

## 2. PRE-DIRECTIVE VALIDATION (BLOCKING)

**Complete ALL validation steps before generating directive.**

### 2.1 Status Validation

```typescript
// ATP must be in issuable state
const ISSUABLE_STATUSES = ['queued', 'backlog', 'planned', 'failed'];
if (!ISSUABLE_STATUSES.includes(atp.status)) {
  // Cannot issue directive for ATP already in progress
  governance.message_send({
    toAgent: '@operator',
    messageType: 'Escalation',
    subject: `HITL: ATP ${atp.id} in unexpected status: ${atp.status}`,
    body: `Cannot issue directive - ATP is already ${atp.status}. Expected one of: ${ISSUABLE_STATUSES.join(', ')}.`,
  });
  return; // HALT
}
```

### 2.2 Workspace Access Validation

```typescript
// Verify project is accessible using workspace tools
const projectPath = atp.metadata?.project || atp.metadata?.workLocation;

// Use file_search or grep_search to confirm paths exist
// Example: file_search({ query: `${projectPath}/**/package.json` })

// If project not accessible:
// - Check if it's an external repo (andl-core, andl-ai-client, etc.)
// - BLOCKER if project is completely inaccessible
```

### 2.3 Dependency Validation

```typescript
// Fetch and validate ALL dependencies
if (atp.dependencies && atp.dependencies.length > 0) {
  const incompleteDepList = [];

  for (const depId of atp.dependencies) {
    const dep = await governance.atp_get({ atpId: depId });

    if (!dep) {
      incompleteDepList.push(`${depId}: NOT FOUND`);
      continue;
    }

    // Dependencies must be closed/complete
    if (!['Closed', 'Complete'].includes(dep.status)) {
      incompleteDepList.push(`${depId}: ${dep.status} (expected Closed/Complete)`);
    }
  }

  if (incompleteDepList.length > 0) {
    // BLOCKER: Dependencies not complete
    governance.message_send({
      toAgent: '@operator',
      messageType: 'Escalation',
      subject: `HITL: ATP ${atp.id} has incomplete dependencies`,
      body: `Cannot issue directive - the following dependencies are not complete:\n${incompleteDepList.join('\n')}`,
    });
    return; // HALT
  }
}
```

### 2.4 Reality Check (Does ATP Still Align?)

**CRITICAL:** Before blindly issuing a directive, verify:

1. **Are implementation steps still accurate?**
   - Do files mentioned in `filesToModify` exist?
   - Have interfaces changed since ATP creation?
   - Use `file_search` and `grep_search` to validate

2. **Are acceptance criteria achievable?**
   - Given completed dependencies, can criteria be met?
   - Any new constraints discovered?

3. **Is the ATP still relevant?**
   - Has the codebase changed significantly?
   - Is there overlapping work in sibling ATPs?

```typescript
// If reality differs significantly from ATP definition:
// Option A: Minor adjustments - update ATP directly
governance.atp_set({
  atpId: atp.id,
  field: 'filesToModify',
  value: '<corrected list>',
});

// Option B: Major drift - escalate
governance.message_send({
  toAgent: '@operator',
  messageType: 'Escalation',
  subject: `HITL: ATP ${atp.id} requires re-planning`,
  body: 'ATP assumptions no longer valid because [specific reasons]. Recommend re-decomposition.',
});
```

---

## 3. MEMORY CONTEXT ASSESSMENT

Before issuing a directive, assess available context:

### 3.1 Sibling ATPs (Same UOW)

```typescript
// Understand work completed in this UOW
// This helps establish patterns and avoid redundant work
const siblings = await governance.atp_get({ uowId: atp.uowId });

// For each COMPLETED sibling:
// - What patterns were established?
// - Any learnings or warnings?
// - Does any work overlap with this ATP?
```

### 3.2 Short-Term Memory (STM)

Review recent conversation for:

- Relevant decisions or clarifications
- Operator instructions
- Context from recent executions

### 3.3 Long-Term Memory (LTM)

```typescript
// Search for relevant patterns
ltm_search({ query: `implementation patterns for ${atp.metadata?.project}` });
ltm_search({ query: `architecture decisions ${atp.metadata?.section}` });
```

### 3.4 Session Memory

Review session summaries for:

- Narrative arc of work completed
- Outstanding concerns or risks
- Established conventions

---

## 4. DETERMINE ATP FLOW TYPE

**Each ATP follows a specific flow. Document it in your directive.**

| ATP Type                   | Flow       | QA Required?  | Handoff Chain                |
| -------------------------- | ---------- | ------------- | ---------------------------- |
| Development (code changes) | Standard   | ✅ YES        | @PM → @Dev → @QA → @PM       |
| Documentation only         | Simplified | ❌ NO         | @PM → @Dev → @PM             |
| Configuration changes      | Simplified | ❌ NO         | @PM → @Dev → @PM             |
| Review/Analysis tasks      | Simplified | ❌ NO         | @PM → @Dev → @PM             |
| Hotfix (production issue)  | Hotfix     | 🔶 Fast-track | @PM → @Dev → @PM (expedited) |

---

## 5. GOVERNANCE & STATUS MANAGEMENT

### 5.1 Status Update Sequence

**BEFORE sending directive:**

```typescript
// Update ATP to InProgress/implement
governance.atp_change_status({
  atpId: atp.id,
  status: 'InProgress',
  stage: 'implement',
  agent: '@pm', // PM is transitioning status
});
```

### 5.2 🚨 ACK MESSAGE PROHIBITION (CRITICAL)

**NEVER request acknowledgment. NEVER send ACK messages.**

Per AD-20260203-01:

- Do NOT include `requiresAck: true`
- Do NOT say "please confirm receipt" or "awaiting acknowledgment"
- Do NOT expect the recipient to acknowledge before starting work
- **Silence = receipt. Action = response.**

**Correct pattern:**

1. @PM sends directive → DONE (end of @PM's turn)
2. @Dev receives → executes work → sends Handoff

### 5.3 Chain of Custody

Document the custody chain in every directive:

```markdown
### Chain of Custody

| Date                           | Agent   | Action           |
| ------------------------------ | ------- | ---------------- |
| [today]                        | @PM     | Directive issued |
| [prior dates from ATP history] | [agent] | [action]         |
```

---

## 6. DIRECTIVE FORMAT (MANDATORY STRUCTURE)

**Every directive MUST follow this exact structure.**

### 6.1 Length Guidance

**Target: ~3-5KB maximum.** Achieve this by:
- Reference policies instead of duplicating content
- Use `governance.atp_get({ atpId: "..." })` for full ATP details
- Only inject critical context directly (objective, acceptance criteria, key constraints)
- For code examples, implementation steps, dependencies: tell recipient to fetch via tools

### 6.2 Directive Template

````markdown
To: @[target-agent]
From: @pm
Subject: Directive: [ATP-ID] - [Title]
Priority: [P1-Critical | P2-High | P3-Normal | P4-Low]

---

## Validation ✅

Workspace: verified | Dependencies: [N] complete | Reality check: passed

---

## Summary

[One-line: WHAT this accomplishes and WHY it matters]

**Context:** [Brief - why this matters, relevant prior work]

---

## Ownership Transfer Flow

**This ATP follows the standard flow. Each transfer has a clear objective:**

| Step | From | To | Trigger | Objective | Policy Reference |
|------|------|-----|---------|-----------|------------------|
| 1 | @PM | @Dev | This directive | Implement the ATP per acceptance criteria | `pm-directive-format` |
| 2 | @Dev | @QA | Handoff (code changes) | Verify implementation meets criteria | `agent-handoff` |
| 3 | @QA | @PM | Test pass | Confirm quality gate passed | `agent-handoff` |
| 4 | @PM | — | Closure | ATP complete, notify operator | `pm-verification-protocol` |

**For docs/config only (no code):** Skip step 2-3, @Dev hands off directly to @PM.

**Policies define behavior.** Fetch on-demand: `fetch_protocol({ id: "<policy-id>" })`

---

## Task

**ATP:** [ID] - [Title]
**UOW:** [Parent UOW ID] - [UOW Title]
**Project:** [Target project] | **Work Location:** `[path]`

### Objective

[Clear, measurable objective - 1-2 sentences]

### Approach

[High-level approach - 1-2 sentences. Details via `governance.atp_get()`]

---

## Implementation

**Fetch full details:** `governance.atp_get({ atpId: "[ATP-ID]" })` → `filesToModify`, `implementationSteps`, `existingCodeToReuse`, `dependencies`

**Key constraints (if any):** [Only include critical constraints that MUST be highlighted]

---

## Acceptance Criteria

1. [Criterion 1 - objectively verifiable]
2. [Criterion 2]
...

**Full details:** `governance.atp_get({ atpId: "[ATP-ID]" })` → `acceptanceCriteria`, `testStrategy`

### Standard Exit Conditions

- [ ] All acceptance criteria met with evidence
- [ ] Build passes (⚠️ Use `vitest run` NOT `vitest`)
- [ ] No new lint errors

---

## Risk

**Level:** [Low | Medium | High] — [One-line rationale]

**Full risk details (if medium/high):** `governance.atp_get({ atpId: "[ATP-ID]" })` → `risk`, `riskMitigation`, `rollbackPlan`

---

## Next Steps (@[target-agent])

**Flow Type:** [Standard w/QA | Simplified | Hotfix]

1. `governance.atp_change_status({ atpId: "[id]", status: "InProgress", stage: "implement" })` ← **NO ACK MESSAGE**
2. Execute implementation (fetch full details: `governance.atp_get({ atpId: "[id]" })`)
3. Verify: build passes, tests pass (`vitest run`), no lint errors
4. Handoff per `agent-handoff` policy (fetch: `fetch_protocol({ id: "agent-handoff" })`)

**See Ownership Transfer Flow table above for what happens after your handoff.**

---

## Escalation

**Policies define escalation behavior:**
- Blockers: `fetch_protocol({ id: "error-recovery" })`
- HITL needed: `fetch_protocol({ id: "hitl-escalation" })`
- Handoff format: `fetch_protocol({ id: "agent-handoff" })`

**Quick reference:**
- Minor ambiguity → Make reasonable decision, document in handoff
- Major ambiguity → Escalate blocker to @PM
- Needs human input → Escalate HITL to @operator

---

## Recipient Rules (CRITICAL)

**On start:** Tool call ONLY - `governance.atp_change_status({ status: "InProgress" })` - **NO MESSAGE**

**Communication:** Exactly ONE message total:
- ✅ **Handoff** (on completion) OR **Blocker** (if stuck)
- ❌ **NEVER** ACK messages, progress updates, or "awaiting next directive"

**Silence = working. First message = done or blocked.**

**Full protocol:** `fetch_protocol({ id: "agent-handoff" })`

---

**ROUTING:** @[target-agent] | [ATP-ID]: [Title]

````

---

## 7. GOVERNANCE TOOL SEQUENCE (MANDATORY)

Execute these tools in order:

```typescript
// STEP 1: Fetch ATP data (already done in section 1)

// STEP 2: Complete validation (section 2)

// STEP 3: Update ATP status BEFORE sending directive
governance.atp_change_status({
  atpId: '<id>',
  status: 'InProgress',
  stage: 'implement',
  agent: '@pm'
});

// STEP 4: Send the directive
governance.message_send({
  atpId: '<id>',
  fromAgent: '@pm',
  toAgent: '@dev',  // or target agent
  messageType: 'Directive',
  priority: '<P1-P4>',
  subject: 'Directive: <ATP-ID> - <Title>',
  body: '<full directive content>'
});

// STEP 5: END YOUR MESSAGE
// - Do NOT send additional messages
// - Do NOT mention other ATPs
// - Do NOT say "awaiting acknowledgment"
````

---

## 8. QUALITY CHECKLIST (Pre-Send)

Before sending, verify:

- [ ] ATP data fetched via `governance.atp_get()`
- [ ] Status validated (ATP is in issuable state)
- [ ] Workspace access confirmed
- [ ] All dependencies verified complete
- [ ] Reality check performed (ATP still valid)
- [ ] Memory context reviewed
- [ ] Flow type determined and documented
- [ ] ATP status updated to InProgress/implement
- [ ] Directive follows exact format structure
- [ ] Acceptance criteria are objectively verifiable
- [ ] Verification commands use `vitest run` (not `vitest`)
- [ ] Escalation/clarification guidance included
- [ ] No acknowledgment requested
- [ ] No mention of other ATPs
- [ ] Single message - no follow-ups

---

## 9. COMMON MISTAKES TO AVOID

### ❌ Issuing Without Fetching Data

**Wrong:** Assume data from template injection is current
**Right:** Always fetch via `governance.atp_get()` to ensure current state

### ❌ Missing Validation

**Wrong:** Blindly issue directive without checking dependencies
**Right:** Complete ALL validation steps in section 2

### ❌ Ambiguous Acceptance Criteria

**Wrong:** "Feature works correctly"
**Right:** "API returns 200 for valid input, 400 for invalid, with specific error codes"

### ❌ Requesting Acknowledgment

**Wrong:** `requiresAck: true` or "please confirm receipt"
**Right:** Send directive, done. Silence = receipt.

### ❌ Multiple ATPs

**Wrong:** "After this, you'll work on AT-02..."
**Right:** One ATP per directive. Period.

### ❌ Using `vitest` Instead of `vitest run`

**Wrong:** "Run tests: `vitest`" (starts watch mode, hangs terminal)
**Right:** "Run tests: `vitest run`" (single run, exits cleanly)

---

## 10. RELATIONSHIP TO OTHER PROTOCOLS

| Protocol                   | Relationship                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `atp-lifecycle-core`       | Defines status/stage transitions; includes ACK prohibition (§8.1.1) |
| `agent-handoff`            | Directive is a "beginning handoff" - similar structure              |
| `pm-verification-protocol` | Used AFTER receiving completion handoff                             |
| `atp-flow-standard`        | Defines the flow type documented in directive                       |
| `error-recovery`           | Used if validation discovers blocking issues                        |
| `hitl-escalation`          | Used when human operator input required                             |

---

## Advertisement

> 🚨 **CRITICAL FOR @PM:** Before issuing ANY directive:
>
> ```
> fetch_protocol({ id: 'pm-directive-format' })
> ```
>
> This protocol ensures complete, actionable directives that enable straightforward ATP execution.

---

_End of PM Directive Generation Protocol v2.0_
