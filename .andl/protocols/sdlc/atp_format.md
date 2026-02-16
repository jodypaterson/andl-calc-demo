---
id: atp-format
name: ATP Format Policy
version: 2.0.0
category: sdlc
description: >-
  Defines the canonical JSON format for Atomic Task Packets (ATPs). Aligned with 
  hardcoded decomposition prompts and TCS database schema. Specifies CONTENT 
  GUIDANCE for each field while structure is enforced by code.
displayMode: on-demand
criticality: high
isTopLevel: false
triggerDescription: >-
  Use when generating ATPs. Defines what content goes in each field.
  Structure is hardcoded; this policy guides field content quality.
triggerKeywords:
  - atp
  - task packet
  - decomposition
  - directive
  - task format
estimatedTokens: 1800
metadata:
  author: system
  createdAt: "2026-01-12"
  updatedAt: "2026-01-24"
---

# 📋 ATP FORMAT POLICY

**Content guidance for ATP fields. Structure is hardcoded for database alignment.**

---

## 🎯 Purpose

This policy defines **what content goes in each ATP field**. The JSON structure
is hardcoded in decomposition prompts to ensure database alignment. This policy
provides guidance on field content quality.

---

## 📦 PHASE 1: PLANNING OUTPUT (AtpPlanItem)

**Lightweight summary for quick task identification. 6 required fields.**

```json
{
  "id": "AT-01.01",
  "title": "Short descriptive title (3-7 words)",
  "purpose": "One sentence explaining what this task accomplishes",
  "dependencies": ["AT-01.00"],
  "estimatedHours": 3,
  "risk": "low",
  "priority": 2
}
```

### Field Content Guidance

| Field            | Content Guidance                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `id`             | Format: `AT-XX.YY` where XX=section (01-99), YY=sequence (01-99). With UOW prefix: `UOW-3.18.3_AT-01.01`  |
| `title`          | Action-oriented verb phrase. 3-7 words. E.g., "Implement Protocol Filter", "Add Unit Tests for Validator" |
| `purpose`        | Single sentence. Answers "What does completion of this task achieve?" Not HOW, but WHAT outcome.          |
| `dependencies`   | **⚠️ CRITICAL FIELD - MUST BE EVALUATED AND SET FOR EVERY ATP.** See Dependencies section below.          |
| `estimatedHours` | Numeric. 2-8 typical. Based on file count and complexity, not gut feel.                                   |
| `risk`           | `"low"` = routine, well-understood. `"medium"` = some uncertainty. `"high"` = unknowns, needs PM review.  |
| `priority`       | **⚠️ REQUIRED FIELD.** Integer 1-5. See Priority Definitions below.                                       |

### ⚠️ Dependencies Field (MANDATORY - CRITICAL FOR EXECUTION)

**The `dependencies` field is ONE OF THE MOST IMPORTANT FIELDS in any ATP.**

Every ATP MUST have its dependencies explicitly evaluated and set. An empty array `[]` is ONLY valid if you have explicitly verified the task has NO blocking work.

**NEVER leave dependencies as an afterthought.** Dependencies drive:

- Execution ordering (what can run in parallel vs sequentially)
- Risk assessment (blocked tasks cascade delays)
- PM directive sequencing
- Agent work claiming

**Dependency Evaluation Protocol:**

1. **Review ALL previously defined ATPs** - What work must complete first?
2. **Consider data/schema dependencies** - Does this ATP need types, models, or data from another?
3. **Consider infrastructure dependencies** - Does this need a service, database, or config created first?
4. **Consider test dependencies** - Does this need stubs, mocks, or fixtures from another ATP?
5. **Consider API dependencies** - Does this need interfaces or contracts defined first?
6. **List ALL blocking ATPs** - Not just the immediate predecessor, but ALL that must complete

**Format:** Array of ATP IDs that MUST complete before this ATP can start.

```json
"dependencies": ["AT-01.00", "AT-01.02"]  // Both must be DONE before this ATP starts
"dependencies": []  // ONLY if explicitly verified as having zero blocking work
```

**Common Dependency Patterns:**

