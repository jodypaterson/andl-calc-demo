---
id: incident-response-format
name: Incident Response Format
category: safety
description: >-
  Incident response format for @sre. Template for documenting incidents with timeline,
  severity, impact, root cause, and remediation steps.
triggerDescription: >-
  FETCH when: Production incident, service degradation, critical error requiring
  structured response, or post-mortem documentation needed. Provides incident
  template: timeline, severity, impact, root cause, remediation.
triggerKeywords:
  - incident
  - outage
  - production
  - severity
  - post-mortem
  - remediation
version: 1.0.0
displayMode: on-demand
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 🚨 INCIDENT RESPONSE FORMAT

**Template for documenting incidents with timeline, severity, and remediation.**

---

## 📝 Incident Report Template

```markdown
## 🚨 INC-NNNN: [Brief Title]

### 🚦 Severity

[P0: Critical | P1: High | P2: Medium | P3: Low]

### 📊 Status

[Active | Mitigated | Resolved | Post-Mortem Complete]

### 💥 Impact

- **Duration:** [HH:MM - HH:MM TZ]
- **Users Affected:** [Number or percentage]
- **Services Affected:** [List]
- **Business Impact:** [Revenue, reputation, etc.]

### ⏱️ Timeline

| Time (UTC) | Event                          |
| ---------- | ------------------------------ |
| HH:MM      | [Issue detected / Alert fired] |
| HH:MM      | [Investigation started]        |
| HH:MM      | [Root cause identified]        |
| HH:MM      | [Mitigation applied]           |
| HH:MM      | [Full resolution]              |

### 🔍 Root Cause

[Detailed explanation of what caused the incident]

### ✅ Resolution

[Steps taken to resolve the issue]

### 🛡️ Prevention

- [ ] [Action item 1 with owner]
- [ ] [Action item 2 with owner]
- [ ] [Action item 3 with owner]

### 💡 Lessons Learned

- **What went well:** [...]
- **What could improve:** [...]
```

---

## 🚦 Severity Classification

| Severity  | Definition                 | Response Time | Example         |
| --------- | -------------------------- | ------------- | --------------- |
| 🔴 **P0** | Complete outage, data loss | Immediate     | Production down |
| 🟠 **P1** | Major feature broken       | < 1 hour      | Auth failing    |
| 🟡 **P2** | Degraded performance       | < 4 hours     | Slow responses  |
| 🟢 **P3** | Minor issue                | < 24 hours    | UI glitch       |

---

## 📢 Communication Protocol

| Step               | Action                                          |
| ------------------ | ----------------------------------------------- |
| 1️⃣ **Acknowledge** | Confirm incident within SLA                     |
| 2️⃣ **Update**      | Regular status updates (every 30 min for P0/P1) |
| 3️⃣ **Notify**      | Stakeholder communication                       |
| 4️⃣ **Resolve**     | Confirm resolution with evidence                |
| 5️⃣ **Review**      | Schedule post-mortem within 48 hours            |

---

## 📊 Status Icons

| Status               | Icon | Meaning                            |
| -------------------- | ---- | ---------------------------------- |
| Active               | 🔴   | Currently investigating            |
| Mitigated            | 🟠   | Impact reduced, not fully resolved |
| Resolved             | 🟢   | Issue fixed, monitoring            |
| Post-Mortem Complete | ✅   | Review done, actions assigned      |
