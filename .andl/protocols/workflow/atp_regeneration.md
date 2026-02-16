---
id: atp-regeneration
name: ATP Regeneration Protocol
version: 1.0.0
category: workflow
description: >-
  Comprehensive protocol for @architect when regenerating a SINGLE ATP.
  Used when user clicks "Regenerate with AI" to get improved, more detailed content.
  This protocol defines how to fetch data, research, coordinate with siblings,
  and produce a single high-quality ATP.
displayMode: full
criticality: critical
isTopLevel: true
parentProtocol: planner-decomposition-patterns
triggerDescription: >-
  MANDATORY when @architect is regenerating a single ATP.
  System provides ATP ID and regeneration reason - all other data fetched via tools.
triggerKeywords:
  - regenerate
  - redecompose
  - improve atp
  - regenerate with ai
  - single atp
advertisement: >-
  🚨 CRITICAL: Load this protocol BEFORE regenerating ANY ATP.
  Use: fetch_protocol({ id: 'atp-regeneration' })
estimatedTokens: 5000
metadata:
  author: system
  createdAt: '2026-02-04'
  updatedAt: '2026-02-04'
---

# 🚨 ATP REGENERATION PROTOCOL v1.0

**This protocol is MANDATORY when @architect regenerates a single ATP.**

Regeneration means improving ONE specific ATP from an existing decomposition.
The user clicked "Regenerate with AI" to get better, more detailed content.

---

## 1. FETCH ATP DATA (MANDATORY FIRST STEP)

The system provides only ATP ID and regeneration reason. Fetch everything else:

```typescript
// STEP 1: Get the ATP being regenerated
const atp = await governance.atp_get({ atpId: '<target-atp-id>' });

if (!atp) {
  governance.message_send({
    toAgent: '@operator',
    messageType: 'Escalation',
    subject: `HITL: ATP ${atpId} not found`,
    body: 'Cannot regenerate - ATP does not exist in TCS.'
  });
  return; // HALT
}

// STEP 2: Get parent UOW for context
const uow = await governance.uow_get({ uowId: atp.uowId });

// STEP 3: Get sibling ATPs for coordination
const siblings = await governance.atp_get({ uowId: atp.uowId });

// Extract current state (user may have edited, preserve valuable additions)
const {
  id, title, status,
  metadata: {
    objective, context, problemStatement, solutionApproach,
    implementationSteps, filesToModify, dependencies,
    acceptanceCriteria, testStrategy, risk, ...rest
  }
} = atp;
```

---

## 2. UNDERSTAND REGENERATION REASON

The system provides `regenerationReason` explaining WHY the user wants regeneration:

| Common Reasons | What to Focus On |
|----------------|------------------|
| "Lost detail" | Add more specific implementation steps, acceptance criteria |
| "Unclear steps" | Rewrite implementationSteps with actionable, numbered steps |
| "Missing dependencies" | Research and add missing dep ATPs |
| "Wrong scope" | Adjust to proper granularity (see §6) |
| "Need acceptance criteria" | Add objectively verifiable criteria |
| "Requested by User" (default) | General improvement - enhance all fields |

**Always address the stated reason, then improve other areas as needed.**

---

## 3. PRESERVE THE ATP ID (CRITICAL)

**The ATP ID MUST NOT change during regeneration.**

```typescript
// ✅ CORRECT: Return same ID
{ "id": "UOW-01.02_03", ... }

// ❌ WRONG: Generate new ID
{ "id": "UOW-01.02_NEW_03", ... }
```

**Rationale:** 
- Other ATPs may depend on this ID
- TCS tracks this ID for status/history
- User expects to update existing ATP, not create new

---

## 4. WORKSPACE RESEARCH (MANDATORY)

**Before regenerating, USE YOUR TOOLS extensively:**

### 4.1 Architectural Living Document
```typescript
// Search for architecture docs
await file_search({ query: '**/ARCHITECTURE.md' });

// If found, READ and incorporate into architecturalContext field
// If NOT found, set livingDocumentReference: "NEEDS_CREATION"
```

