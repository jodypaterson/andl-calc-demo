---
id: workflow-status-format
name: Workflow Status Format
category: workflow
description: >-
  Workflow status format for @orchestrator. Template for tracking multi-agent
  workflows, task dependencies, blockers, and progress summaries.
triggerDescription: >-
  FETCH when: @PM or @Orchestrator tracking multi-agent workflow status, reporting
  task dependencies, documenting blockers, or providing progress summary.
  Template for cross-agent coordination and visibility.
triggerKeywords:
  - workflow
  - status
  - progress
  - blocked
  - dependency
  - coordination
version: 1.0.0
displayMode: on-demand
estimatedTokens: 350
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 📊 WORKFLOW STATUS FORMAT

**Template for tracking multi-agent workflows, dependencies, and progress.**

---

## 📋 Status Board Template

```markdown
## Workflow: [Workflow Name]

### 📈 Overall Progress

[▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 40% (4/10 tasks)

### 📊 Status Summary

| Status         | Count |
| -------------- | ----- |
| ✅ Complete    | 4     |
| 🔄 In Progress | 2     |
| ⏸️ Blocked     | 1     |
| ⏳ Pending     | 3     |
```

---

## 📝 Task Board Format

| ID  | Task        | Owner | Status | Deps | Notes             |
| --- | ----------- | ----- | ------ | ---- | ----------------- |
| T1  | [Task name] | @dev  | ✅     | -    | Done              |
| T2  | [Task name] | @dev  | ✅     | T1   | Done              |
| T3  | [Task name] | @qa   | 🔄     | T2   | In progress       |
| T4  | [Task name] | @dev  | ⏸️     | T3   | Blocked on review |
| T5  | [Task name] | @sre  | ⏳     | T4   | Waiting           |

---

## 🚦 Status Icons

| Icon | Meaning                           |
| ---- | --------------------------------- |
| ✅   | Complete                          |
| 🔄   | In Progress                       |
| ⏸️   | Blocked                           |
| ⏳   | Pending (waiting on dependencies) |
| ❌   | Failed                            |
| 🔁   | Retry                             |

---

## ⚠️ Blocker Format

```markdown
### ⚠️ Blockers

**T4 Blocked:** Waiting on code review from @architect

- **Impact:** Delays T5, T6
- **ETA:** [When expected to unblock]
- **Escalation:** [Who to contact if not resolved]
```

---

## 📅 Activity Log Format

```markdown
### 📅 Recent Activity

- [HH:MM] T3 started by @qa
- [HH:MM] T2 completed by @dev
- [HH:MM] T1 completed by @dev
```

---

## 🔗 Dependency Tracking

```text
T1 ──► T2 ──► T4
           ╲
            ╲──► T3 ──► T5
```

- **READY:** Dependencies satisfied
- **WAITING:** Dependencies pending
- **BLOCKED:** Dependencies blocked (cascading)

---

## 📢 Communication Cadence

| Workflow Type    | Update Frequency |
| ---------------- | ---------------- |
| 🔴 Critical (P0) | Every 30 minutes |
| 🟠 High (P1)     | Every 2 hours    |
| 🟡 Normal        | Daily            |
| 🟢 Background    | Weekly           |
