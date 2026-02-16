---
id: atp-lifecycle
name: ATP Lifecycle Policy (Reference)
version: 2.1.0
category: governance
description: >-
  REFERENCE DOCUMENT: Complete ATP lifecycle details including flow diagrams,
  agent responsibilities, artifact templates, and TCS integration. For core rules
  use atp-lifecycle-core (always active). Fetch this on-demand for detailed guidance.
displayMode: summary
criticality: high
isTopLevel: false
parentProtocol: atp-lifecycle-core
triggerDescription: >-
  ON-DEMAND reference for detailed ATP flows, agent responsibilities, artifact
  templates, and advanced lifecycle scenarios. Use atp-lifecycle-core for essential rules.
triggerKeywords:
  - atp flow details
  - agent responsibilities
  - artifact template
  - completion report
  - bug report template
  - workflow level
  - atp reference
estimatedTokens: 6000
metadata:
  author: system
  createdAt: "2026-01-11"
  updatedAt: "2026-01-27"
---

# 🔄 ATP LIFECYCLE POLICY (v2.0 - Tool-Driven)

**Single authoritative source for tool-driven ATP workflow execution across all agents.**

---

## 📜 1. Overview

This policy governs the complete lifecycle of Atomic Task Packages (ATPs) from creation to closure. All operations use **governance tools** that automatically:

- Persist state changes to TCS database
- Create audit trail for orchestrator automation
- Generate required artifacts (Completion Reports, Bug Reports)
- Synchronize governance state

All agents MUST follow this policy when:

- Creating, executing, or closing ATPs
- Transitioning work between agents
- Updating status (via `governance.atp_change_status` - PREFERRED, or `governance.atp_set`)
- Generating completion reports (via `governance.atp_close`)
- Creating artifacts (via `governance.artifact_create`)

**Authority:** This policy supersedes conflicting guidance in other protocols. When in doubt, follow this policy.

**Key Principle:** No manual file edits for governance. Tools handle all state persistence.

---

## 📦 1.1 STATUS UPDATE TOOLS

**PREFERRED: Use `governance.atp_change_status` for status/stage updates.**

| Tool                           | Purpose                            | When to Use                                |
| ------------------------------ | ---------------------------------- | ------------------------------------------ |
| `governance.atp_change_status` | **SAFE** status/stage updates only | Status transitions, stage changes          |
| `governance.atp_set`           | Full ATP update with metadata      | Complex updates with notes, evidence, etc. |

**Why prefer `atp_change_status`?**

- Validates status/stage values (rejects invalid inputs)
- Simpler interface (fewer parameters to get wrong)
- Clear error messages for common mistakes (e.g., using "Complete" as stage)

---

## 🛠️ 1.2 GOVERNANCE TOOLS ARE MANDATORY (BLOCKING)

**CRITICAL: Tools are NOT optional. Agents MUST use governance tools.**

### Never Say "Tools Unavailable"

❌ **PROHIBITED:** "Governance tools are not available in this environment"
❌ **PROHIBITED:** "Manual tracking required since tools unavailable"
❌ **PROHIBITED:** "This closure is documented inline"
❌ **PROHIBITED:** Any inline/manual governance instead of tool calls

### Required Behavior

✅ **Call the tools.** If a tool fails, report the error.
✅ **All status changes** → `governance.atp_change_status()` (preferred) or `governance.atp_set()`
✅ **All closures** → `governance.atp_close()`
✅ **All messages/handoffs** → `governance.message_send()` (use `messageType: 'Handoff'` for handoffs)
✅ **All artifacts** → `governance.artifact_create()`
✅ **All tool errors** → `governance.issue_log()` (see §1.3 Issue Log)

### Tool Failure Handling

If a tool call fails:

1. Log the error using `governance.issue_log({ category: 'tool_failure', ... })`
2. Report the specific error message
3. Do NOT proceed with manual/inline governance
4. Escalate the tool failure to @operator if persistent

**Rationale:** Manual governance creates audit gaps, breaks orchestrator automation, and causes Cockpit UI desync.

---

## 📋 1.3 ISSUE LOG (MANDATORY)

**Every ATP MUST maintain an Issue Log tracking tool errors, blockers, and problems.**

### When to Log Issues

- ❗ **Tool call fails** - Any governance or workspace tool error
- ❗ **Build/test/lint fails** - Command execution errors
- ❗ **Work blocked** - External dependency or configuration issue
- ❗ **Scope deviation** - Discovered additional work needed
- ❗ **Retry/workaround used** - Non-standard execution path

### Issue Log Tool Usage

```typescript
// Log an issue
governance.issue_log({
  action: "add",
  atpId: "AT-XX-YY",
  issue: {
    category: "tool_failure", // tool_failure|build_failure|test_failure|blocker|scope_deviation|governance_issue|other
    severity: "error", // info|warning|error|critical
    source: "governance.atp_change_status",
    summary: "Failed to update ATP status",
    details: "Error: Connection timeout after 30s",
  },
});

// Resolve an issue
governance.issue_log({
  action: "resolve",
  atpId: "AT-XX-YY",
  issueId: "ISSUE-001",
  resolution: {
    status: "workaround", // resolved|workaround|escalated|deferred
    action: "Retried after 5 seconds, succeeded",
  },
});
```

### Issue Log at Closure

The Issue Log is compiled as a closure artifact. If ANY issues were logged, @operator receives a HITL notification.

**See:** `governance/protocols/issue_log.md` for complete Issue Log specification.

---

## � 1.3 CONTINUOUS POLICY DISCOVERY (MANDATORY)

**Agents MUST continuously check if additional on-demand policies are needed during execution.**

### On-Demand Policy Triggers

| Situation                         | Policy to Fetch            | How to Fetch                                         |
| --------------------------------- | -------------------------- | ---------------------------------------------------- |
| Risk level ≥4 or uncertainty >50% | `hitl-escalation`          | `fetch_protocol({ id: 'hitl-escalation' })`          |
| Error during execution            | `error-recovery`           | `fetch_protocol({ id: 'error-recovery' })`           |
| Creating bug report               | `defect-reporting`         | `fetch_protocol({ id: 'defect-reporting' })`         |
| Agent transition                  | `agent-handoff`            | `fetch_protocol({ id: 'agent-handoff' })`            |
| Deferring work                    | `deferral-backlog`         | `fetch_protocol({ id: 'deferral-backlog' })`         |
| PM verification & closure         | `pm-verification-protocol` | `fetch_protocol({ id: 'pm-verification-protocol' })` |

### Policy Discovery Workflow

**At directive receipt:**

1. Review policy requirements in directive
2. Fetch all listed on-demand policies immediately
3. Read and internalize requirements before starting work

**During execution:**

1. When encountering a trigger situation, STOP
2. Check if corresponding policy has been fetched
3. If not, fetch it: `fetch_protocol({ id: 'policy-id' })`
4. Apply policy guidance before proceeding

**At closure:**

1. Fetch `pm-verification-protocol` policy
2. Follow 4-phase verification workflow
3. Create PM Verification Report artifact

### Listing Available Policies

To discover all available on-demand policies:

```typescript
orchestrator.protocol_list({
  category: "workflow", // or 'sdlc', 'governance', 'coding', 'safety'
  displayMode: "on-demand", // filter to on-demand only
});
```

### Policy Fetch Is Blocking

**If you need a policy and cannot fetch it:**

1. Log via `governance.issue_log({ category: 'governance_issue', ... })`
2. Escalate to @pm with blocker report
3. Do NOT proceed without required policy guidance

---

## 🔄 2. STATUS vs STAGE: Two Orthogonal Dimensions

**CRITICAL: STATUS and STAGE are DIFFERENT concepts. They track different things and have different valid values.**

### 2.1 What's the Difference?

| Dimension  | Purpose                | Question It Answers                                | Valid Values                                                                    |
| ---------- | ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| **STATUS** | Task workflow state    | "What's happening to this task right now?"         | `Queued`, `InProgress`, `Blocked`, `Complete`, `Rejected`, `Closed`, `Deferred` |
| **STAGE**  | SDLC pipeline position | "Where is this task in the development lifecycle?" | `backlog`, `plan`, `implement`, `review`, `test`, `done`                        |

### 2.2 Why Need Both?

They're orthogonal dimensions that enable different views and analytics:

