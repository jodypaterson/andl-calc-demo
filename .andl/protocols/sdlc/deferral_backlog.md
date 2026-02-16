---
id: deferral-backlog
name: Deferral & Backlog Policy
version: 1.0.0
category: governance
description: >-
  Policy for deferring work outside current scope to backlog. Covers scope
  boundaries, deferral criteria, structured deferral template with rationale,
  and backlog management for Phase 2/3 features.
displayMode: on-demand
criticality: medium
parentProtocol: sdlc-master
triggerDescription: >-
  FETCH when: @Dev discovers work outside current scope, needs to defer feature
  to Phase 2/3, add item to backlog, or document scope reduction decision.
  Provides structured deferral template with rationale.
triggerKeywords:
  - defer
  - backlog
  - future
  - phase 2
  - later
  - parking lot
  - out of scope
---

# 📋 DEFERRAL & BACKLOG POLICY

**Add items to feature backlog or defer work to future phases.**

---

## 🔍 1. When to Defer

Work should be deferred to the backlog when:

### 1.1 Scope Boundaries

| Situation                   | Action               | Example                                           |
| --------------------------- | -------------------- | ------------------------------------------------- |
| 🔲 Beyond current ATP scope | Defer to backlog     | Nice-to-have discovered during implementation     |
| 📅 Phase 2/3 feature        | Defer with phase tag | Advanced capability for future release            |
| ⚡ Enhancement opportunity  | Defer as enhancement | Refactoring opportunity not blocking current work |
| 💰 Marketplace feature      | Defer as marketplace | User-facing feature for future monetization       |

### 1.2 Resource Constraints

| Constraint              | Description                              |
| ----------------------- | ---------------------------------------- |
| ⏱️ **Time constraint**  | Cannot complete within current timeline  |
| 📈 **Complexity spike** | Would significantly delay current ATP    |
| 🧠 **Expertise needed** | Requires skills not currently available  |
| 🔗 **Dependency**       | Waiting on prerequisite not yet complete |

### 1.3 Strategic Decisions

| Reason                    | Description                             |
| ------------------------- | --------------------------------------- |
| 📊 **Deliberate phasing** | Intentionally saved for later           |
| 🛡️ **Risk reduction**     | Deferring to reduce current scope risk  |
| 📖 **Learning needed**    | Need more information before proceeding |
| 📅 **Market timing**      | Feature appropriate for future release  |

---

## 📝 2. Deferral Process

### 2.1 Immediate Deferral (During AT Work)

When @dev discovers deferrable work during AT implementation:

1. **📝 Note in handoff report:** Mention discovery for PM
2. **🚫 Do NOT add to backlog directly:** PM manages backlog entries
3. **▶️ Continue current work:** Don't get sidetracked

**Example in handoff:**

```markdown
### 💡 Discovered Deferrable Work

- **Enhancement:** Could optimize X with approach Y (est. 4h)
- **Future Feature:** Users might benefit from Z capability
- **Refactoring:** File ABC.ts would benefit from cleanup

_Mentioned for PM to add to Feature Backlog if appropriate._
```

### 2.2 Planned Deferral (ATP Planning)

When PM defers work during planning:

1. **📋 Create backlog entry** in `governance/core-tracking/FEATURE_BACKLOG.md`
2. **🏷️ Tag appropriately:** Phase, priority, category
3. **🔗 Link to source:** Reference AT/ATP where identified
4. **📊 Estimate effort:** Rough T-shirt sizing

---

## 📝 3. Backlog Entry Format

Use this template for backlog entries:

```markdown
## FB-YYYYMMDD-NN: [Feature Title]

**Category:** [enhancement|feature|refactoring|technical-debt|marketplace]
**Phase Target:** [P2|P3|P4|Unscheduled]
**Priority:** [🔴 high|🟡 medium|🟢 low]
**Effort Estimate:** [S|M|L|XL]
**Source:** [AT-XXX|ATP-XX|Discovery]

### Description

[2-3 sentence description of what this feature/enhancement would do]

### Value Proposition

[Why this is worth doing - user benefit, technical benefit, business value]

### Dependencies

- [Prerequisites or blocking items, if any]

### Notes

[Any additional context, constraints, or considerations]

---

_Added: YYYY-MM-DD by @pm_
```

---

## 🏷️ 4. Category Definitions

| Category           | Icon | Definition                   | Examples                                        |
| ------------------ | ---- | ---------------------------- | ----------------------------------------------- |
| **enhancement**    | ⚡   | Improves existing capability | Better error messages, performance optimization |
| **feature**        | ✨   | New user-facing capability   | New command, new UI element                     |
| **refactoring**    | 🔄   | Code quality improvement     | Architecture cleanup, pattern standardization   |
| **technical-debt** | 🔧   | Fix known shortcuts          | Remove workarounds, update deprecated APIs      |
| **marketplace**    | 💰   | Revenue/monetization feature | Premium capability, integration                 |

---

## 📅 5. Phase Definitions

| Phase           | Timeline    | Definition                          |
| --------------- | ----------- | ----------------------------------- |
| **P2**          | Near-term   | Next major phase after current      |
| **P3**          | Medium-term | Future planned phase                |
| **P4**          | Long-term   | Long-term vision                    |
| **Unscheduled** | TBD         | No phase assigned yet (parking lot) |

---

## 🔄 6. Backlog Lifecycle

```text
Created → Triaged → Scheduled → In Progress → Done
                  ↓
               Archived (if superseded/cancelled)
```

### 6.1 Triage Process

PM reviews new backlog entries periodically:

| Step              | Action                         |
| ----------------- | ------------------------------ |
| 🔍 **Validate**   | Is this still relevant?        |
| 📝 **Clarify**    | Is the description sufficient? |
| 📊 **Estimate**   | Refine effort estimate         |
| 🎯 **Prioritize** | Set priority based on value    |
| 📅 **Schedule**   | Assign to phase if appropriate |

### 6.2 Backlog Grooming

Regular backlog review includes:

| Activity                      | Frequency                       |
| ----------------------------- | ------------------------------- |
| 🧹 **Remove stale items**     | Quarterly                       |
| 🔄 **Reprioritize**           | Monthly or at phase transitions |
| 🔗 **Consolidate duplicates** | As discovered                   |
| 📊 **Update estimates**       | When new information available  |

---

## 📊 7. Priority Guidelines

| Priority      | Criteria                                             | Action                  |
| ------------- | ---------------------------------------------------- | ----------------------- |
| 🔴 **High**   | Blocking other work, high user value, time-sensitive | Schedule in next phase  |
| 🟡 **Medium** | Improves experience, moderate value                  | Consider for next phase |
| 🟢 **Low**    | Nice-to-have, limited scope, exploratory             | Backlog until capacity  |

---

## 🚫 8. Anti-Patterns

| ❌ Anti-Pattern                 | ✅ Correct Behavior          |
| ------------------------------- | ---------------------------- |
| @dev adding directly to backlog | Mention in handoff, PM adds  |
| Vague descriptions              | Specific, actionable entries |
| No value proposition            | Explain why it matters       |
| Missing estimates               | At least T-shirt size        |
| Never grooming                  | Regular review and cleanup   |

---

## 💡 9. Best Practices

| Practice                     | Benefit                      |
| ---------------------------- | ---------------------------- |
| 🔗 **Link to source**        | Context preserved for future |
| 📊 **Include estimates**     | Easier prioritization        |
| 🎯 **One feature per entry** | Clear scope boundaries       |
| 📝 **Describe value**        | Helps prioritization         |
| 🏷️ **Tag consistently**      | Better filtering/search      |
