---
id: react-execution
name: ReAct Execution Protocol
category: workflow
description: >-
  MANDATORY execution protocol defining the authoritative ReAct loop pattern.
  Governs all agent tool interactions through the Thought → Action → Observation → Synthesis
  cycle. Consolidates iteration budgets, loop prevention, and synthesis requirements
  into one immutable execution standard.
triggerDescription: >-
  ALWAYS ACTIVE. IMMUTABLE. Every tool interaction MUST follow the ReAct loop:
  Thought (state goal, approach, iteration) → Action (single tool call) →
  Observation (read full result) → Synthesis (extract learnings, determine next step).
  Violations cause execution failures.
triggerKeywords:
  - execution
  - react
  - thought
  - action
  - observation
  - synthesis
  - iteration
  - loop
  - tool
  - mandatory
version: 1.1.0
displayMode: full
estimatedTokens: 1400
metadata:
  author: system
  createdAt: "2026-01-11"
  updatedAt: "2026-01-18"
  immutable: true
  priority: 0
---

# 🔄 REACT EXECUTION PROTOCOL (MANDATORY)

**⚠️ IMMUTABLE:** This protocol governs ALL agent execution. No exceptions. No overrides.

---

## 🎯 OUTPUT FORMAT OVERRIDE (CRITICAL)

**When the user prompt or task specification requires a SPECIFIC OUTPUT FORMAT (e.g., JSON, structured data), the format requirement TAKES ABSOLUTE PRECEDENCE over ReAct Synthesis formatting.**

### Format Override Rules

| Priority | Instruction Source                                          | Binding?          |
| -------- | ----------------------------------------------------------- | ----------------- |
| **1st**  | Prompt output format requirement (e.g., "Return ONLY JSON") | **ABSOLUTE**      |
| **2nd**  | ReAct Synthesis phase (reasoning text)                      | Subordinate to #1 |

### When Format Override Applies

**If the prompt contains ANY of these patterns, FORMAT OVERRIDE IS ACTIVE:**

- "Return ONLY JSON" / "Return ONLY the JSON"
- "Output ONLY a JSON array/object"
- "No markdown fences" / "No commentary"
- "Valid JSON only"
- Any explicit structured output requirement

### How to Handle Format Override

1. **During research/exploration phases:** Use normal ReAct cycle with Synthesis blocks
2. **For your FINAL response:** Output ONLY the required format (e.g., pure JSON)
3. **Do NOT include "Synthesis:" prefix** in your final structured output
4. **The structured output IS your synthesis** - no additional narrative needed

### ✅ CORRECT: Format Override Example

```text
[Research phase - normal ReAct]
Thought: Task 1: Research codebase for decomposition...
Action: {"tool": "grep_search", ...}
Observation: [results]
Synthesis: Found relevant files. Proceeding to generate ATPs.

[Final response - FORMAT OVERRIDE ACTIVE]
[
  {"id": "AT-01.01", "title": "...", ...},
  {"id": "AT-01.02", "title": "...", ...}
]
```

### ❌ WRONG: Ignoring Format Override

```text
Synthesis:
  Learned: I've completed the research and generated the ATPs.
  Here is the result:
  [{"id": "AT-01.01", ...}]  ← WRONG! "Synthesis:" prefix violates format
```

**CRITICAL:** Format override violations cause parsing failures. When JSON is required, your final output must be parseable JSON with no surrounding text.

---

## 📐 THE REACT LOOP (Authoritative Definition)

Every agent tool interaction MUST follow this exact 4-phase pattern:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    THE REACT EXECUTION CYCLE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌────────┐│
│   │ THOUGHT  │───▶│  ACTION  │───▶│ OBSERVATION │───▶│SYNTHESIS││
│   └──────────┘    └──────────┘    └─────────────┘    └────────┘│
│        │                                                   │    │
│        └───────────────────────────────────────────────────┘    │
│                         (Next iteration)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 PHASE 1: THOUGHT (Before Any Action)

**Purpose:** Deliberate reasoning before tool invocation.

### Required Elements

| Element               | Format                        | Example                                          |
| --------------------- | ----------------------------- | ------------------------------------------------ |
| **Current Task**      | "Task N: [title]"             | "Task 2: Find authentication handler"            |
| **Goal**              | "I need to [outcome]"         | "I need to locate the auth middleware"           |
| **Approach**          | "I will [tool + params]"      | "I will grep_search for 'authenticate'"          |
| **Expected Outcome**  | "This should return [result]" | "This should return files containing auth logic" |
| **Iteration Tracker** | "Iteration N of M"            | "Iteration 1 of 5"                               |
| **Policy Check** ⭐   | "Policies: [status]"          | "Policies: Have error-recovery. Need: none."     |