| Situation                            | STATUS     | STAGE       | What This Means         |
| ------------------------------------ | ---------- | ----------- | ----------------------- |
| Task in backlog, not started         | Queued     | backlog     | Waiting to be planned   |
| PM planning the task                 | InProgress | plan        | Actively being designed |
| Dev actively coding                  | InProgress | implement   | Code being written      |
| Dev finished coding, awaiting review | Complete   | implement   | Ready to move to review |
| Reviewer actively reviewing          | InProgress | review      | Code review in progress |
| Review done, awaiting tests          | Complete   | review      | Ready to move to test   |
| QA actively testing                  | InProgress | test        | Tests being run         |
| Tests passed, awaiting finalization  | Complete   | test        | Ready to finalize       |
| Work blocked by dependency           | Blocked    | (any stage) | Bottleneck visible      |
| All done, merged and closed          | Complete   | done        | Truly finished          |

**Key Insight:** A task can be `InProgress` at ANY stage. A task can be `Complete` but NOT in stage `done`.

### 2.3 Why This Matters

| Use Case                 | Which Dimension | Example                                                                 |
| ------------------------ | --------------- | ----------------------------------------------------------------------- |
| **Kanban Board**         | STAGE           | Group tasks by `backlog`, `implement`, `review`, `test`, `done` columns |
| **Workload View**        | STATUS          | Filter to `InProgress` to see who's actively working                    |
| **Bottleneck Detection** | Both            | Many `Complete` + `review` = code review bottleneck                     |
| **Blocker Dashboard**    | STATUS          | All `Blocked` tasks need attention regardless of stage                  |
| **Time Metrics**         | STAGE           | Measure time-in-stage to find slow pipeline phases                      |

### 2.4 Stage ↔ SDLC Mapping

| SDLC Phase (Policy) | Database Stage | When to Set                     |
| ------------------- | -------------- | ------------------------------- |
| (Not started)       | `backlog`      | Task created, not yet scheduled |
| Analyze + Plan      | `plan`         | Requirements and planning work  |
| Develop             | `implement`    | Code being written              |
| Code Review         | `review`       | PR created, awaiting/in review  |
| QA                  | `test`         | Testing phase                   |
| Finalize + Closure  | `done`         | Complete and closed             |

---

## 🔄 2.5 ATP Status State Machine

STATUS values control task workflow. All transitions MUST be recorded in TCS.

```
┌──────────────────────────────────────────────────────────────────┐
│                     STATUS STATE TRANSITIONS                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌────────┐     ┌────────────┐     ┌──────────┐                │
│   │ Queued │ ──▶ │ InProgress │ ──▶ │ Complete │                │
│   └────────┘     └────────────┘     └──────────┘                │
│        │               │                  │                      │
│        │               ▼                  ▼                      │
│        │          ┌─────────┐       ┌────────┐                  │
│        │          │ Blocked │       │ Closed │                  │
│        │          └─────────┘       └────────┘                  │
│        │               │                                         │
│        ▼               ▼                                         │
│   ┌──────────┐   ┌──────────┐                                   │
│   │ Deferred │   │ Rejected │                                   │
│   └──────────┘   └──────────┘                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.6 Status Definitions

| Status         | Owner    | Description                                |
| -------------- | -------- | ------------------------------------------ |
| **Queued**     | @PM      | ATP defined, waiting to be picked up       |
| **InProgress** | @Dev/@QA | Active work underway                       |
| **Blocked**    | Any      | Work halted pending external input         |
| **Complete**   | @Dev     | Work for current stage finished            |
| **Rejected**   | @PM      | Verification failed, returned for rework   |
| **Closed**     | @PM      | Verified and closed with completion report |
| **Deferred**   | @PM      | Postponed to future phase/sprint           |

---

## ⚠️ 2.7 CLOSURE REQUIREMENTS (CRITICAL)

**An ATP is ONLY considered properly closed when BOTH fields are set correctly:**

| Field    | Required Value | Description                         |
| -------- | -------------- | ----------------------------------- |
| `status` | `Closed`       | Terminal workflow state             |
| `stage`  | `done`         | Terminal SDLC position (lowercase!) |

### 2.7.1 Valid vs Invalid Closure States

| status       | stage     | Valid? | Problem                                     |
| ------------ | --------- | ------ | ------------------------------------------- |
| `Closed`     | `done`    | ✅ YES | Correctly closed                            |
| `Closed`     | `backlog` | ❌ NO  | Stage not updated - appears in wrong column |
| `Closed`     | `review`  | ❌ NO  | Stage not updated - misleading pipeline     |
| `Complete`   | `done`    | ❌ NO  | Status should be Closed for terminal        |
| `InProgress` | `done`    | ❌ NO  | Status indicates active work                |

### 2.7.2 Tool Closure Validation (BOTH FIELDS REQUIRED)

**The `governance.atp_change_status` tool REQUIRES both fields for closure:**

To close an ATP, you MUST provide BOTH `status="Closed"` AND `stage="done"`.
If only one field is provided, the tool returns an error with instructions.

**Correct closure (BOTH fields):**

```javascript
// ✅ CORRECT - Both fields provided:
governance.atp_change_status({
  atpId: "918",
  status: "Closed",
  stage: "done",
  agent: "@pm",
});
// Result: status='done', stage='done' ✅
```

**Incorrect closure (will return error):**

```javascript
// ❌ WRONG - Missing stage (returns INCOMPLETE_CLOSURE error):
governance.atp_change_status({ atpId: "918", status: "Closed", agent: "@pm" });
// Error: "INCOMPLETE CLOSURE: You provided status="Closed" but did NOT provide stage="done"..."

// ❌ WRONG - Missing status (returns INCOMPLETE_CLOSURE error):
governance.atp_change_status({ atpId: "918", stage: "done", agent: "@pm" });
// Error: "INCOMPLETE CLOSURE: You provided stage="done" but did NOT provide status="Closed"..."
```

**If tool returns error:** You MUST:

1. Report the error using `governance.issue_log()`
2. Retry with BOTH fields correctly set

### 2.7.3 Agent Closure Permissions

| Agent | Can Close ATPs? | Notes                                            |
| ----- | --------------- | ------------------------------------------------ |
| @Dev  | ❌ NO           | Only sets `Complete` + `implement`, hands to @PM |
| @QA   | ❌ NO           | Only sets `Complete` + `test`, hands to @PM      |
| @PM   | ✅ YES          | Only agent who can set `Closed` + `done`         |

### 2.7.4 Verification Checklist

Before considering an ATP closed, verify:

- [ ] `status = 'done'` in database
- [ ] `stage = 'done'` in database
- [ ] PMVerificationReport artifact created
- [ ] HITL notification sent to @operator
- [ ] ATP disappears from active Kanban columns

---

## 📋 3. Workflow Levels

ATPs are classified by risk/complexity level which determines required reviews and gates.

| Level | Name      | Stages                       | Reviews Required                      | HITL Gate  |
| ----- | --------- | ---------------------------- | ------------------------------------- | ---------- |
| **1** | Trivial   | analyze→plan→dev→finalize    | Dev supervisor critique               | No         |
| **2** | Standard  | analyze→plan→dev→qa→finalize | Dev supervisor + QA critique          | No         |
| **3** | Sensitive | analyze→plan→dev→qa→finalize | PM plan + Dev + QA + PM finalize      | No         |
| **4** | Critical  | analyze→plan→dev→qa→finalize | Architect + Human plan + full reviews | PM gate    |
| **5** | All-Hands | analyze→plan→dev→qa→finalize | Full reviews + quorum 3               | Human gate |

### 3.1 Level Heuristics

| Level | Examples                                                  |
| ----- | --------------------------------------------------------- |
| 1     | Typos, documentation, comments, formatting                |
| 2     | Bug fixes, isolated features, new tests                   |
| 3     | Cross-component changes, new dependencies, config changes |
| 4     | Schema migrations, API changes, security-related          |
| 5     | Breaking changes, data migrations, auth/authz changes     |

---

## 🎭 4. Agent Responsibilities

### 4.1 @PM (Product Manager)

| Phase       | Responsibilities                                       | Required Tools            |
| ----------- | ------------------------------------------------------ | ------------------------- |
| **Create**  | Define ATP with acceptance criteria, assign risk level | `governance.atp_create`   |
| **Assign**  | Issue directive to @Dev with full context              | `governance.message_send` |
| **Monitor** | Track progress, unblock issues                         | `governance.atp_set`      |
| **Verify**  | Review completion evidence, approve/reject             | `governance.atp_verify`   |
| **Close**   | Generate completion report, update governance          | `governance.atp_close`    |

#### 4.1.1 PM Directive Issuance Sequence (MANDATORY)

**When @PM issues a directive to @Dev, MUST follow this sequence:**

```
1. Call governance.atp_set({ atpId: 'AT-XX-YY', status: 'InProgress' })
2. Call governance.message_send({ fromAgent: '@pm', toAgent: '@dev', messageType: 'Directive', ... })
3. Provide full acceptance criteria and context in directive body
```

**NEVER issue directive without updating status to InProgress first.**

**Rationale:**

- Cockpit UI shows ATP in correct state
- Metrics track time-in-InProgress accurately
- Orchestrator knows work is active

#### 4.1.2 Stale ATP Detection & Closure (MANDATORY)

**When @PM prepares to issue a directive but discovers the work is already complete:**

This situation occurs when:

- ATP was created during planning without checking codebase state
- Work was completed in a previous session but ATP not closed
- Another agent completed the work without proper handoff

**Detection Triggers:**

- Pre-directive file/code validation shows acceptance criteria already met
- Tests already passing for the ATP's scope
- Artifacts already exist that satisfy requirements

**⚠️ STALENESS DETECTED = FETCH ON-DEMAND PROTOCOL**

When staleness is detected, you MUST:

```
1. STOP directive preparation immediately
2. FETCH the stale closure protocol:
   fetch_protocol({ id: 'atp-stale-closure' })
