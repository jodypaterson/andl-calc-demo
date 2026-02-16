---
id: requirements-doc-format
name: Requirements Documentation Format
category: governance
description: >-
  Requirements documentation format for @pm. Template for capturing objectives,
  acceptance criteria, scope boundaries, and stakeholder needs.
triggerDescription: >-
  FETCH when: @PM writing requirements document, PRD, user story, or acceptance
  criteria. Template includes: objectives, scope boundaries, stakeholder needs,
  success metrics, and constraints.
triggerKeywords:
  - requirements
  - user story
  - acceptance criteria
  - scope
  - stakeholder
version: 1.0.0
displayMode: on-demand
estimatedTokens: 350
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 📝 REQUIREMENTS DOCUMENTATION FORMAT

**Template for capturing objectives, acceptance criteria, and scope.**

---

## 📋 User Story Template

```markdown
## US-NNNN: [Title]

**As a** [role/persona]
**I want** [capability/feature]
**So that** [benefit/value]

### ✅ Acceptance Criteria

- [ ] AC1: [Specific, testable criterion]
- [ ] AC2: [Specific, testable criterion]
- [ ] AC3: [Specific, testable criterion]

### 🎯 Scope

**In Scope:**

- [Included item 1]
- [Included item 2]

**Out of Scope:**

- [Excluded item 1]
- [Excluded item 2]

### 🔗 Dependencies

- [Dependency 1]
- [Dependency 2]

### 📊 Priority

[P0: Critical | P1: High | P2: Medium | P3: Low]

### ⏱️ Effort Estimate

[XS | S | M | L | XL]
```

---

## ✅ Acceptance Criteria Best Practices

| Practice           | Description                                      |
| ------------------ | ------------------------------------------------ |
| 🧪 **Testable**    | Each criterion must be objectively verifiable    |
| 🎯 **Specific**    | "Response time < 200ms" not "Fast response"      |
| 🔀 **Independent** | Each criterion stands alone                      |
| 📦 **Complete**    | Cover happy path, edge cases, error handling     |
| ✂️ **Minimal**     | Capture requirements, not implementation details |

---

## 🎯 Scope Definition Guidelines

| Guideline                 | Rationale                                |
| ------------------------- | ---------------------------------------- |
| 📢 **Be Explicit**        | Ambiguity leads to scope creep           |
| 🚧 **State Boundaries**   | What's OUT is as important as what's IN  |
| 📅 **Document Deferrals** | "Will address in Phase 2" with rationale |
| 🔗 **Link Dependencies**  | If X requires Y, document it             |

---

## 📊 Priority Definitions

| Priority  | Meaning                    | Timeline     |
| --------- | -------------------------- | ------------ |
| 🔴 **P0** | Critical - must have       | Immediate    |
| 🟠 **P1** | High - important           | This sprint  |
| 🟡 **P2** | Medium - nice to have      | This quarter |
| 🟢 **P3** | Low - future consideration | Backlog      |

---

## ⏱️ Effort Estimates

| Size   | Description    | Typical Duration |
| ------ | -------------- | ---------------- |
| **XS** | Trivial change | < 1 hour         |
| **S**  | Small task     | 1-4 hours        |
| **M**  | Medium task    | 1-2 days         |
| **L**  | Large task     | 3-5 days         |
| **XL** | Epic           | 1+ weeks         |
