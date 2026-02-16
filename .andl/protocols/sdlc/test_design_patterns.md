---
id: test-design-patterns
name: Test Design Patterns
category: sdlc
description: >-
  Test design patterns and strategies for @qa. Covers test types, coverage strategies,
  edge case identification, and test data management.
triggerDescription: >-
  FETCH when: @Dev or @QA designing tests, writing test cases, identifying edge
  cases, or need testing strategy guidance. Covers unit/integration patterns,
  coverage strategies, test data management.
triggerKeywords:
  - test
  - coverage
  - edge case
  - unit test
  - integration
  - testing
version: 1.0.0
displayMode: on-demand
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-09"
  updatedAt: "2026-01-10"
---

# 🧪 TEST DESIGN PATTERNS

**Comprehensive guide to test types, coverage strategies, and best practices.**

---

## 📐 Test Pyramid

```text
        /\
       /  \     🔴 E2E Tests (few, slow, high confidence)
      /----\
     /      \   🟠 Integration Tests (medium count)
    /--------\
   /          \ 🟢 Unit Tests (many, fast, isolated)
  /------------\
```

---

## 📋 Test Types and When to Use

| Type               | Purpose                                 | Scope            | Speed  |
| ------------------ | --------------------------------------- | ---------------- | ------ |
| 🟢 **Unit**        | Test single function/class in isolation | One module       | Fast   |
| 🟠 **Integration** | Test component interactions             | Multiple modules | Medium |
| 🔴 **E2E**         | Test complete user flows                | Entire system    | Slow   |
| 📄 **Contract**    | Verify API boundaries                   | API surface      | Fast   |
| 📸 **Snapshot**    | Detect unintended changes               | Output format    | Fast   |

---

## ⚠️ Edge Case Categories

### 📥 Input Edge Cases

- Empty/null/undefined inputs
- Maximum/minimum values
- Boundary conditions (off-by-one)
- Invalid types
- Unicode/special characters

### 🔄 State Edge Cases

- First use / empty state
- Maximum capacity
- Concurrent access
- Recovery from error state

### 🌐 Environment Edge Cases

- Network failures
- Disk full
- Permission denied
- Clock skew / timezone

---

## 📦 Test Data Management

| Strategy         | Description                     |
| ---------------- | ------------------------------- |
| 📁 **Fixtures**  | Reusable, predictable test data |
| 🏭 **Factories** | Generate varied test instances  |
| 🎭 **Mocks**     | Simulate external dependencies  |
| 🌱 **Seeds**     | Consistent database state       |

---

## 📊 Coverage Strategy

| Target            | Minimum | Recommended |
| ----------------- | ------- | ----------- |
| 🟢 Unit tests     | 70%     | 85%         |
| 🟠 Integration    | 50%     | 70%         |
| 🔴 Critical paths | 100%    | 100%        |

---

## 📝 Naming Convention

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should [expected behavior] when [condition]", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## ✅ Test Checklist

Before submitting:

- [ ] Unit tests for new functions
- [ ] Edge cases covered
- [ ] Test names are descriptive
- [ ] No flaky tests
- [ ] Coverage meets targets
