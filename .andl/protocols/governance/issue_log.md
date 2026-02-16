---
id: issue-log
name: ATP Issue Log Protocol
version: 1.0.0
category: governance
description: >-
  Defines the Issue Log artifact that tracks tool errors, blockers, and issues
  encountered during ATP execution. Required for all ATPs and compiled at closure.
  Provides transparency to @operator about execution problems.
displayMode: on-demand
criticality: high
isTopLevel: false
parentPolicyId: atp_lifecycle
triggerDescription: >-
  FETCH when: encountering tool errors, reporting blockers, logging issues
  during ATP execution, compiling closure artifacts.
triggerKeywords:
  - issue
  - error
  - blocker
  - tool failure
  - problem
  - log
  - issue log
estimatedTokens: 800
metadata:
  author: system
  createdAt: "2026-01-13"
  updatedAt: "2026-01-13"
---

# 📋 ATP ISSUE LOG PROTOCOL

**Defines the Issue Log artifact for tracking tool errors, blockers, and issues during ATP execution.**

---

## 🎯 1. Purpose

The Issue Log captures ALL tool errors, blockers, and issues encountered during ATP execution. This log:

1. **Provides transparency** - @operator sees what went wrong during execution
2. **Creates audit trail** - Documents problems for post-mortem analysis
3. **Enables debugging** - Captures error details for troubleshooting
4. **Tracks patterns** - Identifies recurring issues across ATPs

**Authority:** Every ATP MUST maintain an Issue Log. The log is compiled as a closure artifact.

---

## 📋 2. Issue Log Structure

### 2.1 Issue Entry Format

Each issue entry MUST include:

```typescript
interface IssueLogEntry {
  id: string; // Sequential: ISSUE-001, ISSUE-002, etc.
  timestamp: string; // ISO 8601 format
  category: IssueCategory; // See categories below
  severity: "info" | "warning" | "error" | "critical";
  source: string; // Tool name or component that generated the issue
  summary: string; // Brief one-line description
  details: string; // Full error message or context
  resolution?: {
    // If resolved during execution
    status: "resolved" | "workaround" | "escalated" | "deferred";
    action: string; // What was done
    timestamp: string;
  };
  escalatedTo?: "@pm" | "@operator" | "@HITL"; // If escalated
}
```

### 2.2 Issue Categories

| Category           | Description                        | Examples                              |
| ------------------ | ---------------------------------- | ------------------------------------- |
| `tool_failure`     | Tool call failed or returned error | API timeout, permission denied        |
| `validation_error` | Input/output validation failed     | Schema mismatch, type error           |
| `dependency_issue` | External dependency problem        | Package not found, version conflict   |
| `build_failure`    | Build or compile error             | TypeScript error, lint failure        |
| `test_failure`     | Test execution failure             | Unit test failed, E2E timeout         |
| `governance_issue` | Governance tool or sync problem    | Registry drift, state-sync failure    |
| `blocker`          | Work blocked by external factor    | Waiting on dependency, missing config |
| `scope_deviation`  | Discovered scope change needed     | Found additional work required        |
| `other`            | Uncategorized issue                | Any other problems                    |

---

## 🔧 3. Issue Log Tool

### 3.1 Adding Issues

```typescript
governance.issue_log({
  action: "add",
  atpId: "AT-XX-YY",
  issue: {
    category: "tool_failure",
    severity: "error",
    source: "governance.atp_set",
    summary: "Failed to update ATP status",
    details: "Error: Connection timeout after 30s. TCS database unreachable.",
    escalatedTo: "@operator",
  },
});
```

### 3.2 Resolving Issues

```typescript
governance.issue_log({
  action: "resolve",
  atpId: "AT-XX-YY",
  issueId: "ISSUE-001",
  resolution: {
    status: "workaround",
    action: "Retried after 5 seconds, succeeded on second attempt",
  },
});
```

### 3.3 Retrieving Issue Log

```typescript
const log = await governance.issue_log({
  action: "get",
  atpId: "AT-XX-YY",
});
// Returns: { issues: IssueLogEntry[], summary: { total, byCategory, bySeverity } }
```

