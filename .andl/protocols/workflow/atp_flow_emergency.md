---
id: atp-flow-emergency
name: Emergency ATP Flow
version: 1.0.0
category: workflow
description: >-
  Critical production fix flow for Severity 1 incidents. Highest priority,
  all hands on deck, HITL notifications on every transition, mandatory
  postmortem after resolution.
displayMode: on-demand
criticality: critical
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  On-demand policy. Load for Severity 1 incidents - production down,
  security breach, data loss risk.
triggerKeywords:
  - emergency
  - severity 1
  - sev1
  - production down
  - critical incident
  - outage
estimatedTokens: 650
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
---

# 🚨 EMERGENCY ATP FLOW (Severity 1)

**Critical incident response - highest priority, all gates expedited.**

---

## State Transition Table

| #   | From State | To State   | Agent | Trigger           | Tool                      | HITL |
| --- | ---------- | ---------- | ----- | ----------------- | ------------------------- | ---- |
| 1   | (alert)    | InProgress | @PM   | Sev-1 detected    | `atp_set`, `message_send` | ✅   |
| 2   | InProgress | InProgress | @Dev  | Immediate         | `message_ack`             | ✅   |
| 3   | InProgress | Complete   | @Dev  | Fix ready         | `handoff`                 | ✅   |
| 4   | Complete   | Deployed   | @SRE  | Deploy approved   | External                  | ✅   |
| 5   | Deployed   | Closed     | @PM   | Incident resolved | `atp_close`               | ✅   |
| 6   | (post)     | Queued     | @PM   | Postmortem        | `atp_create`              | ✅   |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│               🚨 EMERGENCY ATP FLOW (SEV-1) 🚨                   │
└──────────────────────────────────────────────────────────────────┘

   HITL ✅        HITL ✅         HITL ✅        HITL ✅       HITL ✅
     │              │               │              │             │
     ▼              ▼               ▼              ▼             ▼
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐
│  ALERT  │──▶│ InProgress│──▶│ Complete │──▶│ Deployed │──▶│ Closed  │
└─────────┘   └───────────┘   └──────────┘   └──────────┘   └─────────┘
     │              │               │              │             │
     │ @PM          │ @Dev          │ @PM          │ @SRE        │ @PM
     │ escalates    │ fixes         │ approves     │ deploys     │ postmortem
     │ IMMEDIATE    │ DROP ALL      │ FAST         │ NOW         │ REQUIRED
     │              │               │              │             │
     └──────────────┴───────────────┴──────────────┴─────────────┘
                          ALL TRANSITIONS NOTIFY HITL
```

---

## Key Characteristics

| Aspect            | Emergency Behavior                    |
| ----------------- | ------------------------------------- |
| Priority          | **P0 - Critical** (highest)           |
| Queue             | **Bypassed** - immediate execution    |
| All other work    | **HALTED** - this takes precedence    |
| HITL notification | **Every transition**                  |
| Verification      | **Expedited** - essential checks only |
| Postmortem        | **MANDATORY** within 24h              |

---

## Emergency Sequence

### 1. Incident Detection → ATP Creation

```typescript
// IMMEDIATE ATP creation
governance.atp_set({
  atpId: "AT-EMRG-01",
  status: "InProgress",
  agent: "@pm",
  notes: "🚨 SEV-1: [Critical Description]",
});

// HITL notification
governance.message_send({
  atpId: "AT-EMRG-01",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P0-Critical",
  subject: "🚨 SEV-1 INCIDENT: [Description]",
  body: "## INCIDENT DECLARED\n\nImmediate action required...",
});

// Directive to Dev
governance.message_send({
  atpId: "AT-EMRG-01",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "EmergencyDirective",
  priority: "P0-Critical",
  subject: "🚨 EMERGENCY: Fix Required NOW",
  body: "## DROP ALL OTHER WORK\n\n...",
});
```

### 2. Dev Emergency Response

```typescript
// Acknowledge and start IMMEDIATELY
governance.message_ack({
  messageId: "msg-xxx",
  agent: "@dev",
  notes: "ACKNOWLEDGED - Starting emergency fix",
});

// Work on fix...

// Emergency handoff
governance.message_send({
  atpId: "AT-EMRG-01",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P0-Critical",
  subject: "Handoff: AT-EMRG-01 - Emergency Fix Ready",
  body: `## Emergency Fix Ready

### Completed Work
- Fix implemented
- Minimal testing done

### Pending Work
- Approve
- Deploy
- Monitor

### Evidence
- Build passes
- Critical tests pass`,
  requiresAck: false,
});

// HITL notification
governance.message_send({
  atpId: "AT-EMRG-01",
  fromAgent: "@dev",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P0-Critical",
  subject: "🚨 FIX READY: Awaiting Deployment",
  body: "Emergency fix completed...",
});
```

### 3. Deployment & Resolution

```typescript
// Create PM Verification Report (abbreviated for emergency)
governance.artifact_create({
  atpId: "AT-EMRG-01",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-EMRG-01 (Emergency)",
  content: "... emergency resolution summary ...",
  persist: "both",
});

// Close ATP
governance.atp_change_status({
  atpId: "AT-EMRG-01",
  status: "Closed",
});

// MANDATORY: Create postmortem ATP
governance.message_send({
  atpId: "AT-EMRG-01",
  fromAgent: "@pm",
  toAgent: "@operator",
  messageType: "HITLNotification",
  priority: "P1-High",
  subject: "✅ INCIDENT RESOLVED - Postmortem Required",
  body: "## Incident Closed\n\nPostmortem ATP created: AT-POST-01",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE

**Closure ENDS your message.** Do NOT continue with next ATP in the same message.

---

## Quality Gates (Expedited)

| Gate                       | Criteria | Documentation |
| -------------------------- | -------- | ------------- |
| Does it stop the bleeding? | Yes      | ✅            |
| Is rollback possible?      | Yes      | ✅            |
| Minimal blast radius?      | Verified | ✅            |

---

## When to Use

✅ Production is completely down
✅ Active security breach
✅ Data loss occurring
✅ Customer SLA at risk
✅ Financial impact per minute

---

## Severity 1 Criteria

| Category     | Examples                     |
| ------------ | ---------------------------- |
| Availability | Service 100% down            |
| Security     | Active exploit, data breach  |
| Data         | Corruption or loss occurring |
| Financial    | >$X/minute impact            |
| Reputation   | Public-facing outage         |

---

## Post-Incident Requirements (MANDATORY)

**Within 24 hours, create postmortem ATP covering:**

1. **Timeline:** When detected, responded, resolved
2. **Root cause:** What actually broke
3. **Impact:** Users affected, data lost, SLA breach
4. **Resolution:** What fixed it
5. **Prevention:** How to avoid recurrence
6. **Action items:** ATPs for permanent fixes

---

## Related Flows

- `atp-flow-hotfix` - For urgent but not Sev-1
- `atp-flow-bugfix` - For normal defects
- `atp-flow-standard` - Normal development
