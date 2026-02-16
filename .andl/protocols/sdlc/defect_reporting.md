---
id: defect-reporting
name: Defect Reporting Format
category: sdlc
description: >-
  Defect reporting format for @qa. Template for documenting bugs with reproduction
  steps, expected vs actual behavior, severity classification, and environment details.
triggerDescription: >-
  FETCH when: @QA reporting bug/defect, documenting test failure, or need
  structured defect template. Includes: reproduction steps, expected vs actual,
  severity classification, environment details.
triggerKeywords:
  - bug
  - defect
  - issue
  - reproduction
  - severity
  - regression
version: 1.0.0
displayMode: on-demand
estimatedTokens: 300
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 🐛 DEFECT REPORTING FORMAT

**Template for documenting bugs with reproduction steps and severity.**

---

## 📝 Bug Report Template

```markdown
## 🐛 BUG-NNNN: [Brief Title]

### 🚦 Severity

[Critical | Major | Minor | Trivial]

### 📊 Priority

[P0: Immediate | P1: High | P2: Medium | P3: Low]

### 📋 Summary

[One-sentence description of the issue]

### 💻 Environment

- **OS:** [e.g., macOS 14.2]
- **Browser/Runtime:** [e.g., VS Code 1.85, Node 20.10]
- **Version:** [e.g., andl-ai-client@1.0.0-alpha.3]

### 🔄 Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

### ✅ Expected Behavior

[What should happen]

### ❌ Actual Behavior

[What actually happens]

### 📎 Evidence

- **Screenshot/Recording:** [link]
- **Error logs:** [paste or link]
- **Stack trace:** [if available]

### 🔍 Root Cause (if known)

[Initial analysis of what might be causing the issue]

### 🛠️ Workaround (if any)

[Temporary solution users can apply]
```

---

## 🚦 Severity Classification

| Severity        | Definition                                  | Example               |
| --------------- | ------------------------------------------- | --------------------- |
| 🔴 **Critical** | System unusable, data loss, security breach | App crashes on launch |
| 🟠 **Major**    | Core feature broken, no workaround          | Cannot save files     |
| 🟡 **Minor**    | Feature impaired but workaround exists      | Export works but slow |
| 🟢 **Trivial**  | Cosmetic or minor inconvenience             | Typo in UI            |

---

## ✅ Best Practices

| Practice               | Description                                |
| ---------------------- | ------------------------------------------ |
| 🔄 **Reproducible**    | Include exact steps to trigger the bug     |
| 🔬 **Isolated**        | Verify it's not environment-specific first |
| ✂️ **Minimal**         | Reduce to smallest reproduction case       |
| 📎 **Evidence**        | Attach screenshots, logs, or recordings    |
| 📝 **Separate Issues** | One bug per report                         |
