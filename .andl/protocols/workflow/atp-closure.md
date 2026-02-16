---
id: atp-closure
name: ATP Closure Protocol
version: 2.1.0
category: workflow
description: >-
  Tool-driven ATP (Atomic Task Package) completion protocol. Uses governance
  tools for all closure operations, artifact generation, and TCS persistence.
  Replaces manual governance updates with automated tool calls. Includes
  mandatory error reporting requirements.
displayMode: on-demand
criticality: high
parentProtocol: atp_lifecycle
triggerDescription: >-
  FETCH when: @PM closing an ATP, completing verification, generating closure
  reports, or transitioning to next ATP. Tool-driven workflow with automatic
  artifact generation and structured error reporting.
triggerKeywords:
  - close ATP
  - complete ATP
  - finish ATP
  - ATP done
  - closure
  - finalize
  - closure error
estimatedTokens: 2400
metadata:
  author: system
  createdAt: "2026-01-10"
  updatedAt: "2026-01-12"
---

# ✅ ATP CLOSURE PROTOCOL (v2.0 - Tool-Driven)

**Automated ATP completion using governance tools and TCS persistence.**

---

## 📜 1. Overview

This protocol defines the **tool-driven workflow** for ATP closure. All operations use governance tools that automatically:

- Persist state changes to TCS database
- Generate required artifacts (Completion Reports)
- Create audit trail for orchestrator automation
- Synchronize governance state

**Key Principle:** No manual file edits required. Tools handle all governance updates.

---

## 🔒 2. Closure Preconditions

**ALL of the following must be verified before closing an ATP:**

### 2.1 Pre-Closure Verification Tool

Run `closure.verify` to check all preconditions automatically:

```typescript
const result = await closure.verify({
  atpId: "AT-XX-YY",
  checkTypes: ["criteria", "tests", "governance", "evidence"],
});

if (!result.readyForClosure) {
  // Address blockers before proceeding
  console.log("Blockers:", result.blockers);
}
```

### 2.2 Verification Checks Performed

| Check Type     | What It Verifies                              |
| -------------- | --------------------------------------------- |
| **criteria**   | All acceptance criteria met with evidence     |
| **tests**      | Build passes, tests pass, lint clean          |
| **governance** | Registry sync, state-sync OK, changelog if UF |
| **evidence**   | All AT evidence fields populated              |

---

## 🔧 3. Closure Workflow (Tool-Driven)

### Step 1: Pre-Closure Validation 🔍

```typescript
// Verify ATP is ready for closure
const verification = await closure.verify({
  atpId: "AT-XX-YY",
  checkTypes: ["criteria", "tests", "governance", "evidence"],
});

// Review results
console.log("Ready:", verification.readyForClosure);
console.log("Checks:", verification.checks);
```

**If verification fails:** Address blockers before proceeding.

---

### Step 2: Update ATP Status to Complete 📊

Before closing, ensure ATP status is `Complete`:

```typescript
// Dev marks work complete (triggers handoff to PM)
await governance.atp_set({
  atpId: "AT-XX-YY",
  status: "Complete",
  agent: "@dev",
  evidence: ["All tests pass", "Build OK", "DoD verified"],
  handoffTo: "@pm",
});
```

---

### Step 3: PM Verification ✅

@PM reviews the completed work, then proceeds to closure.

---

### Step 4: Close ATP with Artifact Generation 📄

```typescript
// PM closes ATP - generates ALL closure artifacts automatically
const closeResult = await governance.atp_close({
  atpId: "AT-XX-YY",
  summary: "Implemented feature X with full test coverage and docs",
  acceptanceCriteriaMet: true,
  lessonsLearned: [
    "Process: Early testing caught integration issues faster",
    "Technical: Pattern X proved more maintainable than Y",
  ],
  metrics: {
    effortHours: 12,
    blockersEncountered: 1,
    planRevisions: 0,
  },
  generateReport: true, // ← Creates CompletionReport artifact
  compileIssueLog: true, // ← MANDATORY: Compiles Issue Log artifact
  generateArtifacts: {
    // ← All 6 closure artifacts
    closureReport: true, // Executive summary + verification
    changelog: true, // Formatted changelog entries
    architecturalUpdate: true, // Decisions and file changes
    lessonsLearned: true, // What worked, improvements
    readmeUpdate: false, // Only if user-facing changes
    activityLog: true, // MANDATORY: Timeline + issues narrative
  },
});

// Result includes artifact references
console.log("Report ID:", closeResult.completionReportId);
console.log("Issue Log:", closeResult.issueLogId);
console.log("TCS Artifact:", closeResult.artifactId);
```

