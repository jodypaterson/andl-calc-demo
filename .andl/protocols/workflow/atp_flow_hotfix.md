---
id: atp-flow-hotfix
name: Hotfix ATP Flow
version: 1.0.0
category: workflow
description: >-
  Expedited flow for production incident fixes. Bypasses normal queue,
  has minimal verification, requires post-incident review. Use for
  urgent production issues that need immediate resolution.
displayMode: on-demand
criticality: critical
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  On-demand policy. Load when handling production incidents or
  urgent fixes that need expedited processing.
triggerKeywords:
  - hotfix
  - production fix
  - urgent fix
  - incident
  - expedited
estimatedTokens: 600
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
---

# 🔥 HOTFIX ATP FLOW

**Expedited flow for production incident resolution.**

---

## State Transition Table

| #   | From State | To State   | Agent | Trigger           | Tool                      |
| --- | ---------- | ---------- | ----- | ----------------- | ------------------------- |
| 1   | (new)      | InProgress | @PM   | Incident reported | `atp_set`, `message_send` |
| 2   | InProgress | InProgress | @Dev  | Immediate start   | `message_ack`             |
| 3   | InProgress | Complete   | @Dev  | Fix ready         | `atp_set`, `handoff`      |
| 4   | Complete   | Closed     | @PM   | Quick verify      | `atp_close`               |
| 5   | (post)     | Queued     | @PM   | Create follow-up  | `atp_create`              |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       HOTFIX ATP FLOW                            │
└──────────────────────────────────────────────────────────────────┘

     🚨 INCIDENT            IMMEDIATE              QUICK           FOLLOW-UP
     ┌──────────┐          ┌───────────┐         ┌────────┐       ┌─────────┐
     │ Reported │─────────▶│ InProgress│────────▶│ Closed │──────▶│ Review  │
     └──────────┘          └───────────┘         └────────┘       │   ATP   │
          │                      │                    │           └─────────┘
          │                      │                    │
          │ @PM creates          │ @Dev               │ @PM
          │ urgent ATP           │ fixes              │ verifies
          │ BYPASSES QUEUE       │ immediately        │ & closes
          │                      │                    │
          └──────────────────────┴────────────────────┘
                         EXPEDITED PATH
```

---

## Key Characteristics

| Aspect         | Hotfix Behavior                      |
| -------------- | ------------------------------------ |
| Queue priority | **Bypasses queue** - immediate start |
| Verification   | **Minimal** - critical path only     |
| Code review    | **Skipped** (captured in follow-up)  |
| Documentation  | **Deferred** to follow-up ATP        |
| Post-incident  | **Required** - create review ATP     |

---

## Expedited Handoff Sequence

### 1. PM Creates Urgent ATP

```typescript
// IMMEDIATE - no queue
governance.atp_set({
  atpId: "AT-XX-YY",
  status: "InProgress", // Direct to InProgress
  agent: "@pm",
  notes: "HOTFIX: Production incident",
});

governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P0-Critical", // Highest priority
  subject: "🔥 HOTFIX: [Incident Description]",
  body: "## URGENT: Production Fix Required\n...",
});
```

### 2. Dev Immediate Response

```typescript
// Drop current work
governance.message_ack({
  messageId: "msg-xxx",
  agent: "@dev",
  notes: "Acknowledged, starting immediately",
});

// Work on fix...

// Fast handoff
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P1-High",
  subject: "Handoff: AT-XX-YY - Hotfix Ready",
  body: `## Hotfix Ready for Deployment

### Completed Work
- Fix implemented and tested

### Pending Work
- Deploy
- Verify
- Close

### Evidence
- Tests pass
- Build passes`,
  requiresAck: false,
});
```

### 3. PM Quick Close

```typescript
// Create PM Verification Report (abbreviated for hotfix)
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY (Hotfix)",
  content: "... hotfix verification summary ...",
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
  subject: "ATP Closed: AT-XX-YY (Hotfix)",
  body: "Hotfix deployed successfully...",
});

// REQUIRED: Create follow-up ATP
governance.atp_create({
  title: "Post-Incident Review: [Original Issue]",
  type: "review",
  notes: "Follow-up from hotfix AT-XX-YY",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE

**Closure ENDS your message.** Do NOT continue with next ATP in the same message.

---

## Quality Gates (Minimal)

| Gate                        | Criteria            | Full Review Later |
| --------------------------- | ------------------- | ----------------- |
| Does it fix the issue?      | Yes                 | ✅                |
| Does it break other things? | No obvious breakage | ✅                |
| Can we revert if needed?    | Yes                 | ✅                |

---

## When to Use

✅ Production is down or degraded
✅ Customer-impacting issue
✅ Security vulnerability (active exploit)
✅ Data integrity at risk

---

## When NOT to Use

❌ Issue can wait until next sprint
❌ Non-production environments
❌ Feature requests
❌ "Nice to have" improvements

---

## Post-Incident Requirements

**MANDATORY: Create follow-up ATP for:**

1. Root cause analysis
2. Permanent fix (if hotfix was temporary)
3. Test coverage addition
4. Documentation update
5. Process improvement

---

## Related Flows

- `atp-flow-emergency` - For Severity 1 (more urgent)
- `atp-flow-bugfix` - For non-urgent bugs
- `atp-flow-standard` - Normal development