### 4.2 Existing Functionality Discovery (AVOID DUPLICATION)
```typescript
// Search for existing implementations to REUSE
await grep_search({ query: 'similar-function-pattern' });
await indexer.search_symbols({ query: 'ComponentName' });

// IMPORTANT: Before specifying new functionality:
// - VERIFY similar doesn't already exist
// - If exists, reference in existingCodeToReuse field
```

### 4.3 External Dependencies Check
```typescript
// Read package.json to check installed deps
await read_file({ filePath: `${projectPath}/package.json` });

// NEVER introduce competing libraries
// Document existingUsage for dependencies
```

### 4.4 File Verification
```typescript
// Verify files mentioned in ATP actually exist
await file_search({ query: 'specific-file.ts' });

// Update filesToModify with correct paths from verification
```

---

## 5. SIBLING COORDINATION (CRITICAL)

**The regenerated ATP must coordinate with its siblings:**

### 5.1 No Overlaps
- Check sibling objectives - don't duplicate work
- If overlap detected, narrow scope to complement siblings

### 5.2 No Gaps
- Verify regenerated ATP fills its role in the sequence
- If gap detected, expand scope or flag for decomposition review

### 5.3 Dependency Coherence
- Respect existing dependency graph
- Don't introduce circular dependencies
- Validate dependencies still make sense after regeneration

```typescript
// Example sibling coordination check
const siblingTitles = siblings.map(s => `${s.id}: ${s.title}`).join('\n');
// Review to ensure no overlap/gap
```

---

## 6. GRANULARITY GUIDELINES

**Ensure ATP is right-sized:**

| Size | Symptoms | Action |
|------|----------|--------|
| **Too Small** | "Add import", "Create file" | Combine with related work |
| **Just Right** | Clear objective, 2-8 hour estimate | ✅ Keep as-is |
| **Too Large** | Multiple unrelated concerns | Flag for splitting |

**Rule of Thumb:** 
- Each ATP completable in 2-8 hours
- Single clear objective
- Self-contained (executable without reading other ATPs)

---

## 7. SELF-CONTAINMENT RULE

**The regenerated ATP MUST stand alone:**

### 7.1 Full Context
```json
{
  "context": "This ATP implements the user authentication endpoint as part of the UOW-01 Authentication System. It follows the existing auth patterns in src/auth/ and integrates with the JWT middleware from ATP UOW-01_02."
}
```

### 7.2 Explicit Dependencies
```json
{
  "dependencies": ["UOW-01_02", "UOW-01_01"],
  "externalDependencies": [
    { "name": "jsonwebtoken", "version": "^9.0.0", "existingUsage": "src/auth/jwt.ts" }
  ]
}
```

### 7.3 Complete Acceptance Criteria
```json
{
  "acceptanceCriteria": [
    "POST /api/auth/login returns 200 with JWT for valid credentials",
    "Returns 401 for invalid password",
    "Returns 400 for missing email/password fields",
    "JWT expires in 24 hours (configurable via AUTH_TOKEN_EXPIRY)",
    "Unit tests cover all 4 response scenarios"
  ]
}
```

---

## 8. OUTPUT FORMAT

### 8.1 Format Override (MANDATORY)
```
🚨 CRITICAL: Response MUST be raw JSON object (NOT array).
NO markdown fences, NO "Synthesis:" prefix, NO prose.
```