- Schema/types ATP → Implementation ATP
- Core utility ATP → Feature ATPs that use the utility
- Config ATP → All ATPs needing that configuration
- Setup/initialization ATP → All ATPs in that section

---

### 🎯 Priority Definitions (MANDATORY - MUST SET FOR EVERY ATP)

**The `priority` field determines execution urgency and MVP categorization.**

Every ATP MUST have priority explicitly evaluated and set. Priority is NOT derived from risk - it represents business/product importance.

| Priority | Label           | Meaning                                                         | Examples                                                   |
| -------- | --------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| **1**    | 🔴 Critical MVP | Absolutely essential. Without this, product doesn't work.       | Core auth, data persistence, primary user flows, security  |
| **2**    | 🟠 Core Feature | Important feature expected by users. MVP incomplete without it. | Error handling, validation, key workflows, integrations    |
| **3**    | 🟡 Standard     | Standard functionality. Good to have, can ship MVP without.     | UI polish, extended features, additional integrations      |
| **4**    | 🟢 Nice-to-Have | Enhancement/QoL improvement. Would improve UX but not blocking. | Advanced settings, performance optimizations, convenience  |
| **5**    | ⚪ Future/Defer | Future consideration. Defer to later phase/release.             | Analytics, marketplace features, enterprise-only, phase 2+ |

**Priority Assignment Protocol:**

1. **Start with the UOW goal** - What is the MVP success criteria?
2. **Ask: "Can the user accomplish the core goal without this ATP?"**
   - No → P1 (Critical MVP)
   - Partially/degraded → P2 (Core Feature)
   - Yes, but experience worse → P3 (Standard) or P4 (Nice-to-Have)
   - Not needed for MVP → P5 (Future/Defer)
3. **Consider dependencies** - Enabling ATPs (schemas, config) inherit priority from highest dependent
4. **Foundation/Setup ATPs** are typically P1 as they block everything else

**Priority vs Risk Distinction:**

- **Priority** = Business importance (WHAT matters to ship)
- **Risk** = Technical uncertainty (HOW likely to have problems)

High-risk doesn't mean high-priority. A P4 nice-to-have feature can be high-risk.
Low-risk doesn't mean low-priority. A P1 critical feature is often low-risk (well-understood).

---

## 📝 PHASE 2: DETAILING OUTPUT (AtpDetail)

**Full execution-ready specification. All fields required for @Dev execution.**

```json
{
  "id": "AT-01.01",
  "title": "Implement Protocol Filter",
  "project": "andl-ai-client",
  "phase": "P1-Core",
  "section": "§01 - Schema",
  "owner": "@Dev",
  "estimatedHours": 4,
  "risk": "medium",

  "objective": "Add protocol filtering by category to PolicyLoader.",

  "context": "Part of ATP-01 (Protocol Engine). Enables UI to show only relevant protocols. Depends on AT-01.00 (schema). Enables AT-01.02 (UI integration).",

  "acceptanceCriteria": [
    "filterByCategory() returns only protocols matching category",
    "Unit test covers all categories",
    "TypeScript compiles without errors"
  ],

  "implementationSteps": [
    "Add filterByCategory method to PolicyLoader class in src/policies/loader.ts",
    "Create unit test in tests/policies/loader.test.ts",
    "Update exports in src/policies/index.ts"
  ],

  "filesToModify": [
    { "path": "src/policies/loader.ts", "action": "MODIFY" },
    { "path": "tests/policies/loader.test.ts", "action": "CREATE" }
  ],

  "dependencies": ["AT-01.00"],

  "externalDependencies": [{ "name": "vitest", "status": "INSTALLED" }],

  "testStrategy": "Unit test filterByCategory with mock protocols. Verify each category returns correct subset.",

  "riskMitigation": "N/A for low-risk tasks. For medium/high: describe specific mitigation."
}
```

### Field Content Guidance