**This single tool call:**

- Updates ATP status to `Closed` in TCS
- Generates ALL 6 mandatory closure artifacts:
  - CompletionReport (see [atp_closure_report_spec.md](../governance/atp_closure_report_spec.md))
  - ATP Changelog entries
  - Architectural Update log
  - Lessons Learned document
  - README Update (if applicable)
  - **Activity Log / Issue Log** (MANDATORY - timeline + any issues logged during execution)
- Records metrics in TCS
- Captures lessons learned
- Creates audit checkpoint
- Notifies @operator if issues were logged

---

### Step 5: Optional Governance Sync 🔗

If additional sync needed (rare - tools auto-sync):

```typescript
await governance.sync({
  atpId: "AT-XX-YY",
  artifactTypes: ["registry", "tracker", "changelog"],
  dryRun: false,
});
```

---

### Step 6: Refresh Cockpit UI 🖥️

Notify Cockpit to update displays:

```typescript
await governance.cockpit_refresh({
  refreshType: "atp",
  atpId: "AT-XX-YY",
  reason: "ATP closed with completion report",
});
```

---

### Step 7: STOP - Do Not Continue 🛑

**CRITICAL: Closure ENDS your message. Do NOT continue.**

After calling `governance.atp_close()`:

1. ✅ Report the closure summary
2. ✅ Confirm artifacts generated
3. ✅ **END THE MESSAGE**

**NEVER do these after closing an ATP:**

- ❌ Issue directive for the next ATP
- ❌ Start planning the next work item
- ❌ Discuss what's coming next
- ❌ Any content about a different ATP

**Why:** Each ATP has its own governance lifecycle. Mixing ATPs in one message:

- Breaks audit trail boundaries
- Confuses orchestrator event sequencing
- Creates governance state ambiguity
- Prevents proper Cockpit refresh cycles

**Pattern:**

```
Message N: Close AT-01-01 → END
Message N+1: Issue directive for AT-01-02
```

---

## 🚨 ENFORCEMENT: MESSAGE BOUNDARY RULES

### Closure Message Template

When closing an ATP, your ENTIRE message should be:

```markdown
## ATP Closure: AT-XX-YY

**Summary:** [Brief accomplishment description]

**Tools Called:**

- `governance.atp_close({ atpId: "AT-XX-YY", ... })`
- `governance.cockpit_refresh({ atpId: "AT-XX-YY" })`

**Artifacts Generated:**

- CompletionReport: [artifact ID]

**Lessons Learned:**

- [Insight 1]
- [Insight 2]

---

[END OF MESSAGE - Next ATP will be addressed in subsequent message]
```

### What NOT To Include

After the closure content, do NOT add:

- "Now let's move on to AT-XX-ZZ..."
- "Next directive for @Dev..."
- "The next priority is..."
- Any reference to work beyond this ATP

---

## 🛠️ 4. Tool Reference

### 4.1 closure.verify

**Purpose:** Pre-closure validation (all checks)

```typescript
closure.verify({
  atpId: string,          // ATP identifier
  checkTypes?: string[]   // ['criteria', 'tests', 'governance', 'evidence']
}) → ClosureVerifyResult
```

**Returns:**

```typescript
{
  success: boolean;
  readyForClosure: boolean;
  checks: ClosureCheck[];
  blockers?: string[];
  verificationId: string;
}
```

---

### 4.2 governance.atp_close

**Purpose:** Close ATP with artifact generation