### 8.2 Single ATP Schema
```json
{
  "id": "PRESERVE_ORIGINAL_ID",
  "title": "Improved action-oriented title",
  "sourceUow": "UOW-XX",
  
  "project": "exact-project-name",
  "phase": "P2 - Descriptive Phase Name",
  "section": "§02 - Category",
  "owner": "@Dev",
  "priority": 2,
  
  "objective": "Single sentence describing what this accomplishes",
  "context": "2-4 sentences explaining WHERE this fits, referencing UOW goal and sibling ATPs",
  "problemStatement": "Current state vs desired state",
  "solutionApproach": "Technical approach and architectural decisions",
  
  "implementationSteps": [
    "1. Verify prerequisites (list specific items)",
    "2. Create/modify files (with specific paths)",
    "3. Implement logic (with specific requirements)",
    "4. Add tests (with specific scenarios)",
    "5. Verify build and tests pass"
  ],
  
  "filesToModify": [
    "src/path/to/file.ts",
    "tests/unit/file.test.ts"
  ],
  "existingCodeToReuse": [
    "src/utils/auth.ts - JWT helper functions",
    "src/middleware/validate.ts - request validation"
  ],
  
  "dependencies": ["UOW-XX_01", "UOW-XX_02"],
  "externalDependencies": [
    { "name": "package", "version": "^1.0.0", "existingUsage": "src/index.ts" }
  ],
  
  "acceptanceCriteria": [
    "Criterion 1 - objectively verifiable with expected value",
    "Criterion 2 - specific measurable outcome",
    "All tests pass: pnpm vitest run",
    "No new lint errors: pnpm lint"
  ],
  "executionConditions": [
    "Dependencies UOW-XX_01, UOW-XX_02 are complete",
    "Development environment configured"
  ],
  "exitConditions": [
    "All acceptance criteria met with evidence",
    "Code reviewed and merged"
  ],
  
  "testStrategy": "Unit tests for business logic, integration test for API endpoint",
  "buildCommand": "pnpm -C project build",
  "testCommand": "pnpm -C project vitest run",
  
  "risk": "medium",
  "riskMitigation": "Specific mitigation steps for identified risks",
  "rollbackPlan": "Revert commit, restore previous auth handler",
  
  "estimatedHours": 4,
  "architecturalContext": "Follows auth patterns from ARCHITECTURE.md §3.2",
  "livingDocumentReference": "ARCHITECTURE.md §3.2"
}
```

---

## 9. QUALITY CHECKLIST (Pre-Output)

Before outputting the regenerated ATP, verify:

- [ ] ATP ID preserved exactly
- [ ] Regeneration reason addressed
- [ ] Workspace research completed (architecture docs, existing code)
- [ ] No overlap with sibling ATPs
- [ ] No gaps in the sequence
- [ ] Dependencies are coherent
- [ ] Acceptance criteria are objectively verifiable
- [ ] Implementation steps are specific and actionable
- [ ] File paths verified via tools
- [ ] External deps checked against package.json
- [ ] Right-sized (2-8 hours)
- [ ] Self-contained (no "see other ATP")
- [ ] Uses `vitest run` not `vitest`

---

## 10. COMMON MISTAKES TO AVOID

### ❌ Changing ATP ID
**Wrong:** Generate new ID during regeneration
**Right:** Preserve original ID exactly

### ❌ Ignoring Current State
**Wrong:** Start from scratch
**Right:** Use current ATP as starting point, preserve user additions

### ❌ Skipping Research
**Wrong:** Generate from memory
**Right:** Use indexer and file tools to verify current codebase state

### ❌ Overlapping with Siblings
**Wrong:** Expand scope into sibling territory
**Right:** Coordinate to avoid overlap, fill gaps

### ❌ Vague Acceptance Criteria
**Wrong:** "Feature works correctly"
**Right:** "API returns 200 with { status: 'success' } for valid input"

### ❌ Missing Context
**Wrong:** `"context": "Implement feature"`
**Right:** `"context": "This ATP implements X as part of Y, following patterns from Z"`

---

## 11. RELATIONSHIP TO OTHER PROTOCOLS

| Protocol | Relationship |
|----------|--------------|
| `planner-decomposition-patterns` | Parent protocol for full decomposition |
| `atp-format` | ATP field requirements |
| `indexer-patterns` | How to use workspace research tools |
| `react-execution` | Execution loop format |

---

## Advertisement

> 🚨 **CRITICAL FOR @ARCHITECT:** Before regenerating ANY ATP:
> ```
> fetch_protocol({ id: 'atp-regeneration' })
> ```
>
> This protocol ensures high-quality regeneration that coordinates with siblings and addresses user concerns.

---

_End of ATP Regeneration Protocol v1.0_
