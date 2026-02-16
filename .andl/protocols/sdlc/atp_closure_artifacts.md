---
id: atp-closure-artifacts
name: ATP Closure Artifacts Policy
version: 2.0.0
category: sdlc
description: >-
  Defines the PM workflow for ATP closure including artifact content generation
  and tool usage. The PM must generate meaningful artifact content - tools handle
  persistence only.
displayMode: full
criticality: high
isTopLevel: false
parentPolicyId: sdlc-master
triggerDescription: >-
  Use when completing an ATP or generating closure artifacts. Required for
  proper ATP closure workflow. PM must generate content, tools persist it.
triggerKeywords:
  - closure
  - atp closure
  - closure artifacts
  - closure report
  - lessons learned
  - completion report
  - closure.complete
  - closure.verify
estimatedTokens: 4500
metadata:
  author: system
  createdAt: "2026-01-12"
  updatedAt: "2026-01-14"
---

# 📦 ATP CLOSURE ARTIFACTS POLICY

**Defines all artifacts generated during ATP closure for comprehensive work documentation.**

---

## 🎯 Purpose

This policy defines the complete set of artifacts generated during ATP closure. These artifacts create a comprehensive, referenceable record of ATP execution that:

- Enables future learning from past work
- Provides audit trail for governance
- Captures architectural decisions and impact
- Documents the narrative "story" of ATP execution
- Triggers living document updates via indexer

---

## 📋 PART 1: MANDATORY ARTIFACTS

ATP closure generates **six** mandatory artifacts:

| #   | Artifact                 | Purpose                                  |
| --- | ------------------------ | ---------------------------------------- |
| 1   | **Closure Report**       | Executive summary, verification, metrics |
| 2   | **ATP Changelog**        | Formatted changelog entries              |
| 3   | **Architectural Update** | Decisions and impact log                 |
| 4   | **Lessons Learned**      | What worked, what didn't, improvements   |
| 5   | **README Update**        | Documentation for user-facing changes    |
| 6   | **Activity Log**         | Summarized lifecycle narrative           |

**Filename Pattern:** `{ATP-ID}_{ARTIFACT}_{YYYYMMDD}.md`

**Location:** `governance/artifacts/closure/{ATP-ID}/`

---

## 📝 PART 2: ARTIFACT TEMPLATES

### 2.1 Closure Report

```markdown
# ATP Closure Report: {ATP-ID}

**Generated:** {ISO timestamp}
**Report ID:** CLOSE-{YYYYMMDD}-{NNNN}

## Executive Summary

| Field    | Value           |
| -------- | --------------- |
| ATP ID   | {id}            |
| Title    | {title}         |
| Status   | ✅ Closed       |
| Duration | {start} → {end} |
| Effort   | {hours}h        |

## Acceptance Criteria Verification

| Criterion   | Status  | Evidence   |
| ----------- | ------- | ---------- |
| {criterion} | ✅ Pass | {evidence} |

## Quality Gates

| Gate  | Result                  |
| ----- | ----------------------- |
| Build | ✅ Pass                 |
| Tests | ✅ Pass (coverage: XX%) |
| Lint  | ✅ Clean                |

## Governance Compliance

- Registry: ✅ Synced
- State: ✅ Updated
- Changelog: ✅ Entry added
```

### 2.2 ATP Changelog

See `changelog-format` policy for entry format.

```markdown
# Changelog: {ATP-ID}

## [{version}] - {YYYY-MM-DD}

### Added

- **{Feature}** - {Description}. ([{ATP-ID}])

### Changed

- **{Change}** - {Description}. ([{ATP-ID}])

### Fixed

- **{Fix}** - {Description}. ([{ATP-ID}])
```

### 2.3 Architectural Update

```markdown
# Architectural Update: {ATP-ID}

## Changes Made

### Decision: {Decision Title}

- **Context:** {Why this decision was needed}
- **Decision:** {What was decided}
- **Impact:** {Additive/Modification/Refactor}
- **Rationale:** {Why this approach}

## Files Modified

| File   | Change Type     | Description   |
| ------ | --------------- | ------------- |
| {path} | {CREATE/MODIFY} | {description} |

## Integration Points

- {What systems/components this affects}
```

### 2.4 Lessons Learned