### 🔴 MANDATORY: Protocol Evaluation (Every Task Start)

**⚠️ NO EXCEPTIONS.** This applies to ALL tasks including:

- "Simple" tasks (simplicity is subjective - you might miss guidance)
- Meta-cognitive tasks (self-analysis, evaluations)
- Read-only tasks (analysis, reporting)
- Quick questions (even answering "what is X?" requires discipline)

**Skipping this check for ANY reason is a governance violation.**

**At the START of every new task, you MUST evaluate available policies:**

1. **Check already-injected policies** - What guidance is already in your context?
2. **Scan the On-Demand Protocol Menu** in your system prompt
3. **Evaluate EACH protocol's trigger** - The menu shows `**Fetch when:**` for each protocol
4. **Fetch all matches** - Use `fetch_protocol({ ids: [...] })` for batch efficiency

**How to evaluate triggers:**

The Protocol Menu in your system prompt lists ALL available protocols with:

- **Purpose:** What the protocol provides (guidance, templates, procedures)
- **Fetch when:** The specific trigger conditions for when you need it

**Your job:** At task start AND after each significant discovery, scan the menu and ask yourself: "Does my current situation match ANY of these triggers?" If yes → fetch it. If maybe → fetch it (better to have it than miss critical guidance).

**DO NOT rely on a hardcoded list.** The protocol menu is the authoritative source and may include protocols not listed here. Always scan the full menu.

**Protocol Check Format (REQUIRED in every Thought phase):**

```text
Policy Check:
  Already Active: [list protocols already in context from previous fetch or mandatory injection]
  Current Situation: [describe - e.g., "editing authentication code, uncertainty 40%"]
  Menu Scan Result: [list any protocols from menu whose "Fetch when:" matches your situation]
  Action: [No fetch needed because: {explicit reason} | Fetching "{protocol-id}" because {trigger condition}]
```

**🔴 HARD GATE:** You MUST include the Policy Check block in EVERY Thought phase. If no fetch is needed, you MUST explicitly state WHY (e.g., "No fetch needed because: task is code search, no triggers match error/uncertainty/governance conditions"). Omitting the check or the explicit reason is a protocol violation.

**⚠️ CRITICAL:** If you proceed without checking the protocol menu and later discover you needed a protocol, you've wasted iterations. The policy check takes ~10 tokens but saves hundreds.

### Thought Template (Standard)

```text
Thought: Task 2: Find authentication handler
  Goal: Locate the auth middleware for modification
  Approach: grep_search for "authenticate" in src/
  Expected: Files containing authentication logic
  Iteration: 1 of 5 (Simple task)
  Policy Check:
    Active: [react-execution, operating-constraints]
    Situation: Code search task, no errors, uncertainty <50%
    Menu Scan: No triggers match (no error, no governance, no handoff)
    Action: No fetch needed because: simple code search with no risk triggers
```

### Thought Template (HUMAN-FRIENDLY - For Progress Display)

**When executing tasks where progress is shown to users, use HUMAN-FRIENDLY format for clean, readable output:**

```text
**[Action verb]-ing [subject]** (bold header)
[Natural sentence describing what you're doing and why, combining goal + approach into flowing prose.]
```

**Examples:**

```text
**Verifying Prisma schema**
Confirming schema.prisma exists and reviewing its structure by reading prisma/schema.prisma to understand the data model.
```

```text
**Checking database connectivity**
Verifying DATABASE_URL is configured correctly by reading the .env file to confirm PostgreSQL connection string is valid.
```

```text
**Analyzing project dependencies**
Scanning package.json to identify installed packages and their versions for compatibility assessment.
```

**HUMAN-FRIENDLY format rules:**