3. FOLLOW the protocol step-by-step (4 mandatory steps)
4. ENSURE all messages have To/From/Subject headers
```

**On-Demand Protocol:** `atp-stale-closure`

The protocol defines:

- Self-notification message (audit trail)
- PM Verification workflow
- ATP closure via tools
- HITL notification to operator

**NEVER issue directive to @Dev for a stale ATP. ALWAYS fetch and follow the protocol.**

### 4.2 @Dev (Developer)

| Phase        | Responsibilities                      | Required Tools                                  |
| ------------ | ------------------------------------- | ----------------------------------------------- |
| **Receive**  | Acknowledge directive, verify context | `governance.message_ack`                        |
| **Start**    | Update status to InProgress           | `governance.atp_set`                            |
| **Execute**  | Implement per acceptance criteria     | ReAct loop                                      |
| **Block**    | Report blockers with recovery plan    | `governance.atp_set`, `governance.message_send` |
| **Complete** | Handoff with evidence                 | `governance.message_send`, `governance.atp_set`      |

### 4.3 @QA (Quality Assurance)

| Phase       | Responsibilities                     | Required Tools            |
| ----------- | ------------------------------------ | ------------------------- |
| **Review**  | Validate against acceptance criteria | Test tools                |
| **Report**  | Create bug reports if defects found  | `governance.bug_create`   |
| **Approve** | Sign off on quality gates            | `governance.message_send` |

### 4.4 @dev-supervisor (Senior Technical Reviewer)

| Phase       | Responsibilities                         | Required Tools            |
| ----------- | ---------------------------------------- | ------------------------- |
| **Receive** | Accept review request from @PM           | Read-only file access     |
| **Analyze** | Deep code review with quality assessment | `analysis.impact`, etc.   |
| **Report**  | Provide structured review with findings  | `governance.message_send` |

**Note:** @dev-supervisor has **READ-ONLY tools** - cannot modify files.

---

## 🧪 4.45 TESTING PLAN VERIFICATION (MANDATORY)

**CRITICAL: Before issuing ANY implementation directive, PM MUST verify testing infrastructure exists.**

**Reference:** `governance/protocols/QA_INFRASTRUCTURE_POLICY.md` §10-11

### 4.45.1 Testing Plan Discovery Protocol

**PM MUST check for testing-plan.md BEFORE issuing implementation directives:**

1. **Check locations:**
   - `docs/testing-plan.md` (preferred)
   - `tests/TESTING_PLAN.md` (alternate)
   - `.andl/testing-plan.md` (workspace-level)

2. **Verify infrastructure exists:**
   - `tests/fixtures/` directory present
   - Test configuration file exists (vitest.config.ts, jest.config.js)
   - At least one test file exists

3. **Check ATP has testStrategy field**

### 4.45.2 Routing Decision Matrix

| Testing Plan? | testStrategy? | PM Action                                        |
| ------------- | ------------- | ------------------------------------------------ |
| ✅ YES        | ✅ YES        | Issue directive to @dev with QA routing section  |
| ✅ YES        | ❌ NO         | Add testStrategy to ATP, then issue directive    |
| ❌ NO         | Any           | **ROUTE TO @qa FIRST** for testing plan creation |

### 4.45.3 When Testing Plan Missing: Route to @qa

**If NO testing-plan.md exists for the project:**

1. **DO NOT issue implementation directive to @dev**
2. **Create QA Setup Directive to @qa:**

```markdown
To: @qa
From: @pm
Subject: Directive: Create Comprehensive Testing Plan for UOW {ID}

## Context

UOW {ID} has ATPs ready for implementation, but NO testing-plan.md exists.
Before implementation can proceed, you must establish the testing foundation.

## Required Actions

1. Read the FULL UOW description and all planned ATPs
2. Research testing best practices for this technology stack
3. Create docs/testing-plan.md with:
   - Testing Architecture section
   - Test Data Strategy section
   - ATP Coverage Matrix (all ATPs mapped to test locations)
   - CI/CD Integration section
4. Scaffold test infrastructure:
   - Create tests/fixtures/ with factory functions
   - Configure vitest/jest
   - Create sample test file demonstrating patterns

## Acceptance Criteria

- docs/testing-plan.md exists and covers all planned ATPs
- tests/fixtures/index.ts exports test data factories
- Test configuration file valid (passes dry run)
- At least one sample test passing

## Reference

- Policy: governance/protocols/QA_INFRASTRUCTURE_POLICY.md
```

3. **Wait for @qa completion** before issuing @dev directives
4. **Update ATP registry** with QA setup task

### 4.45.4 Post-Implementation QA Routing (MANDATORY)

**When @dev completes and hands off to @pm:**

1. **PM MUST NOT proceed directly to closure for implementation ATPs**
2. **Issue QA Test Execution Directive to @qa:**

```markdown
To: @qa
From: @pm
Subject: Directive: Execute Tests for ATP {ID}

## Context

@dev has completed implementation of ATP {ID}: {title}.
Your task is to execute and verify tests per the testing plan.

## Implementation Summary

{Brief summary from @dev handoff}

## Testing Requirements

1. Run existing tests: `{test command}`
2. Verify coverage meets threshold: ≥80%
3. If tests insufficient, write additional tests per testing-plan.md
4. Verify all acceptance criteria are testable

## Expected Deliverables

- All tests passing
- Coverage report showing ≥80% on new code
- QA Test Report artifact created
- Any issues documented as bug reports

## Reference

