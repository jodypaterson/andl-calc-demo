---
id: atp-stale-closure
name: Stale ATP Closure Protocol
version: 3.0.0
category: governance
description: >-
  MANDATORY protocol for handling ATPs discovered to be already complete during
  directive preparation. PM closes ATP directly - NO DEV INVOLVEMENT.
  Uses governance.atp_change_status tool. Escalates to HITL on any failure.
displayMode: on-demand
criticality: critical
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  TRIGGERED when @PM prepares to issue a directive but discovers acceptance
  criteria are already satisfied. Staleness detected = EXECUTE THIS PROTOCOL.
triggerKeywords:
  - stale
  - staleness
  - already complete
  - already implemented
  - work exists
  - pre-existing
  - do not issue directive
estimatedTokens: 1000
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-27"
---

# STALE ATP CLOSURE PROTOCOL (v3.0)

## CRITICAL: PM CLOSES DIRECTLY - NO DEV INVOLVEMENT

When @PM detects an ATP is stale (work already complete):
1. **DO NOT issue directive to @Dev** - that creates infinite loops
2. **DO NOT send messages to @Dev** - PM handles closure autonomously
3. **Close ATP directly** using `governance.atp_change_status`
4. **Notify @operator** (HITL) of the closure

---

## 1. TRIGGER CONDITION

This protocol is triggered when:
- Pre-directive validation shows acceptance criteria already met
- Files/code already exist that satisfy ATP requirements  
- Tests already passing for the ATP's scope
- Work was completed in previous session without closure

**DETECTION = IMMEDIATE AUTONOMOUS CLOSURE BY PM**

---

## 2. AVAILABLE TOOLS (USE THESE EXACTLY)

### 2.1 ATP Status Change Tool

**Tool Name:** `governance.atp_change_status`

**⚠️ CLOSURE REQUIRES BOTH STATUS AND STAGE:**

An ATP is ONLY properly closed when:
- `status = 'done'` (terminal workflow state)
- `stage = 'done'` (terminal SDLC position, lowercase!)

**FAILSAFE: The tool auto-corrects closure intent.** If you set EITHER field to a 
completion value (Complete, Closed, Done, done), the tool automatically sets BOTH:
- `status` → `Closed`
- `stage` → `done`

This makes it **IMPOSSIBLE to close an ATP incorrectly** - both fields are always 
set together when closure intent is detected.

**Parameters:**

| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| atpId | string | YES | ATP ID (e.g., "917") |
| status | string | RECOMMENDED | "Closed" (auto-sets stage='done') |
| stage | string | RECOMMENDED | "done" (auto-sets status='done') |
| agent | string | YES | "@pm" |