| Field            | Content Guidance                                                 |
| ---------------- | ---------------------------------------------------------------- |
| `id`             | Same as Phase 1. Preserved from planning.                        |
| `title`          | Same as Phase 1. Preserved from planning.                        |
| `project`        | Target package name. E.g., `andl-ai-client`, `andl-core`, `ANDL` |
| `phase`          | Current phase. E.g., `P1-Core`, `P2-Enhancement`                 |
| `section`        | Logical grouping. E.g., `§01 - Schema`, `§02 - Implementation`   |
| `owner`          | Agent handle. Usually `@Dev` for implementation tasks.           |
| `estimatedHours` | Same as Phase 1. May be refined during detailing.                |
| `risk`           | Same as Phase 1. May be upgraded if complexity discovered.       |

---

## ⚠️ CHARACTER LIMITS (MANDATORY)

**All text fields have HARD CHARACTER LIMITS to prevent token overflow errors during AI processing.**

| Field                            | Max Characters | Rationale                                         |
| -------------------------------- | -------------- | ------------------------------------------------- |
| `title`                          | 80             | Short descriptive phrase (3-7 words)              |
| `purpose` (Phase 1)              | 200            | Single sentence summary                           |
| `objective` (Phase 2)            | 200            | Single sentence - what task accomplishes          |
| `context`                        | 2000           | Comprehensive but concise execution plan          |
| `acceptanceCriteria` (each item) | 300            | Each criterion must be a testable statement       |
| `acceptanceCriteria` (max items) | 8              | More criteria suggests task should be split       |
| `implementationSteps` (each)     | 200            | Each step is a single action                      |
| `implementationSteps` (max)      | 10             | More steps suggests task is too large             |
| `testStrategy`                   | 500            | Approach description, not full test plan          |
| `riskMitigation`                 | 300            | Brief mitigation description for medium/high risk |

**WHY LIMITS MATTER:**

- Token overflow causes decomposition retries and failures
- Overly verbose ATPs waste context window in downstream agent consumption
- Limits encourage crisp, actionable specifications

**IF YOU HIT A LIMIT:**

- `context` over 2000 chars → Split into multiple ATPs or reference external docs
- `acceptanceCriteria` over 8 items → Task is too broad, decompose further
- `implementationSteps` over 10 items → Task is too complex, break it down

---

### Context Fields (CRITICAL for self-contained ATPs)

| Field       | Content Guidance                                                                        |
| ----------- | --------------------------------------------------------------------------------------- |
| `objective` | Single sentence. WHAT this task accomplishes. Specific and measurable. **≤200 chars**   |
| `context`   | **COMPREHENSIVE EXECUTION PLAN.** See Context Field Requirements below. **≤2000 chars** |

### 📚 Context Field Requirements (THE EXECUTION BLUEPRINT)

**The `context` field is the PRIMARY documentation field for ATP execution.**
**HARD LIMIT: 2000 characters. Be comprehensive but concise.**

This is NOT just a "description" - it is the **comprehensive execution plan** that provides an AI agent or developer with EVERYTHING they need to execute the ATP to a high quality standard. Use this field wisely - include only what's essential for execution.

**The context field MUST include (as applicable):**

1. **WHY this matters** - Business/technical rationale for this work
2. **The intended work** - Detailed explanation of what needs to be done
3. **Relevant prior learnings** - If LTM contains relevant learnings, include them
4. **Code to reference/reuse** - Specific functions, classes, utilities, patterns to leverage
5. **Code commentary requirements** - Any specific documentation standards
6. **Coding patterns to follow** - Design patterns, architectural conventions
7. **Rules and constraints** - Any boundaries, prohibited approaches, required approvals
8. **Routing instructions** - If specific agent personas or expertise required
9. **Code snippets** - Example code, templates, or scaffolding if helpful
10. **File locations** - Specific files to read, research, or reference
11. **Research guidance** - If online research needed, what to search for
12. **Integration points** - How this connects to other components
13. **Edge cases** - Known edge cases or special handling required
14. **Performance considerations** - Any performance constraints or targets
15. **Security considerations** - Security requirements or concerns

**EXAMPLE - Detailed Context Field:**