- Testing plan: docs/testing-plan.md §{section}
```

3. **Wait for @qa test results**
4. **If @qa finds issues:** Route back to @dev → fix → back to @qa
5. **If @qa approves:** Proceed with PM verification and closure

### 4.45.5 QA Iteration Loop

| Issue Type                       | QA Action              | Routing                    |
| -------------------------------- | ---------------------- | -------------------------- |
| Minor test fix (typo, assertion) | QA fixes directly      | Continue testing           |
| Coverage gap (<5 tests)          | QA writes tests        | Continue testing           |
| Implementation bug               | Create bug report      | Escalate to @pm → @dev     |
| Fundamental design issue         | Escalate with analysis | @pm routes to @dev or HITL |

---

## � 4.46 ADHOC ATP CREATION (IN-FLIGHT)

**When an agent discovers additional work is needed during ATP execution, they may create adhoc ATPs.**

This section defines the MANDATORY requirements for adhoc ATP creation to ensure proper dependency tracking, execution ordering, and full lifecycle management.

### 4.46.1 When to Create Adhoc ATPs

**Valid Reasons for Adhoc ATP Creation:**

- 🔧 **Prerequisite discovered** - Current ATP cannot complete without unplanned work
- 🐛 **Bug discovered** - Issue found that is blocking but outside current ATP scope
- 📦 **Scope expansion** - Additional work discovered that must complete for ATP success
- 🔗 **Dependency chain** - Work that the current ATP now depends on

**Invalid Reasons (Do NOT create adhoc ATP):**

- ❌ "Nice to have" improvements - defer to backlog
- ❌ Future enhancements - log in deferral backlog
- ❌ Unrelated cleanup - out of scope

### 4.46.2 MANDATORY Adhoc ATP Requirements

**When any agent creates an ATP during execution of another ATP, MUST include:**

| Field          | Requirement                                         | Example                                          |
| -------------- | --------------------------------------------------- | ------------------------------------------------ |
| `dependencies` | MUST include the creating ATP's ID                  | `["AT-01.05"]` (if created from AT-01.05)        |
| `phase`        | MUST match the creating ATP's phase                 | `"P1-Core"` (same as parent ATP)                 |
| `notes`        | MUST reference creating ATP and reason for creation | `"Adhoc from AT-01.05: prerequisite discovered"` |

### 4.46.3 Adhoc ATP Creation Tool Call

```typescript
// When executing AT-01.05 and discovering additional work needed:
governance.atp_create({
  title: "Fix Schema Validation Before Parser",
  type: "adhoc",
  // MANDATORY: Include the current ATP as a dependency
  dependencies: ["AT-01.05"],
  // MANDATORY: Same phase as the current ATP
  phase: "P1-Core",
  // MANDATORY: Reference the creating ATP
  notes:
    "Adhoc from AT-01.05: Schema validation must be fixed before parser can proceed",
  // Standard fields
  owner: "@dev",
  estimatedHours: 2,
  risk: "low",
  acceptanceCriteria: [
    "Schema validation handles edge case X",
    "Unit tests cover new validation logic",
  ],
});
```

### 4.46.4 Adhoc ATP Lifecycle

**Adhoc ATPs follow the FULL lifecycle - no shortcuts:**

1. **Creation** → Status: `Queued`, Stage: `planning`
2. **Assignment** → PM issues directive (or agent continues if authorized)
3. **Execution** → Agent implements per acceptance criteria
4. **Verification** → PM or QA verifies completion
5. **Closure** → Generate completion report, update governance

**NEVER bypass lifecycle steps for adhoc ATPs.** They require the same rigor as planned ATPs.

### 4.46.5 Adhoc ATP Execution Ordering

**Adhoc ATPs with dependency on current ATP:**

- The adhoc ATP BLOCKS the current ATP's completion
- Current ATP status should update to reflect blocking dependency
- Adhoc ATP must complete BEFORE current ATP can close

**Parallel Execution (if possible):**

- If adhoc ATP is truly parallel work, do NOT set dependency
- Document in notes why parallel execution is safe

### 4.46.6 Adhoc ATP Reporting

**When creating adhoc ATP, agent MUST immediately notify PM:**

```typescript
governance.message_send({
  atpId: "AT-01.05", // Current ATP
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "ScopeChange",
  subject: "Adhoc ATP Created: AT-01.06 (Prerequisite for AT-01.05)",
  body: `
During execution of AT-01.05, discovered that schema validation has a bug
that blocks parser implementation. Created adhoc ATP AT-01.06 to address.

**Impact:** AT-01.05 now depends on AT-01.06.
**Estimated Additional Time:** 2 hours
**Risk:** Low - isolated fix, no breaking changes.
`,
});
```

---

## �🔄 4.5 ANDL PROCESS FLOWS

This section defines the core ANDL value proposition: **orchestrated agent handoffs** with clear state transitions, verification gates, and audit trails.

### 4.5.1 Flow Types Overview

| Flow Type             | Description                                                         | When Used                    |
| --------------------- | ------------------------------------------------------------------- | ---------------------------- |
| **Standard**          | Full flow with optional code review + PM QA assessment + QA testing | Default for all ATPs         |
| **Standard + Review** | Standard with mandatory code review gate                            | High-risk ATPs or UOW opt-in |
| **Hotfix**            | Expedited fix for production issue                                  | Production incidents         |
| **Bugfix**            | Standard bug resolution with mandatory QA                           | Reported defects             |
| **Enhancement**       | Feature addition with code review + QA                              | New capabilities             |
| **Documentation**     | Docs-only changes (simplified)                                      | Documentation work           |
| **Emergency**         | Critical production fix                                             | Severity 1 incidents         |

**Configuration Options (Set at UOW Level):**

| Option           | Values                             | Default       | Description                     |
| ---------------- | ---------------------------------- | ------------- | ------------------------------- |
| `codeReviewMode` | `none` / `high-risk-only` / `all`  | `none`        | Include @dev-supervisor review? |
| `qaRequired`     | `always` / `pm-decision` / `never` | `pm-decision` | Include QA testing?             |

---

### 4.5.2 Standard ATP Flow (Default)

The standard flow includes:

- Optional code review gate (if `codeReviewMode` enabled)
- PM assessment to determine if QA testing needed
- QA test writing and execution (if required)
- QA iteration loop (QA can self-fix minor issues)
- Escalation path for fundamental issues

**State Transition Table:**

| #   | From State        | To State          | Agent           | Trigger             | Conditional           |
| --- | ----------------- | ----------------- | --------------- | ------------------- | --------------------- |
| 1   | Queued            | InProgress        | @PM             | Start ATP           | -                     |
| 2   | InProgress        | InProgress        | @Dev            | Receive directive   | -                     |
| 3   | InProgress        | Blocked           | @Dev            | Hit blocker         | -                     |
| 4   | Blocked           | InProgress        | @Dev            | Blocker resolved    | -                     |
| 5   | InProgress        | Complete          | @Dev            | Work done           | -                     |
| 6   | Complete          | In Review         | @PM             | Route to review     | If codeReview enabled |
| 7   | In Review         | Changes Requested | @dev-supervisor | Issues found        | If issues             |
| 8   | Changes Requested | InProgress        | @Dev            | Address feedback    | Loop to #5            |
| 9   | In Review         | Reviewed          | @dev-supervisor | Approved            | -                     |
| 10  | Complete/Reviewed | PM Assessment     | @PM             | Assess QA needs     | -                     |
| 11  | PM Assessment     | In QA             | @PM             | QA required         | If QA needed          |
| 12  | PM Assessment     | Verified          | @PM             | QA not required     | Skip to #17           |
| 13  | In QA             | QA Testing        | @QA             | Run test scripts    | -                     |
| 14  | QA Testing        | QA Failed         | @QA             | Tests fail          | If failures           |
| 15  | QA Failed         | QA Testing        | @QA             | QA fixes issue      | Minor fix loop        |
| 16  | QA Failed         | Escalated         | @QA             | Fundamental issue   | Need Dev/HITL         |
| 17  | Escalated         | InProgress        | @PM             | Route to Dev        | Loop to #5            |
| 18  | Escalated         | HITL              | @PM             | Need human decision | Escalate              |
| 19  | QA Testing        | Verified          | @QA             | All tests pass      | -                     |
| 20  | Verified          | Closed            | @PM             | Final approval      | -                     |

**ASCII Diagram:**

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

**Key Handoff Points:**

1. **PM → Dev:** Directive with acceptance criteria + code review/QA configuration
2. **Dev → PM:** Handoff with evidence
3. **PM → @dev-supervisor:** Code review request (if enabled)
4. **PM → @QA:** QA testing request (if PM assessment determines needed)
5. **QA → PM:** Test pass confirmation OR escalation
6. **PM → Dev:** Fix request (if QA escalates)
7. **PM → HITL:** Escalation (if fundamental issue)
8. **PM → @operator:** Closure notification

**Iteration Cycles:**

| Cycle           | Trigger            | Action                      | Outcome                 |
| --------------- | ------------------ | --------------------------- | ----------------------- |
| **QA Self-Fix** | Minor test failure | QA fixes and re-runs        | Tests pass → Verified   |
| **Dev Fix**     | Fundamental issue  | PM routes to Dev, Dev fixes | Returns to QA Testing   |
| **HITL**        | Decision needed    | PM escalates to @operator   | Human guides resolution |

---

### 4.5.3 Standard + Code Review Flow (High-Risk)

**State Transition Table:**

| #   | From State             | To State            | Agent           | Trigger          | Action                    | Tool             |
| --- | ---------------------- | ------------------- | --------------- | ---------------- | ------------------------- | ---------------- |
| 1-5 | (Same as Standard 1-5) |                     |                 |                  |                           |                  |
| 6   | Complete (pending)     | In Review           | @PM             | Route to review  | Request review            | `message_send`   |
| 7   | In Review              | Review Complete     | @dev-supervisor | Review done      | Submit findings           | `message_send`   |
| 8   | Review Complete        | Complete (verified) | @PM             | Approve findings | Accept or request changes | 4-Phase Workflow |
| 9   | Complete (verified)    | Closed              | @PM             | Final approval   | Close ATP                 | `atp_close`      |

**ASCII Diagram:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     STANDARD + CODE REVIEW FLOW                          │
└──────────────────────────────────────────────────────────────────────────┘

  ┌────────┐    ┌────────────┐    ┌───────────┐    ┌──────────┐    ┌────────┐
  │ Queued │───▶│ InProgress │───▶│ Complete  │───▶│ Reviewed │───▶│ Closed │
  └────────┘    └────────────┘    │ (pending) │    │          │    └────────┘
                     │  ▲         └───────────┘    └──────────┘
                     │  │               │               │
                     ▼  │               │               │
                ┌─────────┐             ▼               │
                │ Blocked │      ┌─────────────┐        │
                └─────────┘      │@dev-suprvsr │        │
                                 │  reviews    │        │
                                 └─────────────┘        │
                                       │                │
                                       │ findings       │
                                       ▼                │
                                 ┌─────────────┐        │
                                 │    @PM      │────────┘
                                 │  decides    │
                                 └─────────────┘
```