**Example (any of these work - tool auto-corrects):**
```javascript
// Option 1: Set both explicitly (clearest)
governance.atp_change_status({
  atpId: '917',
  status: 'Closed',
  stage: 'done',
  agent: '@pm'
})

// Option 2: Set just status (stage auto-corrects to 'done')
governance.atp_change_status({
  atpId: '917',
  status: 'Closed',
  agent: '@pm'
})

// Option 3: Set just stage (status auto-corrects to 'Closed')
governance.atp_change_status({
  atpId: '917',
  stage: 'done',
  agent: '@pm'
})
```
```

### 2.2 Artifact Creation Tool

**Tool Name:** `governance.artifact_create`

### 2.3 Message Send Tool  

**Tool Name:** `governance.message_send`

**WARNING: For stale ATP closure, ONLY send to @operator - NEVER to @dev**

---

## 3. MANDATORY 3-STEP WORKFLOW

### Step 1: PM Verification and Artifact (REQUIRED)

Verify all acceptance criteria, then create artifact:

```javascript
governance.artifact_create({
  atpId: '[ATP-ID]',
  artifactType: 'PMVerificationReport',
  title: 'PM Verification Report: ATP [ATP-ID] (Stale Closure)',
  content: `# PM Verification Report

## STALENESS DETECTED - VERIFIED COMPLETE

**ATP:** [ATP-ID] - [Title]
**Verification Type:** Stale ATP Closure  
**Verification Date:** [ISO date]
**Verified By:** @pm

---

## Acceptance Criteria Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | [criterion] | MET | [file:line] |
| 2 | [criterion] | MET | [file:line] |

## Quality Score: [X]/10

## Root Cause
[ATP created without codebase validation / Previous session / Unknown]

---
APPROVED FOR CLOSURE
`
})
```

---

### Step 2: Close ATP (REQUIRED - CRITICAL)

**USE CORRECT TOOL: governance.atp_change_status**

```javascript
governance.atp_change_status({
  atpId: '[ATP-ID]',      // e.g., '917'
  status: 'Complete',      // Must be 'Complete'
  stage: 'done',           // Must be lowercase 'done'
  agent: '@pm'             // PM is closing
})
```

**Expected Response:**
```json
{
  "success": true,
  "atpId": "917",
  "previousStatus": "Queued",
  "newStatus": "Complete",
  "previousStage": "backlog",
  "newStage": "done",
  "changed": true,
  "message": "ATP 917 status updated successfully"
}
```

**IF TOOL RETURNS ERROR:**
- DO NOT retry
- DO NOT message @dev
- Immediately proceed to HITL escalation (Step 3) with error details

---

### Step 3: HITL Notification (REQUIRED)

**Notify @operator of closure (success or failure):**

```javascript
governance.message_send({
  atpId: '[ATP-ID]',
  fromAgent: '@pm',
  toAgent: '@operator',  // ONLY @operator - NEVER @dev
  messageType: 'HITLNotification',
  priority: 'P3-Low',
  subject: 'ATP [ATP-ID] Stale Closure: [SUCCESS/FAILED]',
  body: `**To:** @operator
**From:** @pm
**Subject:** ATP [ATP-ID] Stale Closure Complete
**Date:** [ISO date]

---

## Summary

ATP [ATP-ID] was found to be already complete during directive preparation.

**Closure Status:** SUCCESS or FAILED
**Tool Used:** governance.atp_change_status
**New Status:** Complete
**New Stage:** done

### Artifacts Created
- PMVerificationReport: [artifact ID]

### Root Cause
[Reason for staleness]

---
No @Dev directive was issued (per Stale ATP Closure Protocol).
`
})
```

---

## 4. ANTI-PATTERNS (PROHIBITED)

| NEVER DO | ALWAYS DO |
|----------|-----------|
| Send message to @dev | Send ONLY to @operator |
| Use governance.atp_close | Use governance.atp_change_status |
| Issue directive to @Dev | Close ATP directly as PM |
| Retry failed tools | Escalate to HITL on failure |
| Use stage="Complete" | Use stage="done" (lowercase) |
| Wait for Dev response | Act autonomously |

---

## 5. REQUIRED TOOL CALL SEQUENCE (EXACTLY 3 CALLS)

```
1. governance.artifact_create({ artifactType: 'PMVerificationReport', ... })
2. governance.atp_change_status({ atpId: '...', status: 'Complete', stage: 'done', agent: '@pm' })
3. governance.message_send({ toAgent: '@operator', ... HITLNotification ... })
```

**NO MESSAGES TO @DEV. PM ACTS AUTONOMOUSLY.**

---

## 6. ERROR HANDLING (CRITICAL)

### If governance.atp_change_status fails:

1. **DO NOT RETRY** the tool call
2. **DO NOT message @dev** asking for help  
3. **IMMEDIATELY notify @operator** with error details:

```javascript
governance.message_send({
  atpId: '[ATP-ID]',
  fromAgent: '@pm',
  toAgent: '@operator',  // ESCALATE TO HITL
  messageType: 'HITLEscalation',
  priority: 'P1-Critical',
  subject: 'ESCALATION: ATP [ATP-ID] Closure Failed',
  body: `**To:** @operator
**From:** @pm
**Subject:** ESCALATION: ATP [ATP-ID] Closure Failed
**Date:** [ISO date]

---

## ESCALATION: Tool Failure

**ATP:** [ATP-ID]
**Tool:** governance.atp_change_status
**Error:** [exact error message]

### What Happened
PM detected ATP was stale and attempted closure, but the tool failed.

### Action Required
Manual intervention needed to close ATP [ATP-ID].

### PM Verification
Work was verified complete (see PMVerificationReport artifact).

---
**Severity:** P1-Critical - ATP stuck in incorrect state
`
})
```

4. **STOP** - Do not continue. Wait for operator intervention.

---

## 7. SUCCESS CRITERIA

After completing this protocol:

- [ ] PMVerificationReport artifact created
- [ ] governance.atp_change_status called with status='completed', stage='done'
- [ ] HITL notification sent to @operator (NOT @dev)
- [ ] NO messages sent to @dev
- [ ] ATP status is now Complete, stage is done

**IF TOOL FAILED: Escalation sent to @operator, PM stopped and waiting.**