```markdown
# Lessons Learned: {ATP-ID}

## What Worked Well

- {Positive pattern to repeat}

## What Could Be Improved

- {Challenge or friction encountered}

## Recommendations

- {Specific actionable improvement}

## Patterns to Reuse

- {Reusable pattern or approach}
```

### 2.5 README Update

```markdown
# README Update: {ATP-ID}

## Summary

{Brief description of user-facing changes}

## Documentation Changes

### New Sections

- {New section added to README}

### Updated Sections

- {Existing section that needs updating}

## Suggested README Content

{Actual text to add/update}
```

### 2.6 Activity Log

```markdown
# Activity Log: {ATP-ID}

## Timeline

| Timestamp  | Event                  | Actor | Details               |
| ---------- | ---------------------- | ----- | --------------------- |
| {ISO time} | Created                | @pm   | ATP defined           |
| {ISO time} | Directive Issued       | @pm   | Work assigned to @dev |
| {ISO time} | Implementation Started | @dev  | Work began            |
| {ISO time} | Handoff Submitted      | @dev  | Work completed        |
| {ISO time} | Verified               | @pm   | Acceptance confirmed  |
| {ISO time} | Closed                 | @pm   | Artifacts generated   |

## Lifecycle Summary

- **Total Duration:** {X}h
- **Iterations:** {N}
- **Blockers Encountered:** {N}
```

---

## ⚙️ PART 3: PM CLOSURE WORKFLOW (MANDATORY)

### 3.1 Overview

**CRITICAL:** The PM is responsible for generating artifact content. The `closure.complete` tool handles persistence only - it does NOT generate content automatically.

The PM must:

1. Verify closure readiness with `closure.verify`
2. Generate meaningful content for each artifact based on actual ATP execution
3. Call `closure.complete` with the AI-written content

### 3.2 Step 1: Verify Closure Readiness

Before closing, verify all preconditions are met:

```json
{
  "tool": "closure.verify",
  "params": {
    "atpId": "ATP-XX-YY"
  }
}
```

**Expected Result:**

```json
{
  "readyForClosure": true,
  "checks": [
    { "type": "criteria", "passed": true },
    { "type": "tests", "passed": true },
    { "type": "governance", "passed": true }
  ]
}
```

**If `readyForClosure: false`:** Address blockers before proceeding.

### 3.3 Step 2: Generate Artifact Content

The PM must write the actual content for each artifact. **Do NOT use placeholder text** - the content should reflect what actually happened during ATP execution.

**Required Content Fields:**

| Artifact             | Field                 | Content Requirements                                               |
| -------------------- | --------------------- | ------------------------------------------------------------------ |
| Closure Report       | `closureReport`       | Executive summary, verification results, quality gates, compliance |
| Changelog            | `changelog`           | Formatted entries per `changelog-format` policy                    |
| Architectural Update | `architecturalUpdate` | Decisions made, files modified, rationale                          |
| Lessons Learned      | `lessonsLearned`      | What worked, what didn't, recommendations                          |
| README Update        | `readmeUpdate`        | Documentation changes for user-facing features                     |
| Activity Log         | `activityLog`         | Timeline of ATP lifecycle events                                   |

**Content Generation Guidelines:**

1. **Be Specific:** Reference actual files, tools, decisions made during ATP
2. **Include Evidence:** Link to test results, build outputs, tool invocations
3. **Capture Context:** Why decisions were made, not just what was done
4. **Document Friction:** Blockers, workarounds, and recovery actions
5. **Extract Lessons:** Patterns to repeat or avoid in future work

### 3.4 Step 3: Call closure.complete

Once content is generated, call the closure tool:

```json
{
  "tool": "closure.complete",
  "params": {
    "atpId": "ATP-XX-YY",
    "summary": "Brief summary of what was accomplished",
    "evidence": [
      "Build passed: pnpm -C package -s build",
      "Tests passed: 15/15 tests, 92% coverage",
      "Lint clean: no warnings"
    ],
    "artifactContent": {
      "closureReport": "# ATP Closure Report: ATP-XX-YY\n\n**Generated:** 2026-01-14T10:30:00Z\n...",
      "changelog": "# Changelog: ATP-XX-YY\n\n## [1.2.0] - 2026-01-14\n\n### Added\n- **Feature X** - Description...",
      "architecturalUpdate": "# Architectural Update: ATP-XX-YY\n\n## Changes Made\n\n### Decision: Use X Pattern\n...",
      "lessonsLearned": "# Lessons Learned: ATP-XX-YY\n\n## What Worked Well\n- Early verification prevented issues...",
      "activityLog": "# Activity Log: ATP-XX-YY\n\n## Timeline\n| Timestamp | Event | Actor | Details |..."
    },
    "generateArtifacts": {
      "closureReport": true,
      "changelog": true,
      "architecturalUpdate": true,
      "lessonsLearned": true,
      "readmeUpdate": false,
      "activityLog": true
    },
    "persistMode": "file"
  }
}
```