**Code Review Options (UOW Configuration):**

| Option           | Description         | ATPs Reviewed |
| ---------------- | ------------------- | ------------- |
| `none`           | No code review      | 0%            |
| `high-risk-only` | Only high-risk ATPs | ~20-30%       |
| `all`            | Every ATP reviewed  | 100%          |

---

### 4.5.4 Hotfix Flow (Production Issues)

**State Transition Table:**

| #   | From State | To State   | Agent | Trigger           | Action                       | Tool                      |
| --- | ---------- | ---------- | ----- | ----------------- | ---------------------------- | ------------------------- |
| 1   | (new)      | InProgress | @PM   | Incident reported | Create ATP, urgent directive | `atp_set`, `message_send` |
| 2   | InProgress | InProgress | @Dev  | Receive           | Immediate work start         | `message_ack`             |
| 3   | InProgress | Complete   | @Dev  | Fix ready         | Expedited handoff            | `handoff`                 |
| 4   | Complete   | Closed     | @PM   | Quick verify      | Fast-track close             | `atp_close`               |

**Characteristics:**

- Bypasses normal queue
- Minimal verification (critical path only)
- Post-incident review required
- Creates follow-up ATP for full fix if needed

---

### 4.5.5 Bugfix Flow

**State Transition Table:**

| #   | From State   | To State   | Agent | Trigger           | Action                       | Tool                      |
| --- | ------------ | ---------- | ----- | ----------------- | ---------------------------- | ------------------------- |
| 1   | (bug report) | Queued     | @PM   | Bug triaged       | Create bugfix ATP            | `atp_create`              |
| 2   | Queued       | InProgress | @PM   | Priority assigned | Issue directive              | `atp_set`, `message_send` |
| 3   | InProgress   | InProgress | @Dev  | Receive           | Reproduce, analyze, fix      | `message_ack`             |
| 4   | InProgress   | Complete   | @Dev  | Fix + test        | Handoff with regression test | `handoff`                 |
| 5   | Complete     | In QA      | @PM   | Route to QA       | Request verification         | `message_send`            |
| 6   | In QA        | Verified   | @QA   | Tests pass        | Approve fix                  | `message_send`            |
| 7   | Verified     | Closed     | @PM   | Final approval    | Close ATP                    | `atp_close`               |

**Key Difference:** QA verification mandatory before closure.

---

### 4.5.6 Enhancement Flow

**State Transition Table:**

| #   | From State | To State   | Agent           | Trigger             | Action                         | Tool                      |
| --- | ---------- | ---------- | --------------- | ------------------- | ------------------------------ | ------------------------- |
| 1   | (backlog)  | Queued     | @PM             | Feature prioritized | Create enhancement ATP         | `atp_create`              |
| 2   | Queued     | InProgress | @PM             | Sprint planning     | Issue detailed directive       | `atp_set`, `message_send` |
| 3   | InProgress | InProgress | @Dev            | Receive             | Implement feature              | `message_ack`             |
| 4   | InProgress | Blocked    | @Dev            | Dependency/question | Request clarification          | `atp_set`, `message_send` |
| 5   | Blocked    | InProgress | @PM/@Dev        | Resolved            | Resume work                    | `atp_set`                 |
| 6   | InProgress | Complete   | @Dev            | Feature done        | Handoff with demo              | `handoff`                 |
| 7   | Complete   | In Review  | @PM             | Route review        | Request @dev-supervisor review | `message_send`            |
| 8   | In Review  | Verified   | @dev-supervisor | Review pass         | Approve with notes             | `message_send`            |
| 9   | Verified   | Closed     | @PM             | Final approval      | Close ATP                      | `atp_close`               |

**Key Difference:** @dev-supervisor review typically required for new features.

---

### 4.5.7 Documentation Flow

**State Transition Table:**

| #   | From State | To State   | Agent | Trigger      | Action          | Tool                      |
| --- | ---------- | ---------- | ----- | ------------ | --------------- | ------------------------- |
| 1   | Queued     | InProgress | @PM   | Doc needed   | Issue directive | `atp_set`, `message_send` |
| 2   | InProgress | Complete   | @Dev  | Docs written | Handoff         | `handoff`                 |
| 3   | Complete   | Closed     | @PM   | Review pass  | Close ATP       | `atp_close`               |

**Characteristics:**

- Simplified flow (no QA, no code review)
- Fast turnaround
- PM verifies accuracy only

---

### 4.5.8 Emergency Flow (Severity 1)

**State Transition Table:**

| #   | From State | To State   | Agent | Trigger           | Action                | Tool                      |
| --- | ---------- | ---------- | ----- | ----------------- | --------------------- | ------------------------- |
| 1   | (alert)    | InProgress | @PM   | Sev-1 incident    | IMMEDIATE directive   | `atp_set`, `message_send` |
| 2   | InProgress | InProgress | @Dev  | Receive           | Drop everything, fix  | `message_ack`             |
| 3   | InProgress | Complete   | @Dev  | Fix ready         | Emergency handoff     | `handoff`                 |
| 4   | Complete   | Deployed   | @SRE  | Deploy approved   | Deploy to production  | External                  |
| 5   | Deployed   | Closed     | @PM   | Incident resolved | Close with postmortem | `atp_close`               |

**Characteristics:**

- Highest priority, bypasses all queues
- HITL notification on every transition
- Postmortem ATP required after closure
- All gates expedited but documented

---

### 4.5.9 Flow Selection Logic

**At UOW Creation:**

```
IF incident.severity == 1:
    flow = 'emergency'
ELIF incident.reported:
    IF production_impacting:
        flow = 'hotfix'
    ELSE:
        flow = 'bugfix'
ELIF work_type == 'documentation':
    flow = 'documentation'
ELIF work_type == 'feature':
    flow = 'enhancement'
ELSE:
    flow = 'standard'

// Code review overlay
IF uow.codeReviewMode == 'all':
    flow = flow + '_with_review'
ELIF uow.codeReviewMode == 'high-risk-only':
    IF atp.risk >= 3:
        flow = flow + '_with_review'
```

---

## 📨 5. Message Protocol

Agents communicate via structured messages recorded in TCS. Messages create audit trail and enable future orchestrator automation.

### 5.1 Message Types

| Type                 | From | To            | Purpose                                   |
| -------------------- | ---- | ------------- | ----------------------------------------- |
| **Directive**        | @PM  | @Dev          | Assign work with full context             |
| **Handoff**          | Any  | Any           | Transfer responsibility                   |
| **Escalation**       | Any  | @PM/@operator | Request decision/unblock                  |
| **StatusUpdate**     | Any  | @PM           | Progress or blocker notification          |
| **Acknowledgment**   | Any  | Any           | Confirm receipt                           |
| **BugReport**        | @QA  | @Dev          | Defect notification                       |
| **HITLNotification** | @PM  | @operator     | Human-in-the-loop notification at closure |

### 5.2 Message Format

```markdown
From: @[sender]
To: @[recipient]
Subject: [Type]: [ATP-ID] - [Brief Title]
Priority: [P0-Critical | P1-High | P2-Normal | P3-Low]

## Context

[What recipient needs to know to act]

## Action Required

[Specific, actionable instruction]
```

### 5.3 Message Routing Rules (CRITICAL)

**When calling `governance.message_send`, always verify:**