```typescript
governance.atp_close({
  atpId: string,                    // ATP identifier
  summary: string,                  // Brief accomplishment summary
  acceptanceCriteriaMet: boolean,   // All criteria verified
  lessonsLearned?: string[],        // Process/technical insights
  metrics?: {
    effortHours?: number,
    blockersEncountered?: number,
    planRevisions?: number
  },
  generateReport?: boolean          // Create CompletionReport artifact
}) → AtpCloseResult
```

**Returns:**

```typescript
{
  success: boolean;
  atpId: string;
  closedAt: string;
  completionReportId?: string;  // Report artifact ID
  artifactId?: number;          // TCS Artifacts.id
  tcsUpdated: boolean;
}
```

---

### 4.3 closure.complete

**Purpose:** Alternative closure (triggers sync)

```typescript
closure.complete({
  atpId: string,           // ATP identifier
  summary: string,         // Accomplishment summary
  evidence: string[],      // Evidence list
  lessonsLearned?: string[],
  triggersSync?: boolean   // Default: true
}) → ClosureCompleteResult
```

---

### 4.4 governance.sync

**Purpose:** Synchronize governance artifacts

```typescript
governance.sync({
  atpId: string,           // ATP to sync for
  artifactTypes?: string[],// ['registry', 'tracker', 'changelog', 'decisions']
  dryRun?: boolean         // Check only, no changes
}) → GovernanceSyncResult
```

---

## 🚨 5. Error Handling and User Reporting

### 5.1 Tool Error Structure

Closure tools return structured errors for actionable feedback. **PM MUST report these to the user.**

#### ClosureVerifyResult Blockers

```typescript
// Blockers now include actionable details
{
  blockers: [
    {
      type: 'criteria' | 'tests' | 'governance' | 'evidence' | 'content',
      description: string,   // What's wrong
      suggestion: string,    // How to fix it
      severity: 'critical' | 'warning'
    }
  ],
  error?: string,            // High-level error message
  errorDetails?: {
    category: 'validation' | 'content' | 'persistence' | 'system',
    message: string,
    suggestion: string
  }
}
```

#### ClosureCompleteResult Errors

```typescript
// Closure completion can fail partially or completely
{
  success: boolean,              // false if complete failure
  atpStatus: 'done' | 'failed',  // 'failed' if no artifacts written
  error?: string,                // High-level error message
  errorDetails?: {
    category: 'validation' | 'content' | 'persistence' | 'system',
    message: string,
    field?: string,              // Which input was problematic
    suggestion: string,          // Actionable fix
    context?: Record<string, unknown>  // Additional debugging info
  },
  warnings?: string[],           // Non-blocking issues
  failedArtifacts?: Array<{
    type: string,
    path: string,
    error: string
  }>
}
```

### 5.2 MANDATORY: Report Errors to User

**When ANY closure tool returns an error, PM MUST:**

1. **Report the error clearly to the user** with the suggestion
2. **Do NOT silently retry** without user awareness
3. **Include context** about what failed and why

#### Error Reporting Template

```markdown
## ⚠️ Closure Error: AT-XX-YY

**Error:** [errorDetails.message]

**Category:** [errorDetails.category]

**Suggested Fix:** [errorDetails.suggestion]

**Failed Artifacts:** (if any)

- [type]: [error]

**Required User Action:**

- [Specific step to resolve]
```

### 5.3 Common Error Scenarios

| Error Category  | Typical Cause                          | Resolution                                   |
| --------------- | -------------------------------------- | -------------------------------------------- |
| **content**     | Missing `artifactContent` in call      | AI must generate content before calling tool |
| **validation**  | Invalid atpId, missing required fields | Check input parameters                       |
| **persistence** | File write failed, directory missing   | Check filesystem permissions, create dirs    |
| **system**      | Host.fs not available, internal error  | Check toolkit host configuration             |

### 5.4 Partial Success Handling

Closure can **partially succeed** (some artifacts written, some failed):

- `success: true` + `failedArtifacts`: Some files written, some failed
- `success: false` + `atpStatus: 'failed'`: Complete failure

**PM Response to Partial Success:**

1. Report which artifacts succeeded
2. Report which artifacts failed with reasons
3. Advise user on manual recovery if needed
4. Do NOT mark ATP as fully closed if critical artifacts missing

