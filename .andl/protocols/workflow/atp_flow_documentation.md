---
id: atp-flow-documentation
name: Documentation ATP Flow
version: 1.0.0
category: workflow
description: >-
  Simplified flow for documentation-only changes. No QA verification,
  no code review, fast turnaround. PM verifies accuracy only.
displayMode: on-demand
criticality: normal
isTopLevel: false
parentProtocol: atp-lifecycle
triggerDescription: >-
  On-demand policy. Load when making documentation-only changes
  with no code modifications.
triggerKeywords:
  - documentation
  - docs
  - readme
  - changelog
  - docs-only
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-26"
  updatedAt: "2026-01-26"
---

# 📝 DOCUMENTATION ATP FLOW

**Simplified flow for docs-only changes - fast turnaround.**

---

## State Transition Table

| #   | From State | To State   | Agent | Trigger           | Tool                      |
| --- | ---------- | ---------- | ----- | ----------------- | ------------------------- |
| 1   | Queued     | InProgress | @PM   | Start             | `atp_set`, `message_send` |
| 2   | InProgress | InProgress | @Dev  | Receive           | `message_ack`             |
| 3   | InProgress | Complete   | @Dev  | Docs written      | `atp_set`, `handoff`      |
| 4   | Complete   | Closed     | @PM   | Accuracy verified | `atp_close`               |

---

## ASCII Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION ATP FLOW                        │
└──────────────────────────────────────────────────────────────────┘

     ┌────────┐       ┌────────────┐       ┌──────────┐       ┌────────┐
     │ Queued │──────▶│ InProgress │──────▶│ Complete │──────▶│ Closed │
     └────────┘       └────────────┘       └──────────┘       └────────┘
         │                 │                    │
         │ @PM issues      │ @Dev               │ @PM verifies
         │ directive       │ writes docs        │ accuracy only
         │                 │                    │
         └─────────────────┴────────────────────┘
                    SIMPLIFIED PATH
                  (No QA, No Review)
```

---

## Key Characteristics

| Aspect          | Documentation Behavior |
| --------------- | ---------------------- |
| Queue           | Normal or low priority |
| Code review     | **SKIPPED**            |
| QA verification | **SKIPPED**            |
| PM verification | **Accuracy only**      |
| Turnaround      | **Fast**               |

---

## Documentation Handoff Sequence

### 1. PM Issues Directive

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@pm",
  toAgent: "@dev",
  messageType: "Directive",
  priority: "P3-Low",
  subject: "Documentation: [Topic]",
  body: `## Documentation Task

**Scope:** [What needs to be documented]

## Deliverables
- [ ] README section for [feature]
- [ ] CHANGELOG entry
- [ ] API documentation
- [ ] Usage examples

## Quality Standards
- Clear and concise language
- Accurate technical details
- Working code examples
- Proper formatting
`,
});
```

### 2. Dev Writes Documentation

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@dev",
  toAgent: "@pm",
  messageType: "Handoff",
  priority: "P2-Normal",
  subject: "Handoff: AT-XX-YY - Documentation Complete",
  body: `## Documentation Complete

### Completed Work
- All docs written

### Pending Work
- PM review for accuracy
- Close

### Evidence
- docs/feature.md
- README.md:L45-L78
- CHANGELOG.md`,
  requiresAck: false,
});
```

### 3. PM Verifies and Closes

```typescript
// PM checks accuracy only - no QA/review
// Create PM Verification Report
governance.artifact_create({
  atpId: "AT-XX-YY",
  artifactType: "PMVerificationReport",
  title: "PM Verification Report: AT-XX-YY",
  content: "... documentation review summary ...",
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
  body: "Documentation updated and verified...",
});
```

---

## 🛑 MESSAGE BOUNDARY RULE

**Closure ENDS your message.** Do NOT continue with next ATP in the same message.

---

## PM Verification Checklist

| Check        | Criteria                   |
| ------------ | -------------------------- |
| Accuracy     | Technical details correct? |
| Completeness | All sections covered?      |
| Clarity      | Easy to understand?        |
| Examples     | Code samples work?         |
| Formatting   | Proper markdown/style?     |

---

## When to Use

✅ README updates
✅ CHANGELOG entries
✅ API documentation
✅ Usage guides
✅ Architecture docs
✅ Comments/JSDoc

---

## When NOT to Use

❌ Code changes included
❌ Configuration changes
❌ Test file modifications
❌ Anything that could break build

---

## Related Flows

- `atp-flow-standard` - When code is involved
- `atp-flow-enhancement` - For features with docs