| Scenario                           | fromAgent   | toAgent       |
| ---------------------------------- | ----------- | ------------- |
| PM issuing directive to Dev        | `'@pm'`     | `'@dev'`      |
| Dev handing off to PM              | `'@dev'`    | `'@pm'`       |
| PM responding to Dev               | `'@pm'`     | `'@dev'`      |
| QA reporting bug to Dev            | `'@qa'`     | `'@dev'`      |
| PM closing ATP (HITL notification) | `'@pm'`     | `'@operator'` |
| Any escalation to human            | `fromAgent` | `'@operator'` |

**COMMON ERROR:** Setting `fromAgent` and `toAgent` to the same agent (e.g., `@pm` to `@pm`). This is ALWAYS wrong.

**Verification:** Before sending, confirm:

- `fromAgent` = YOUR agent handle
- `toAgent` = RECIPIENT agent handle
- These are DIFFERENT values

---

## 📝 5.4 Handoff Completion Behavior

### @Dev Handoff Rules

**When Dev completes work and hands off to PM:**

1. ✅ Call `governance.atp_set({ status: 'Complete' })`
2. ✅ Call `governance.message_send({ messageType: 'Handoff', toAgent: '@pm', ... })`
3. ✅ Provide evidence and summary
4. ✅ **END THE MESSAGE**

**NEVER say after handoff:**
❌ 'Awaiting next directive'
❌ 'Ready for next task'
❌ 'What should I work on next?'

**Rationale:** Dev's job is done. PM decides when to issue next directive. Dev does not request work.

### @PM Closure Rules

**When PM closes an ATP:**

1. ✅ Call `governance.atp_close({ generateReport: true })`
2. ✅ Call `governance.message_send({ fromAgent: '@pm', toAgent: '@operator', messageType: 'HITLNotification', ... })`
3. ✅ Summarize accomplishment
4. ✅ **END THE MESSAGE**

**CRITICAL: The HITL notification to @operator is MANDATORY. This is how the human operator receives notification of ATP completion. Sending to @pm or @dev instead of @operator causes infinite loops.**

**NEVER say after closure:**
❌ 'Ready for next directive'
❌ 'Awaiting acknowledgment before next ATP'
❌ Any mention of the next ATP

**Rationale:** Each ATP has its own message boundary. Closure = end of that ATP's discussion.## Evidence (if applicable)

[Links, test results, file changes]

## Deadline (if applicable)

[When response needed]

````

### 5.3 Message Tool Usage

```typescript
// Send directive from PM to Dev
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P2-Normal",
  subject: "Implement feature X",
  body: "Full context and acceptance criteria...",
  requiresAck: true,
});

// Acknowledge receipt
governance.message_ack({
  messageId: "MSG-20260111-0001",
  agent: "@dev",
  notes: "Received, starting work",
});
````

---

## 🔧 6. Status Transitions

### 6.1 Transition Rules

| From       | To         | Who  | Required Evidence      | Tool                   |
| ---------- | ---------- | ---- | ---------------------- | ---------------------- |
| Planned    | InProgress | @Dev | Directive received     | `governance.atp_set`   |
| InProgress | Blocked    | Any  | Blocker description    | `governance.atp_set`   |
| Blocked    | InProgress | Any  | Resolution description | `governance.atp_set`   |
| InProgress | Complete   | @Dev | Tests pass, DoD met    | `governance.atp_set`   |
| Complete   | Rejected   | @PM  | Rejection reason       | `governance.atp_set`   |
| Rejected   | InProgress | @Dev | Rework plan            | `governance.atp_set`   |
| Complete   | Closed     | @PM  | Completion report      | `governance.atp_close` |
| Any        | Deferred   | @PM  | Deferral reason        | `governance.atp_set`   |

### 6.2 Status Tool Usage

```typescript
// Dev starts work
governance.atp_set({
  atpId: "AT-XX-YY",
  status: "InProgress",
  agent: "@dev",
  notes: "Starting implementation per directive MSG-123",
});

// Dev reports blocker
governance.atp_set({
  atpId: "AT-XX-YY",
  status: "Blocked",
  agent: "@dev",
  blockerType: "dependency",
  blockerDescription: "Awaiting schema migration from AT-XX-ZZ",
  estimatedUnblock: "2026-01-12",
});

// Dev completes work
governance.atp_set({
  atpId: "AT-XX-YY",
  status: "Complete",
  agent: "@dev",
  evidence: ["Tests pass", "Build OK", "DoD verified"],
  handoffTo: "@pm",
});
```

---

## 📄 7. Artifact Generation

Artifacts are generated at specific lifecycle points and recorded in TCS.

### 7.1 Required Artifacts

| Artifact Type            | When Generated       | Generator | TCS Record                                         | Tool              |
| ------------------------ | -------------------- | --------- | -------------------------------------------------- | ----------------- |
| **Directive**            | ATP assignment       | @PM       | `Artifacts.artifact_type = 'Directive'`            | `message_send`    |
| **QATestReport**         | QA testing complete  | @QA       | `Artifacts.artifact_type = 'QATestReport'`         | `artifact_create` |
| **PMVerificationReport** | PM verification done | @PM       | `Artifacts.artifact_type = 'PMVerificationReport'` | `artifact_create` |
| **CompletionReport**     | ATP closure          | @PM       | `Artifacts.artifact_type = 'CompletionReport'`     | `atp_close`       |
| **BugReport**            | Defect found         | @QA/@Dev  | `Artifacts.artifact_type = 'BugReport'`            | `bug_create`      |
| **HandoffContext**       | Agent transition     | Any       | `Artifacts.artifact_type = 'Handoff'`              | `handoff`         |
| **EscalationRequest**    | Blocker escalation   | Any       | `Artifacts.artifact_type = 'Escalation'`           | `message_send`    |

### 7.2 QA Test Report Artifact (MANDATORY)

**@QA MUST create a QA Test Report artifact upon successful test completion:**

```typescript
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "QATestReport",
  title: "QA Test Report: AT-XX-YY",
  content: `# QA Test Report: AT-XX-YY

## Summary
**Result:** ✅ PASSED
**Date:** ${new Date().toISOString()}

## Test Results
| Category | Run | Passed | Failed |
|----------|-----|--------|--------|
| Unit     | X   | X      | 0      |
| Integration | X | X    | 0      |
| Regression | X | X     | 0      |

## Test Scripts Added
- [List]

## Notes
[Observations]
`,
  persist: "both", // TCS + file
});
```

### 7.3 PM Verification Report Artifact (MANDATORY)

**@PM MUST create a PM Verification Report artifact upon successful verification:**

```typescript
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY",
  content: `# PM Verification Report: AT-XX-YY

## Executive Summary
**Result:** ✅ APPROVED
**Quality Score:** X/10

## Acceptance Criteria
| Criterion | Status | Evidence |
|-----------|--------|----------|
| AC-1      | ✅ Met | [proof]  |

## Quality Gates
| Gate | Result |
|------|--------|
| Code Review | ✅/N/A |
| QA Testing | ✅/N/A |

## Recommendation
APPROVED for closure.
`,
  persist: "both",
});
```

### 7.4 Completion Report Format

Generated automatically by `governance.atp_close`:

```markdown
# ATP Completion Report: [ATP-ID]

## Summary

- **ATP:** [ID and Title]
- **Status:** Closed
- **Duration:** [Start → End]
- **Agent(s):** [Who worked on it]

## Acceptance Criteria Verification

| Criterion | Status | Evidence     |
| --------- | ------ | ------------ |
| [AC1]     | ✅ Met | [Link/proof] |
| [AC2]     | ✅ Met | [Link/proof] |

## Artifacts Produced

- [File changes, commits, documents]

## Quality Gates

- Build: ✅ Pass
- Tests: ✅ Pass (N tests, M% coverage)
- Lint: ✅ Pass

## Lessons Learned

- [Insights for future work]

## Metrics