### 5.5 Warning Handling

Warnings indicate non-blocking issues the user should be aware of:

```typescript
if (result.warnings?.length > 0) {
  // Report warnings to user
  console.log("Closure completed with warnings:");
  result.warnings.forEach((w) => console.log(`  ⚠️ ${w}`));
}
```

**Common Warnings:**

- "Missing AI content for X - artifact will be skipped"
- "X content appears incomplete (N chars) - ensure meaningful content"

---

## 📊 6. Metrics & Lessons

### 6.1 Required Metrics

| Metric           | Description          | Captured By            |
| ---------------- | -------------------- | ---------------------- |
| ⏱️ effortHours   | Actual hours spent   | `governance.atp_close` |
| 🚫 blockers      | Blockers encountered | `governance.atp_close` |
| 🔄 planRevisions | Plan changes made    | `governance.atp_close` |

### 6.2 Lessons Learned Categories

| Category             | Examples                                   |
| -------------------- | ------------------------------------------ |
| 🔧 **Technical**     | "Pattern X worked better than Y"           |
| 📋 **Process**       | "Early testing caught issue faster"        |
| 🔗 **Governance**    | "Tool X simplified artifact management"    |
| 🤝 **Collaboration** | "Structured handoffs reduced context loss" |

---

## 📄 7. Generated Artifacts

### 7.1 CompletionReport Artifact

When `generateReport: true`, the tool creates a standardized markdown artifact:

- **Format:** See [atp_closure_report_spec.md](../governance/atp_closure_report_spec.md)
- **Location:** TCS `Artifacts` table + optional file output
- **Contents:** Executive summary, acceptance verification, quality gates, metrics, lessons

### 7.2 TCS Records Updated

| Table            | Update                                |
| ---------------- | ------------------------------------- |
| `ATPs`           | status → 'Closed', closedAt timestamp |
| `Artifacts`      | CompletionReport artifact inserted    |
| `RunCheckpoints` | Closure checkpoint recorded           |
| `Metrics`        | Effort, blockers, revisions logged    |

---

## 🚫 8. Anti-Patterns

| ❌ Anti-Pattern                   | ✅ Correct Behavior                  |
| --------------------------------- | ------------------------------------ |
| Manual file edits for closure     | Use `governance.atp_close` tool      |
| Skipping verification             | Run `closure.verify` first           |
| Closing without completion report | Set `generateReport: true`           |
| Missing lessons learned           | Always include at least one insight  |
| Manual registry updates           | Tools auto-update TCS                |
| Editing closure reports           | Reports are immutable; tools append  |
| **Continuing after closure**      | **STOP after atp_close - end msg**   |
| **Mixing ATPs in one message**    | **Closure = end of ATP discussion**  |
| **Skipping to next ATP**          | **New message for next ATP**         |
| **Forgetting stage updates**      | **Update stage at EVERY transition** |

---

## 💡 9. Best Practices

| Practice                         | Benefit                        |
| -------------------------------- | ------------------------------ |
| 🔍 **Always run closure.verify** | Catches issues before closure  |
| 📄 **Generate reports**          | Creates audit trail            |
| 💡 **Capture lessons**           | Drives continuous improvement  |
| 📊 **Record accurate metrics**   | Improves future estimation     |
| 🔄 **Let tools handle sync**     | Prevents drift, reduces errors |
| 🖥️ **Refresh Cockpit**           | Keeps UI in sync with state    |
| 🛑 **END message after closure** | Maintains clean ATP boundaries |
| 📈 **Update stages promptly**    | Accurate tracking & automation |

---

## 🔗 10. Related Protocols

| Protocol                                                               | Relationship            |
| ---------------------------------------------------------------------- | ----------------------- |
| [atp_lifecycle.md](../governance/atp_lifecycle.md)                     | Parent lifecycle policy |
| [atp_closure_report_spec.md](../governance/atp_closure_report_spec.md) | Artifact format spec    |
| [agent-handoff.md](./agent-handoff.md)                                 | Handoff before closure  |
| [sdlc_master.md](../sdlc/sdlc_master.md)                               | SDLC stage requirements |
