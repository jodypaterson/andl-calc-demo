---
id: compliance-review-framework
name: Compliance Review Framework
category: governance
description: >-
  Compliance review framework for @governor. Structured approach for evaluating
  policy compliance, documenting violations, and defining remediation paths.
triggerDescription: >-
  FETCH when: @Governor conducting compliance review, auditing governance
  artifacts, validating regulatory requirements, or documenting policy
  violations with remediation paths.
triggerKeywords:
  - compliance
  - policy
  - violation
  - audit
  - governance
  - remediation
version: 1.0.0
displayMode: on-demand
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 📋 COMPLIANCE REVIEW FRAMEWORK

**Structured approach for evaluating policy compliance and managing remediation.**

---

## 🔄 Review Process

### 1️⃣ Scope Definition

- Identify policies applicable to the review target
- Define review boundaries (files, commits, time period)
- List specific compliance criteria

### 2️⃣ Evidence Collection

- Gather artifacts for review
- Document source and timestamp
- Preserve chain of custody

### 3️⃣ Evaluation

- Check each criterion against evidence
- Document PASS/FAIL with rationale
- Note partial compliance where applicable

### 4️⃣ Findings Report

- Summarize compliance status
- List violations with severity
- Provide remediation guidance

---

## 📝 Compliance Report Template

```markdown
## 📋 Compliance Review: [Target]

### 🎯 Review Scope

- **Policies:** [List applicable policies]
- **Period:** [Date range]
- **Artifacts:** [What was reviewed]

### 📊 Summary

| Status           | Count |
| ---------------- | ----- |
| ✅ Compliant     | X     |
| ⚠️ Partial       | X     |
| ❌ Non-compliant | X     |

### 🔍 Findings

#### VIOLATION-001: [Title]

- **Policy:** [Policy ID/Name]
- **Severity:** [Critical | Major | Minor]
- **Evidence:** [Where violation was found]
- **Description:** [What is wrong]
- **Remediation:** [Required steps]
- **Deadline:** [When to fix]

### 💡 Recommendations

1. [Immediate action]
2. [Process improvement]
3. [Training need]
```

---

## 🚦 Severity Classification

| Severity        | Definition                       | Response             |
| --------------- | -------------------------------- | -------------------- |
| 🔴 **Critical** | Security breach, data exposure   | Immediate halt + fix |
| 🟠 **Major**    | Policy violation, compliance gap | Fix within 7 days    |
| 🟡 **Minor**    | Best practice deviation          | Fix within 30 days   |

---

## ✅ Review Principles

| Principle             | Description                                 |
| --------------------- | ------------------------------------------- |
| 📊 **Evidence-Based** | Every finding must cite specific evidence   |
| ⚖️ **Objective**      | Apply rules consistently across all targets |
| 🔧 **Constructive**   | Provide clear path to compliance            |
| 📝 **Documented**     | Maintain audit trail of all decisions       |
| ⏰ **Timely**         | Complete reviews within agreed SLA          |