- Effort: [N hours]
- Blockers: [M encountered]
- Revisions: [K plan changes]
```

### 7.5 Bug Report Tool Usage

```typescript
governance.bug_create({
  atpId: "AT-XX-YY", // Associated ATP
  title: "Widget fails when input is empty",
  severity: "Major",
  priority: "P1-High",
  foundBy: "@qa",
  assignTo: "@dev",
  description: "Detailed description...",
  stepsToReproduce: ["Step 1", "Step 2", "Step 3"],
  expected: "Widget should show validation error",
  actual: "Widget crashes with null pointer",
  environment: "macOS 14.2, VS Code 1.85",
});
```

---

## 🔗 8. TCS Database Integration

All status changes, messages, and artifacts are persisted to TCS for audit and orchestration.

### 8.1 Database Records Created

| Action             | TCS Tables Updated                    |
| ------------------ | ------------------------------------- |
| ATP Created        | `ATPs`, `Instructions`                |
| Status Change      | `ATPs.status`, `RunCheckpoints`       |
| Message Sent       | `Instructions`, `ContextEntries`      |
| Artifact Generated | `Artifacts`                           |
| Handoff Logged     | `Instructions`, `ContextEntries`      |
| Bug Created        | `Artifacts`, `Instructions`           |
| ATP Closed         | `ATPs.status`, `Artifacts`, `Metrics` |

### 8.2 Cockpit UI Refresh

After TCS updates, trigger UI refresh:

```typescript
// Emit event for Cockpit to refresh Gantt/progress views
governance.cockpit_refresh({
  refreshType: "project", // or 'atp' or 'full'
  projectId: 123,
  reason: "ATP status changed",
});
```

---

## 🚨 9. Escalation Protocol

### 9.1 Escalation Triggers

| Trigger                     | Escalate To | Required Information    |
| --------------------------- | ----------- | ----------------------- |
| Technical blocker (3+ days) | @PM         | Options, recommendation |
| Scope change discovered     | @PM         | Impact analysis         |
| Risk level 4+ decision      | @PM + @HITL | Decision context        |
| Policy conflict             | @PM         | Conflicting policies    |
| Security/data concern       | @HITL       | Security analysis       |

### 9.2 Escalation Format

```markdown
From: @dev
To: @PM
Subject: Escalation: AT-XX-YY - [Issue Title]
Priority: P1-High

## Escalation Type

[Blocker | Scope | Risk | Conflict | Security]

## Context

[What was being done when issue arose]

## Issue Description

[Clear description of the problem]

## Options Analyzed

1. **Option A:** [Description] - Pros/Cons
2. **Option B:** [Description] - Pros/Cons

## Recommendation

[Your recommended path with rationale]

## Impact if Unresolved

[What happens if no decision made]

## Deadline

[When decision needed]
```

---

## ✅ 10. ATP Closure (Reference: PM Verification Protocol)

**For detailed PM verification workflow, see: `pm-verification-protocol`**

The PM Verification Protocol defines the complete 4-Phase workflow:

- Phase 1: Strategic Verification & Quality Gate
- Phase 2: Executive Summary
- Phase 3: Authorization Decision (AUTO-PROCEED vs WAIT)
- Phase 4: Directive Issuance or Closure

### 10.1 Quick Closure Checklist

Before calling `governance.atp_close()`, verify:

| Gate                | Check                                            |
| ------------------- | ------------------------------------------------ |
| Acceptance Criteria | All criteria verified with evidence              |
| Quality Score       | ≥8/10 (see PM Verification Protocol for scoring) |
| Build/Test/Lint     | All passing                                      |
| Artifacts Created   | PM Verification Report saved                     |
| No Blockers         | All resolved, no pending messages                |

### 10.2 Mandatory Artifacts on Closure

| Artifact               | Tool                                              | When             |
| ---------------------- | ------------------------------------------------- | ---------------- |
| PM Verification Report | `governance.artifact_create()`                    | Before atp_close |
| Completion Report      | `governance.atp_close({ generateReport: true })`  | During closure   |
| Issue Log              | `governance.atp_close({ compileIssueLog: true })` | During closure   |

### 10.3 Closure Tool

```typescript
// 1. Create PM Verification Report FIRST
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY",
  content: "... executive summary, quality score, acceptance criteria ...",
  persist: "both",
});

// 2. Close ATP with Completion Report
governance.atp_close({
  atpId: "AT-XX-YY",
  summary: "Brief accomplishment summary",
  acceptanceCriteriaMet: true,
  lessonsLearned: ["Lesson 1", "Lesson 2"],
  metrics: {
    effortHours: 8,
    blockersEncountered: 1,
    planRevisions: 0,
  },
  generateReport: true,
  compileIssueLog: true,
});