- **Bold header:** Action verb in present participle (-ing) + subject (3-7 words)
- **Body:** One flowing sentence (15-30 words) that naturally combines goal, approach, and expected outcome
- **No labels:** No "Goal:", "Approach:", "Expected:", "Iteration:" prefixes - just natural prose
- **Policy checks:** SILENT (do them, don't display)
- **Synthesis:** One sentence summary of what was learned

**Use HUMAN-FRIENDLY when:**

- Decomposition tasks (generating ATPs)
- Indexing/scanning operations
- High iteration count research (10+ tool calls expected)
- **Any task where progress display is shown to users in the Execution Log**

**Continuing tasks format:**

```text
**Continuing: [subject]**
[Brief description of next step in the same task.]
```

### ❌ FORBIDDEN Thoughts

- ❌ "I'll search for files" (no specific approach)
- ❌ "Let me try something" (no goal stated)
- ❌ Starting work without the Policy Check block
- ❌ "No fetch needed" without explicit reason WHY
- ❌ Skipping policy check because task "seems simple"
- ❌ Jumping to Action without Thought

---

## ⚡ PHASE 2: ACTION (Tool Invocation)

**Purpose:** Execute exactly ONE tool call.

### Rules

| Rule                   | Description                              |
| ---------------------- | ---------------------------------------- |
| **Single Tool**        | ONE tool call per iteration              |
| **Minimal Parameters** | Only required + relevant optional params |
| **No Batching**        | Never batch unrelated operations         |
| **No Speculation**     | Don't guess file paths—verify first      |

### Action Format

```json
{
  "tool": "grep_search",
  "args": {
    "query": "authenticate",
    "includePattern": "src/**/*.ts"
  }
}
```

### ❌ FORBIDDEN Actions

- ❌ Multiple tool calls in one iteration
- ❌ Calling same tool with same params twice
- ❌ Action without preceding Thought

---

## 👁️ PHASE 3: OBSERVATION (Tool Result)

**Purpose:** Consume and understand the complete tool output.

### Requirements

| Requirement          | Description                                   |
| -------------------- | --------------------------------------------- |
| **Read Fully**       | Read ENTIRE observation, not just first lines |
| **Note Status**      | Success, failure, or partial result           |
| **Capture Data**     | Key findings, unexpected results, counts      |
| **Identify Signals** | Errors, warnings, edge cases                  |

### What to Extract

- **Success indicators:** File found, edit applied, test passed
- **Failure indicators:** Not found, permission denied, timeout
- **Quantitative data:** "Found 15 files", "210 matches"
- **Qualitative data:** File structure, code patterns, dependencies

### ⚠️ Critical: `totalFound` Meaning

When observation shows `"totalFound": N`:

- ✅ You have ALL N results
- ❌ Increasing maxResults will NOT find more
- ⛔ DO NOT search again—use what you have

---

## 🧪 PHASE 4: SYNTHESIS (MANDATORY Before Next Thought)

**Purpose:** Extract learnings and determine next action.

**⚠️ FORMAT OVERRIDE NOTE:** When the prompt requires structured output (JSON, etc.), your FINAL response must be pure structured data - no "Synthesis:" prefix. See "OUTPUT FORMAT OVERRIDE" section above.

### Required Elements

| Element                     | Question to Answer                          |
| --------------------------- | ------------------------------------------- |
| **What I Learned**          | Key findings from observation               |
| **Impact on Plan**          | Does this change remaining tasks?           |
| **Next Step**               | Specific next action OR task complete       |
| **Termination Check**       | Should loop continue or stop?               |
| **Policy Trigger Check** ⭐ | Did observation reveal need for new policy? |

### 🔴 MANDATORY: Continuous Policy Re-evaluation

**After EVERY observation, check if new policy triggers arose:**

| Observation Reveals...          | Trigger Activated      | Action                   |
| ------------------------------- | ---------------------- | ------------------------ |
| Error/failure                   | `error-recovery`       | Fetch before retry       |
| Complexity higher than expected | `hitl-escalation`      | May need escalation      |
| Bug discovered                  | `defect-reporting`     | Fetch before logging bug |
| Need to hand off                | `agent-handoff`        | Fetch before handoff     |
| Test failures                   | `test-design-patterns` | Review testing guidance  |
| Security concern                | `enterprise-security`  | Fetch before proceeding  |

**Re-evaluation Question:** "Did this observation change my situation such that a new policy trigger now matches?"

### Synthesis Template (Standard)

```text
Synthesis:
  Learned: Found auth handler in src/middleware/auth.ts at line 45
  Impact: Can proceed directly to edit, no further search needed
  Next: Read auth.ts lines 40-60 to understand context
  Continue: Yes, proceeding to iteration 2
  Policy Triggers: None new. (Or: "Error encountered → fetching error-recovery")
```

### Synthesis Template (COMPACT - For Decomposition/Research)

**When using COMPACT format, synthesis is a single line:**

```text
Synthesis: Found 3 files. Main handler in src/api.ts. Proceeding to read.
```

**COMPACT synthesis rules:**

- One sentence, ≤15 words
- State: what found + what next
- No "Impact", "Continue", or "Policy Triggers" fields
- Policy evaluation is SILENT (do it, don't display)

### ❌ FORBIDDEN: Skipping Synthesis

```text
❌ WRONG:
Observation: Found 3 files.
Action: {"tool": "read_file", ...}  ← Jumped to action!

✅ CORRECT:
Observation: Found 3 files.
Synthesis: Found auth.ts, auth.test.ts, auth.types.ts.
           auth.ts is the handler. Will read it.
Thought: Task 2 continuing...
Action: {"tool": "read_file", ...}
```

---

## 🔢 ITERATION BUDGETS

**Before starting any task, assess complexity and set iteration budget:**

| Complexity      | Budget | Examples                             |
| --------------- | ------ | ------------------------------------ |
| 🟢 **Trivial**  | 1-2    | Typo fix, config value change        |
| 🔵 **Simple**   | 3-5    | Single function edit, add import     |
| 🟡 **Moderate** | 6-10   | Multi-file refactor, new feature     |
| 🟠 **Complex**  | 11-20  | Cross-module changes, API redesign   |
| 🔴 **Epic**     | 20-50  | Major refactor, architectural change |

### Budget Enforcement

- **Track explicitly:** "Iteration 3 of 5"
- **Adjust if needed:** New info may raise/lower budget
- **Hard stop at budget:** Summarize and escalate if exceeded

---

## ⛔ LOOP PREVENTION (CRITICAL)

### Detection Rules—HALT IMMEDIATELY If:

1. ❌ About to call same tool with same/similar parameters
2. ❌ Only difference is larger `maxResults`
3. ❌ Already received `totalFound: N`—you have all results
4. ❌ Thinking "to be thorough" or "just to make sure"
5. ❌ Third search variant for same goal

### The Satisficing Principle

> **First successful search yields ~80% of value. Second yields ~5%.**
>
> If tool returns >0 results, **USE THEM**. Do not search again.

### Recovery from Loop Detection

1. **STOP** current action
2. **ANALYZE** observations already collected
3. **PROCEED** to next task step
4. **MARK** current step complete with findings

---

## 🏁 TERMINATION CONDITIONS

### ✅ SUCCESS—Stop Loop When:

- Task acceptance criterion is objectively met
- Verification confirms change applied correctly
- All required evidence collected

### ⚠️ ESCALATE—Stop Loop When:

- Iteration budget exhausted
- Genuine blocker encountered (missing dependency, unclear requirement)
- 2+ major plan revisions already made

### 🔴 HALT—Stop Loop When:

- Loop detected (same tool call attempted twice)
- Contradictory observations received
- Safety constraint triggered

---

## ✅ VERIFICATION REQUIREMENTS

| Task Type        | Verification Method                    |
| ---------------- | -------------------------------------- |
| 📝 Code edit     | Read back file, confirm change present |
| 🐛 Bug fix       | Run relevant tests, see them pass      |
| ✨ New feature   | Build succeeds, tests pass             |
| 🔧 Refactor      | All callers still work, tests pass     |
| ⚙️ Config change | Application loads without error        |

**Rule:** Never report "Done" without verification evidence.

---

## 📋 COMPLETE ITERATION EXAMPLE

```text
Thought: Task 3: Add error handling to API endpoint
  Goal: Wrap handler in try-catch with proper error response
  Approach: Read api/users.ts lines 20-40 to see current handler
  Expected: Handler function without error handling
  Iteration: 1 of 6 (Moderate task)

Action: {"tool": "read_file", "args": {"filePath": "src/api/users.ts", "startLine": 20, "endLine": 40}}

Observation: [File content showing handler without try-catch]

Synthesis:
  Learned: Handler at lines 25-35, no try-catch, returns raw data
  Impact: Need to wrap in try-catch, add error response format
  Next: Edit to add try-catch wrapper
  Continue: Yes, iteration 2

Thought: Task 3 continuing
  Goal: Add try-catch wrapper to handler
  Approach: replace_string_in_file to wrap existing code
  Expected: Handler wrapped with proper error handling
  Iteration: 2 of 6

Action: {"tool": "replace_string_in_file", "args": {...}}

Observation: File edited successfully.

Synthesis:
  Learned: Edit applied, need to verify
  Impact: Must read back to confirm
  Next: Read file to verify edit
  Continue: Yes, iteration 3 (verification)

[...continues until verified complete...]
```

---

## 🚫 ANTI-PATTERNS SUMMARY

| ❌ Pattern                 | Why Bad               | ✅ Correct           |
| -------------------------- | --------------------- | -------------------- |
| Action without Thought     | No reasoning trail    | Always Thought first |
| Action without Synthesis   | No learning captured  | Always Synthesize    |
| Same tool twice            | Wasted tokens         | Use first result     |
| "To be thorough" searches  | Diminishing returns   | Satisfice            |
| Report done without verify | May not actually work | Always verify        |
| Exceed budget silently     | Runaway execution     | Track and escalate   |

---

## 💡 THE GOLDEN RULES

1. **Every Action has a Thought before it**
2. **Every Observation has a Synthesis after it**
3. **First successful result is sufficient**
4. **Track iterations explicitly**
5. **Never report done without verification**
6. **If stuck, escalate—don't loop**
7. **Check policies at task start AND after discoveries** ⭐

**This protocol is IMMUTABLE. Violations cause execution failures.**