---

## 📄 4. Issue Log Artifact

### 4.1 Generated at Closure

When `governance.atp_close()` is called, the Issue Log is compiled into a closure artifact:

```markdown
# Issue Log: AT-XX-YY

## Summary

- **Total Issues:** 3
- **Resolved:** 2
- **Unresolved:** 1
- **By Severity:** 0 critical, 1 error, 2 warning

## Issues

### ISSUE-001 (error) - RESOLVED

**Timestamp:** 2026-01-13T10:15:32Z
**Source:** governance.atp_set
**Category:** tool_failure
**Summary:** Failed to update ATP status
**Details:** Error: Connection timeout after 30s. TCS database unreachable.
**Resolution:** (workaround) Retried after 5 seconds, succeeded on second attempt

### ISSUE-002 (warning) - RESOLVED

**Timestamp:** 2026-01-13T10:20:45Z
**Source:** build
**Category:** build_failure
**Summary:** TypeScript warning in generated file
**Details:** Warning: unused variable 'temp' in src/utils/helper.ts:45
**Resolution:** (resolved) Fixed warning by using the variable

### ISSUE-003 (warning) - UNRESOLVED

**Timestamp:** 2026-01-13T10:45:00Z
**Source:** scope_analysis
**Category:** scope_deviation
**Summary:** Discovered additional test coverage needed
**Details:** Found that edge case handling in parseConfig() lacks unit tests
**Resolution:** (deferred) Added to future work - out of current ATP scope
```

### 4.2 Notification to @operator

**At ATP closure, if ANY issues were logged:**

The closure process sends a HITL notification to `@operator`:

```typescript
// Automatic at atp_close when issues exist
governance.message_send({
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P2-Normal",
  subject: `ATP ${atpId} Closed - Issue Log Summary`,
  body: `
    ATP ${atpId} has been closed with ${issueCount} issues logged.
    
    **Summary:**
    - Critical: ${critical}
    - Error: ${errors}
    - Warning: ${warnings}
    
    **Unresolved Issues:** ${unresolvedCount}
    
    Review the full Issue Log artifact for details.
  `,
});
```

---

## 🛡️ 5. Mandatory Logging Rules

### 5.1 When to Log Issues

**ALWAYS log when:**

- ❗ Tool call fails (any governance or workspace tool)
- ❗ Build/test/lint command fails
- ❗ Unexpected error during execution
- ❗ Work is blocked by external factor
- ❗ Scope deviation discovered
- ❗ Had to retry or use workaround

**Do NOT log:**

- Successful operations
- Normal execution flow
- Expected states

### 5.2 Agent Responsibility

| Agent | Logging Responsibility                                                          |
| ----- | ------------------------------------------------------------------------------- |
| @Dev  | Log all tool errors, build failures, blockers encountered during implementation |
| @QA   | Log test failures, validation errors                                            |
| @PM   | Log governance issues, compile final log at closure                             |
| All   | Log any issue that might interest @operator                                     |

---

## 🔗 6. Integration with ATP Lifecycle

### 6.1 Issue Log in Closing Conditions

Every ATP decomposition MUST include Issue Log compilation in closing conditions:

```json
{
  "closingConditions": [
    "All acceptance criteria verified",
    "Build passes",
    "Tests pass",
    "Issue Log compiled (even if empty)",
    "HITL notification sent to @operator if issues exist"
  ]
}
```

### 6.2 Reference in PM Directive

PM directives MUST instruct the executing agent about Issue Log requirements:

```markdown
## Issue Log Requirements

During execution:

1. Log ALL tool errors using `governance.issue_log({ action: 'add', ... })`
2. Log any blockers or unexpected problems
3. Log scope deviations if discovered

At completion:

1. Ensure Issue Log is current
2. Include Issue Log summary in handoff report
3. If unresolved issues exist, flag in handoff
```

---

## 📚 7. Related Policies

- **Parent:** `atp_lifecycle` (ATP Lifecycle Policy)
- **See Also:** `atp_lifecycle_core` (Core ATP closure rules - only @PM can close)
- **See Also:** `agent-handoff` (Handoff requirements)