### 3.5 Artifact Content Examples

#### Closure Report Example

```markdown
# ATP Closure Report: ATP-20260114-01

**Generated:** 2026-01-14T10:30:00Z
**Report ID:** CLOSE-20260114-4521

## Executive Summary

| Field    | Value                              |
| -------- | ---------------------------------- |
| ATP ID   | ATP-20260114-01                    |
| Title    | Add streaming observations to chat |
| Status   | ✅ Closed                          |
| Duration | 2026-01-14 08:00 → 10:30 (2.5h)    |

## Acceptance Criteria Verification

| Criterion                         | Status  | Evidence                      |
| --------------------------------- | ------- | ----------------------------- |
| Tool results appear incrementally | ✅ Pass | UI smoke test shows streaming |
| No regression in batch mode       | ✅ Pass | Existing tests pass (15/15)   |

## Quality Gates

| Gate  | Result                  |
| ----- | ----------------------- |
| Build | ✅ Pass                 |
| Tests | ✅ Pass (coverage: 87%) |
| Lint  | ✅ Clean                |

## Changes Made

- Modified `AssistantBridge.ts` to fire observations immediately
- Updated parallel tool execution to stream results
- No breaking changes to existing API

## Governance Compliance

- Registry: ✅ AT-20260114-01 marked Done
- State: ✅ state-snapshot.json updated
- Changelog: ✅ Entry added
```

#### Lessons Learned Example

```markdown
# Lessons Learned: ATP-20260114-01

## What Worked Well

- **Early verification:** Running `closure.verify` before starting saved rework
- **Incremental testing:** Testing each change immediately caught issues early
- **Clear acceptance criteria:** Knowing "streaming" meant "per-tool completion" avoided ambiguity

## What Could Be Improved

- **Stale cache issue:** Manifest cache wasn't cleared, causing tool discovery failures
- **Documentation gap:** The profile tool list was static, not dynamically generated

## Recommendations

1. Add cache invalidation to profile loading when tools change
2. Consider dynamic tool documentation generation from registry
3. Add integration test for tool discovery after plugin changes

## Patterns to Reuse

- Fire events immediately on completion, not batched at end
- Use `host.fs?.writeFile` pattern for cross-environment file operations
```

### 3.6 Common Mistakes to Avoid

| ❌ Wrong                         | ✅ Correct                                |
| -------------------------------- | ----------------------------------------- |
| Using template placeholders      | Writing actual content from ATP execution |
| Skipping `closure.verify`        | Always verify before closing              |
| Generic lessons learned          | Specific, actionable insights             |
| Missing evidence links           | Include tool outputs, test results        |
| Omitting architectural decisions | Document all design choices made          |

---

## ⚙️ PART 4: ARTIFACT PERSISTENCE

### 4.1 Persistence Trigger

Artifacts are persisted by `closure.complete` tool when:

- All acceptance criteria verified
- Quality gates passed
- `generateArtifacts` option enabled
- AI-generated `artifactContent` provided

### 4.2 Persistence Options

```json
{
  "generateArtifacts": {
    "closureReport": true,
    "changelog": true,
    "architecturalUpdate": true,
    "lessonsLearned": true,
    "readmeUpdate": false,
    "activityLog": true
  },
  "persistMode": "file"
}
```

**Persist Modes:**

- `file` - Write to `governance/artifacts/closure/{ATP-ID}/` (Git-versioned)
- `tcs` - Store in TCS database only
- `both` - Dual persistence

### 4.3 Living Document Update

After artifact persistence, `closure.complete` triggers:

1. Indexer update of living documentation
2. State sync with governance system
3. Registry update marking ATP as Done

---

## 🔗 Related Policies

- **Parent:** `sdlc-master` (SDLC Master Policy)
- **See Also:** `atp-format` (ATP structure specification)
- **See Also:** `changelog-format` (Changelog entry format)