// 3. Send HITL Notification
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P2-Normal",
  subject: "ATP Closed: AT-XX-YY - [Brief Title]",
  body: "... closure summary ...",
});
```

---

## 🛠️ 11. Tool Reference

### Available Orchestrator Tools

All tools are registered via `OrchestratorProvider` in andl-core and available through the ANDL toolkit.

#### orchestrator.intro (Introspection Tools)

| Tool                            | Description                                                                    | Risk |
| ------------------------------- | ------------------------------------------------------------------------------ | ---- |
| `orchestrator.active_tasks`     | List current active runs (as tasks) with status & age                          | R0   |
| `orchestrator.task_history`     | Recent terminal tasks (newest→oldest) with duration & pagination               | R0   |
| `orchestrator.task_details`     | Fetch task details by id (depth: meta\|runs\|full; includes checkpoints)       | R0   |
| `orchestrator.protocol_list`    | List protocol documents (name, category, tags, lastModified)                   | R0   |
| `orchestrator.protocol_get`     | Fetch protocol markdown + extracted sections (objectives, constraints, steps)  | R0   |
| `orchestrator.governance_state` | Report current governance stage per active governed run                        | R0   |
| `orchestrator.checkpoints_list` | List rollback checkpoints for a task (chronological ascending)                 | R0   |
| `orchestrator.events_recent`    | Recent orchestration & governance events; supports cursor, multi-prefix, regex | R0   |
| `orchestrator.capabilities`     | Describe orchestrator provider capability versions & enumerated tool names     | R0   |

#### orchestrator.control (Task Control Tools)

| Tool                               | Description                                                    | Risk |
| ---------------------------------- | -------------------------------------------------------------- | ---- |
| `orchestrator.task_create`         | Create (enqueue) a new task/run from workflowId or ad-hoc spec | R1   |
| `orchestrator.task_cancel`         | Request cancellation of a task (idempotent)                    | R1   |
| `orchestrator.note_append`         | Append an audit note to a task (persists via checkpoint)       | R1   |
| `orchestrator.governance_escalate` | Escalate governance stage (confirm gating for high-risk)       | R2   |
| `orchestrator.checkpoint_create`   | Force creation of a rollback checkpoint                        | R1   |
| `orchestrator.annotation_set`      | Set structured annotations (namespaced key/value) on a task    | R1   |

#### orchestrator.mutate (Mutation Tools)

| Tool                            | Description                                                       | Risk |
| ------------------------------- | ----------------------------------------------------------------- | ---- |
| `orchestrator.rollback_trigger` | Preview or execute rollback to latest checkpoint (confirm gating) | R3   |
| `orchestrator.task_rerun`       | Requeue a terminal task creating a new run                        | R2   |

#### governance (Governance Artifact Tools)

| Tool                         | Description                                                       | Risk | Primary User |
| ---------------------------- | ----------------------------------------------------------------- | ---- | ------------ |
| `governance.sync`            | Synchronize governance artifacts for an ATP; checks for drift     | R0   | All          |
| `governance.decision`        | Record an autonomy decision (AD) in the governance log            | R0   | All          |
| `governance.atp_set`         | Update ATP status in TCS database with transitions                | R1   | All          |
| `governance.atp_close`       | Close an ATP with completion report and lessons learned           | R1   | @PM          |
| `governance.message_send`    | Send structured message between agents (Directive, Handoff, etc.) | R0   | All          |
| `governance.message_ack`     | Acknowledge receipt of a governance message                       | R0   | All          |
| `governance.bug_create`      | Create a bug report artifact with severity and reproduction steps | R0   | @QA/@Dev     |
| `governance.cockpit_refresh` | Trigger a refresh of the Cockpit UI after governance changes      | R0   | All          |
| `governance.issue_log`       | Log, resolve, or list issues encountered during ATP execution     | R0   | All          |

### Risk Level Legend

- **R0**: Read-only/low impact - safe for autonomous execution
- **R1**: Moderate impact - creates artifacts or modifies state
- **R2**: Significant impact - may need review
- **R3**: High impact - requires confirmation gating

#### andl.core (Core Toolkit Tools)

These tools are provided by the `andl-toolkit` provider in andl-core for manifest validation, toolkit formatting, and governance rule management.

| Tool                                 | Description                                                                                                                 | Risk |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---- |
| `andl.core.manifest.validate`        | Validate a tool manifest object against required schema (name, version, description, execId, parameters)                    | R0   |
| `andl.core.toolkit.format_tool_list` | Format an array of tool objects into a human-readable summary string (for display, logging, reports)                        | R0   |
| `andl.core.gov_rules.evaluate`       | Evaluate governance rules against a context (agent, taskKind, filePath, content, addedLines). Returns violations and checks | R0   |
| `andl.core.gov_rules.distill`        | Heuristically distill freeform policy text into structured governance rules. Returns synthesized rule objects               | R0   |
| `andl.core.gov_rules.persist`        | Write distilled governance rules to disk as individual JSON files. Requires write permission                                | R1   |
| `andl.core.capabilities`             | Returns provider metadata, runtime health check, and list of available tools                                                | R0   |

---

## ⚠️ 12. ENFORCEMENT: MANDATORY RULES (BLOCKING)

**These rules are NON-NEGOTIABLE. Violations constitute governance failures.**

---

### 12.1 ⚡ MANDATORY STATUS AND STAGE UPDATES

**Every ATP transition MUST update BOTH status AND stage appropriately. No exceptions.**

**CRITICAL: STATUS and STAGE are DIFFERENT fields with DIFFERENT valid values:**

| Field      | Valid Values                                                                    | Purpose                |
| ---------- | ------------------------------------------------------------------------------- | ---------------------- |
| **STATUS** | `Queued`, `InProgress`, `Blocked`, `Complete`, `Rejected`, `Closed`, `Deferred` | What's happening NOW   |
| **STAGE**  | `backlog`, `plan`, `implement`, `review`, `test`, `done`                        | Where in SDLC pipeline |

**Transition Table (when to update what):**

| Event                   | STATUS Change  | STAGE Change     | Tool Call                                                              |
| ----------------------- | -------------- | ---------------- | ---------------------------------------------------------------------- |
| ATP created             | → `Queued`     | → `backlog`      | `governance.atp_set({ status: 'Queued', stage: 'backlog' })`           |
| Planning starts         | → `InProgress` | → `plan`         | `governance.atp_set({ status: 'InProgress', stage: 'plan' })`          |
| Dev starts coding       | → `InProgress` | → `implement`    | `governance.atp_set({ status: 'InProgress', stage: 'implement' })`     |
| Dev blocked             | → `Blocked`    | (unchanged)      | `governance.atp_set({ status: 'Blocked', blockerDescription: '...' })` |
| Dev unblocked           | → `InProgress` | (unchanged)      | `governance.atp_set({ status: 'InProgress' })`                         |
| Code complete, PR ready | → `Complete`   | → `review`       | `governance.atp_set({ status: 'Complete', stage: 'review' })`          |
| Review starts           | → `InProgress` | (stays `review`) | `governance.atp_set({ status: 'InProgress' })`                         |
| Review done, tests next | → `Complete`   | → `test`         | `governance.atp_set({ status: 'Complete', stage: 'test' })`            |
| QA starts testing       | → `InProgress` | (stays `test`)   | `governance.atp_set({ status: 'InProgress' })`                         |
| Tests pass, all done    | → `Complete`   | → `done`         | `governance.atp_set({ status: 'Complete', stage: 'done' })`            |
| PM closes ATP           | → `Closed`     | (stays `done`)   | `governance.atp_close()`                                               |

**COMMON ERRORS (DO NOT DO THESE):**

| ❌ Wrong              | ✅ Correct             | Reason                                |
| --------------------- | ---------------------- | ------------------------------------- |
| `stage: 'Complete'`   | `stage: 'done'`        | "Complete" is a STATUS, not a stage   |
| `stage: 'Done'`       | `stage: 'done'`        | Stage values are lowercase            |
| `stage: 'InProgress'` | `status: 'InProgress'` | "InProgress" is a STATUS, not a stage |
| `status: 'done'`      | `status: 'Complete'`   | "done" is a STAGE, not a status       |

**FAILURE TO UPDATE STATUS/STAGE = GOVERNANCE VIOLATION**

The Cockpit UI, orchestrator automation, and audit trail ALL depend on accurate status AND stage data.

---

### 12.2 🔒 MANDATORY CLOSURE BEFORE NEXT ATP

**@PM MUST close current ATP before issuing directive for next ATP.**

**Required sequence:**

```
1. Dev completes AT-XX-YY → handoff to PM
2. PM verifies acceptance criteria met
3. PM calls governance.atp_close(AT-XX-YY)
4. PM's message ENDS (no continuation)
5. [New message] PM issues directive for AT-XX-ZZ
```

**NEVER in the same message:**

- ❌ Close ATP A AND issue directive for ATP B
- ❌ Complete verification AND start next work
- ❌ Generate closure artifacts AND assign new tasks

---

### 12.3 🛑 CLOSURE TERMINATES THE MESSAGE

**When closing an ATP, the closure is the FINAL action in that message.**

**Correct Pattern:**

```markdown
## ATP AT-XX-YY Closure

Called `governance.atp_close()` with:

- Summary: "Implemented feature X"
- Lessons: ["Pattern Y improved performance"]

CompletionReport artifact generated: ART-12345

[END OF MESSAGE]
```

**Incorrect Pattern (VIOLATION):**

```markdown
## ATP AT-XX-YY Closure

...closure content...

## Next: Directive for AT-XX-ZZ ← NEVER DO THIS

...directive content...
```

**Rationale:** Mixing ATPs in one message:

- Creates audit ambiguity
- Prevents clear orchestrator event boundaries
- Breaks governance state machine
- Confuses Cockpit UI refresh cycles

---

### 12.4 📊 Status and Stage Visibility Importance

| Why These Matter         | Impact                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Cockpit UI**           | Shows current status AND stage in ATP progress view                                       |
| **Kanban Boards**        | Group by STAGE to see pipeline flow (`backlog → plan → implement → review → test → done`) |
| **Workload Views**       | Filter by STATUS to see active work (`InProgress`, `Blocked`)                             |
| **Orchestrator**         | Automation triggers on status AND stage transitions                                       |
| **Metrics**              | Time-in-stage analytics depend on accurate stage values                                   |
| **Bottleneck Detection** | STATUS=Complete + STAGE=review means waiting for reviewer                                 |
| **Audit Trail**          | Compliance requires full status and stage history                                         |
| **Agent Context**        | Other agents need to know current state                                                   |

**Rules:**

1. Every ATP has ONE definitive STATUS and ONE definitive STAGE at any time
2. Update BOTH immediately on transition per §12.1 table
3. STATUS = "what's happening" (`InProgress`, `Blocked`, `Complete`)
4. STAGE = "where in pipeline" (`implement`, `review`, `test`, `done`)
5. NEVER confuse them - they have completely different valid values

---

## 🚫 13. Anti-Patterns

| ❌ Anti-Pattern                   | ✅ Correct Behavior                                |
| --------------------------------- | -------------------------------------------------- |
| Changing status without tool      | ALWAYS use `governance.atp_set`                    |
| Skipping handoff on transition    | ALWAYS log handoffs                                |
| Closing without verification      | Verify ALL acceptance criteria                     |
| Bug fix without bug report        | Create bug report first                            |
| Direct agent-to-agent chat only   | Use `governance.message_send` for audit            |
| Ignoring TCS updates              | All changes persist to TCS                         |
| **Mixing ATPs in one message**    | **Closure ENDS the message. Period.**              |
| **Skipping status/stage updates** | **EVERY transition updates status AND/OR stage**   |
| **Closing ATP A, starting B**     | **Close A, STOP, new message for B**               |
| **Using `stage: 'Complete'`**     | **Use `stage: 'done'` (Complete is a STATUS)**     |
| **Using `stage: 'Done'`**         | **Use `stage: 'done'` (lowercase)**                |
| **Using `status: 'done'`**        | **Use `status: 'Complete'` (done is a STAGE)**     |
| **Confusing status and stage**    | **STATUS = workflow state, STAGE = SDLC position** |

---

## 💡 13. Best Practices

| Practice                        | Benefit                              |
| ------------------------------- | ------------------------------------ |
| 📨 **Always use message tools** | Creates audit trail for orchestrator |
| 🔄 **Update status promptly**   | Real-time visibility in Cockpit      |
| 📄 **Generate artifacts**       | Traceable project history            |
| 🤝 **Formal handoffs**          | Context preserved across sessions    |
| 📊 **Record metrics**           | Improves future estimation           |
| 💡 **Capture lessons**          | Continuous process improvement       |