```
"context": "This ATP implements the caching layer for the PolicyLoader, addressing the
performance issue identified in UOW-3.18 where repeated protocol loads cause 200ms+ latency.

WHY: Protocol loading happens on every decomposition (10-50 times per session). Without
caching, each load hits disk. Phase 1 research showed 85% of loads request the same 5 protocols.

IMPLEMENTATION APPROACH: Use the existing LRU cache pattern from andl-core/src/utils/cache.ts
(see CacheManager class). Integrate at PolicyLoader.load() entry point. Cache key should be
protocol ID + version hash.

CODE TO REFERENCE:
- andl-core/src/utils/cache.ts: CacheManager, LRUCache - reuse these, do not reimplement
- andl-ai-client/src/policies/loader.ts: PolicyLoader.load() - wrap this with cache check

PATTERNS TO FOLLOW:
- Use dependency injection for cache instance (see existing DI pattern in loader.ts)
- Follow existing error handling pattern: log + emit telemetry + graceful degradation
- Cache misses should be transparent to callers

TESTING REQUIREMENTS:
- Unit test cache hit/miss scenarios
- Test cache invalidation on protocol update
- Test memory limits (cache should not grow unbounded)

LEARNINGS FROM LTM:
- Previous caching attempt (AT-02.15) failed because cache keys didn't include version
- Memory pressure observed when cache exceeded 50 entries - implement max size

SECURITY NOTE: Cached protocols may contain sensitive patterns - cache in memory only,
never persist to disk."
```

**Quality Standard:** If a developer reads ONLY the context field, they should be able to execute the ATP without asking clarifying questions.

### Implementation Fields

| Field                  | Content Guidance                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `acceptanceCriteria`   | Array of VERIFIABLE conditions. Each must be objectively testable. Avoid vague terms like "works correctly". |
| `implementationSteps`  | Ordered list. Reference ACTUAL file paths verified via tools. Specific enough to execute.                    |
| `filesToModify`        | Array of `{path, action}`. action: `CREATE`, `MODIFY`, or `DELETE`. Paths verified via file_search.          |
| `dependencies`         | ALL blocking ATPs (full list, not just immediate).                                                           |
| `externalDependencies` | External packages. `status`: `INSTALLED`, `TO_INSTALL`, `TO_EVALUATE`                                        |
| `testStrategy`         | HOW to verify. Describe test approach, key scenarios, coverage expectations.                                 |
| `riskMitigation`       | For medium/high risk only. Describe specific mitigation steps.                                               |

---

## 🗄️ TCS DATABASE MAPPING

**The TCS database stores ATPs with these system-managed fields:**

| TCS Field           | Source                           | Notes                                        |
| ------------------- | -------------------------------- | -------------------------------------------- |
| `id`                | Auto-generated                   | Numeric primary key                          |
| `uow_id`            | From context                     | FK to parent UOW                             |
| `title`             | From ATP `title`                 | Direct mapping                               |
| `description`       | From ATP `context` + `objective` | Combined for storage                         |
| `status`            | System-managed                   | pending → claimed → running → success/failed |
| `priority`          | Derived from `risk`              | low=0, medium=1, high=2                      |
| `estimated_minutes` | `estimatedHours * 60`            | Converted to minutes                         |
| `dependencies`      | From ATP `dependencies`          | Stored as JSON array                         |
| `created_at`        | System-generated                 | Timestamp on insert                          |
| `updated_at`        | System-managed                   | Updated on changes                           |

**Note:** String ATP IDs (AT-01.01) are for human readability during planning.
TCS uses numeric IDs for relationships. Mapping is done on insert.

---

## ✅ QUALITY CHECKLIST

Before outputting ATP, verify:

- [ ] `id` follows AT-XX.YY format
- [ ] `title` is action-oriented, 3-7 words
- [ ] `purpose`/`objective` is single sentence, specific
- [ ] `context` makes ATP self-contained (understandable in isolation)
- [ ] `acceptanceCriteria` are all VERIFIABLE (not vague)
- [ ] `implementationSteps` reference VERIFIED file paths
- [ ] `dependencies` includes ALL blocking ATPs (not just immediate)
- [ ] `estimatedHours` backed by file count evidence
- [ ] `risk` reflects actual uncertainty level

---

## 🔗 Related Policies

- **Content Quality:** `planner-decomposition-patterns` (research methodology, self-criticality)
- **Research Tools:** `indexer-patterns` (tool usage for file verification)
