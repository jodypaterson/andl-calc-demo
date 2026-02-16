---
id: adr-format
name: Architecture Decision Record Format
category: governance
description: >-
  Architecture Decision Record format for @architect. Structured template for
  documenting architectural decisions with context, decision, consequences,
  and alternatives considered.
triggerDescription: >-
  FETCH when: @Architect documenting architectural decision, creating ADR,
  evaluating trade-offs, or need decision record template. Structure: context,
  decision, consequences, alternatives considered.
triggerKeywords:
  - architecture
  - decision
  - ADR
  - design
  - trade-off
  - alternative
version: 1.0.0
displayMode: on-demand
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 📐 ARCHITECTURE DECISION RECORD (ADR) FORMAT

**Structured template for documenting significant architectural decisions.**

---

## 📋 When to Create an ADR

Create an ADR when:

- 🏗️ Making a significant architectural choice
- ⚖️ Choosing between competing technologies or patterns
- 📏 Establishing conventions that affect multiple components
- 🔮 Making decisions with long-term implications

---

## 📝 ADR Template

```markdown
# ADR-NNNN: [Title]

## 📌 Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## 🎯 Context

[Describe the issue motivating this decision. What problem are we solving?
What constraints exist? What forces are at play?]

## ✅ Decision

[Describe the change/choice we are making. Be specific and decisive.
"We will..." not "We might..."]

## 📊 Consequences

### ✅ Positive

- [Benefit 1]
- [Benefit 2]

### ❌ Negative

- [Drawback 1]
- [Drawback 2]

### ➖ Neutral

- [Side effect or implication]

## 🔀 Alternatives Considered

### Option A: [Name]

- **Pros:** [...]
- **Cons:** [...]
- **Why rejected:** [...]

### Option B: [Name]

- **Pros:** [...]
- **Cons:** [...]
- **Why rejected:** [...]

## 🔗 References

- [Related ADRs, documents, or resources]
```

---

## 💡 ADR Best Practices

| Practice                 | Example                                             |
| ------------------------ | --------------------------------------------------- |
| 🎯 **Be Specific**       | "Use PostgreSQL for user data" not "Use a database" |
| ⚖️ **State Trade-offs**  | Every decision has costs - acknowledge them         |
| 📖 **Keep Context**      | Future readers need to understand WHY               |
| 🔗 **Link Dependencies** | Reference related ADRs and documents                |
| 🔄 **Update Status**     | Mark deprecated/superseded ADRs promptly            |

---

## 📊 Status Definitions

| Status            | Meaning                            |
| ----------------- | ---------------------------------- |
| 📝 **Proposed**   | Under discussion, not yet approved |
| ✅ **Accepted**   | Approved and in effect             |
| ⚠️ **Deprecated** | No longer recommended, legacy only |
| 🔄 **Superseded** | Replaced by a newer ADR            |
