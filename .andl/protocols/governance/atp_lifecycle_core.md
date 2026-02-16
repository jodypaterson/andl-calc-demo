---
id: atp-lifecycle-core
name: ATP Lifecycle Core Rules
version: 6.0.0
category: governance
description: >-
  MANDATORY core rules for ATP lifecycle management. Essential status transitions,
  tool requirements, handoff protocols with enhanced context (flow context, chain
  of custody, expected actions, transition rationale), mandatory stage updates, 
  ownership transfer rules, disagreement handling, and ONE MESSAGE PER HANDOFF constraint.
displayMode: full
criticality: critical
isTopLevel: true
parentProtocol: sdlc-master
triggerDescription: >-
  ALWAYS ACTIVE for all agents. Core ATP governance rules.
triggerKeywords:
  - atp
  - status
  - handoff
  - closure
  - governance
estimatedTokens: 2200
metadata:
  author: system
  createdAt: "2026-01-27"
  updatedAt: "2026-02-03"
---

# 🔄 ATP LIFECYCLE CORE RULES

**Essential governance rules for all ATP operations. Full flow details: fetch on-demand protocols.**

---

## 1. MANDATORY STAGE UPDATE AT ITERATION END (CRITICAL)

**🚨 BLOCKING RULE: At the END of every iteration, you MUST evaluate and update status+stage.**

Before ending your message, ask yourself:

1. **"Who is working on this ATP NEXT?"** - This determines the target stage
2. **"What state should it be in for THEM?"** - This determines the target status

**YOU set the NEXT agent's state, not your completed state.**

```javascript
// ✅ CORRECT: @Dev finishing implementation, handing to @QA
// Sets state for QA (the NEXT agent), not for Dev (the completing agent)
governance.atp_change_status({
  atpId: "918",
  status: "InProgress", // QA will be actively working
  stage: "test", // QA works in test stage
  agent: "@dev",
});
```

**This is MANDATORY. Never end an iteration without evaluating status+stage.**

---

## 2. STATUS vs STAGE (Two Orthogonal Dimensions)

| Dimension  | Purpose        | Valid Values                                                                    |
| ---------- | -------------- | ------------------------------------------------------------------------------- |
| **STATUS** | Workflow state | `Queued`, `InProgress`, `Blocked`, `Complete`, `Rejected`, `Closed`, `Deferred` |
| **STAGE**  | SDLC position  | `backlog`, `plan`, `implement`, `review`, `test`, `hitl`, `done`                |

### Stage Definitions

| Stage       | Who Owns               | What Happens                                   |
| ----------- | ---------------------- | ---------------------------------------------- |
| `backlog`   | @PM                    | Awaiting prioritization/scheduling             |
| `plan`      | @PM                    | Directive being prepared, requirements defined |
| `implement` | @Dev                   | Code being written, implementation in progress |
| `review`    | @PM or @Dev_Supervisor | Code review, verification, acceptance check    |
| `test`      | @QA                    | Quality assurance, testing, validation         |
| `hitl`      | @Operator              | Human-in-the-loop, requires operator input     |
| `done`      | (Terminal)             | Fully closed, no further work                  |

### Status Definitions

| Status       | Meaning                           | Who Typically Sets        |
| ------------ | --------------------------------- | ------------------------- |
| `Queued`     | Waiting to be picked up           | @PM (initial state)       |
| `InProgress` | Someone is actively working       | Any agent starting work   |
| `Blocked`    | Work stopped, waiting on external | Any agent hitting blocker |
| `Complete`   | Current agent finished their work | Agent completing handoff  |
| `Rejected`   | Failed verification, needs rework | @PM after review          |
| `Closed`     | Fully done, terminal state        | @PM only                  |
| `Deferred`   | Postponed to later                | @PM only                  |

---

## 3. STANDARD ATP FLOW HANDOFF TABLE (CRITICAL)

**Use this table to determine what status+stage to set when handing off:**

| Handoff Type                | From      | To        | Set Status   | Set Stage   | Tool Call Example                                                                                       |
| --------------------------- | --------- | --------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| **Directive Issued**        | @PM       | @Dev      | `InProgress` | `implement` | `governance.atp_change_status({ atpId: "X", status: "InProgress", stage: "implement", agent: "@pm" })`  |
| **Implementation Complete** | @Dev      | @QA       | `InProgress` | `test`      | `governance.atp_change_status({ atpId: "X", status: "InProgress", stage: "test", agent: "@dev" })`      |
| **QA Passed**               | @QA       | @PM       | `InProgress` | `review`    | `governance.atp_change_status({ atpId: "X", status: "InProgress", stage: "review", agent: "@qa" })`     |
| **QA Failed**               | @QA       | @Dev      | `Rejected`   | `implement` | `governance.atp_change_status({ atpId: "X", status: "Rejected", stage: "implement", agent: "@qa" })`    |
| **Review Approved**         | @PM       | -         | `Closed`     | `done`      | `governance.atp_change_status({ atpId: "X", status: "Closed", stage: "done", agent: "@pm" })`           |
| **Review Rejected**         | @PM       | @Dev      | `Rejected`   | `implement` | `governance.atp_change_status({ atpId: "X", status: "Rejected", stage: "implement", agent: "@pm" })`    |
| **HITL Required**           | Any       | @Operator | `Blocked`    | `hitl`      | `governance.atp_change_status({ atpId: "X", status: "Blocked", stage: "hitl", agent: "@dev" })`         |
| **HITL Complete**           | @Operator | (varies)  | `InProgress` | (varies)    | Set based on next action                                                                                |
| **Blocker Hit**             | Any       | -         | `Blocked`    | (unchanged) | `governance.atp_change_status({ atpId: "X", status: "Blocked", stage: "implement", agent: "@dev" })`    |
| **Blocker Resolved**        | Any       | -         | `InProgress` | (unchanged) | `governance.atp_change_status({ atpId: "X", status: "InProgress", stage: "implement", agent: "@dev" })` |
| **Deferred**                | @PM       | -         | `Deferred`   | `backlog`   | `governance.atp_change_status({ atpId: "X", status: "Deferred", stage: "backlog", agent: "@pm" })`      |

### Simplified Flow (No QA)

**⚠️ WHEN TO USE:** Only when explicitly configured for the UOW. Default is STANDARD flow with QA.

The simplified flow (No QA) is ONLY used when:

1. UOW/ATP metadata explicitly sets `skipQa: true`, OR
2. @PM explicitly instructs @Dev to skip QA in directive, OR
3. ATP type is `documentation` or `configuration` (non-code changes)

**When in doubt, use STANDARD flow with QA handoff.**

| Handoff Type            | From | To   | Set Status   | Set Stage   |
| ----------------------- | ---- | ---- | ------------ | ----------- |
| Directive Issued        | @PM  | @Dev | `InProgress` | `implement` |
| Implementation Complete | @Dev | @PM  | `Complete`   | `implement` |
| PM Review               | @PM  | -    | `InProgress` | `review`    |
| Approved & Closed       | @PM  | -    | `Closed`     | `done`      |

### Default Flow Decision Matrix

| ATP Type        | Has Tests? | QA Required? | Flow          |
| --------------- | ---------- | ------------ | ------------- |
| `development`   | Yes        | ✅ YES       | Standard w/QA |
| `development`   | No         | ⚠️ Should    | Add tests     |
| `review`        | N/A        | ❌ NO        | Simplified    |
| `test`          | N/A        | ❌ NO        | Simplified    |
| `documentation` | N/A        | ❌ NO        | Simplified    |
| `deploy`        | Yes        | ✅ YES       | Standard w/QA |

**@Dev MANDATORY:** When completing development ATPs with code changes:

1. ALWAYS run tests (`pnpm vitest run` - NOT `pnpm vitest`)
2. ALWAYS hand off to @QA (stage: `test`) unless explicitly told otherwise
3. Include test evidence in handoff message

---

## 4. BOTH STATUS AND STAGE REQUIRED (TOOL ENFORCEMENT)

**EVERY update MUST provide BOTH fields.** The tool will reject partial updates.

```javascript
// ✅ CORRECT - BOTH fields provided:
governance.atp_change_status({
  atpId: "918",
  status: "InProgress",
  stage: "implement",
  agent: "@dev",
});

// ❌ WRONG - Will return error (missing stage):
governance.atp_change_status({
  atpId: "918",
  status: "InProgress",
  agent: "@dev",
});

// ❌ WRONG - Will return error (missing status):
governance.atp_change_status({
  atpId: "918",
  stage: "implement",
  agent: "@dev",
});
```

**On error:** Tool returns current values. Report error in your response, then retry with both fields.

---

## 5. AGENT PERMISSIONS (BLOCKING)

| Agent           | Can Set Status                      | Can Set Stage                                       | Notes                               |
| --------------- | ----------------------------------- | --------------------------------------------------- | ----------------------------------- |
| @Dev            | `InProgress`, `Blocked`, `Complete` | `implement`, `test` (handoff)                       | NEVER `Closed`, `done`              |
| @QA             | `InProgress`, `Blocked`, `Rejected` | `test`, `review` (handoff), `implement` (rejection) | NEVER `Closed`, `done`              |
| @PM             | ALL                                 | ALL                                                 | Only agent that can `Closed`+`done` |
| @Dev_Supervisor | Same as @Dev + `review`             | `implement`, `review`                               | For code review                     |
| @Operator       | `InProgress`, `Blocked`             | `hitl`, (restore previous)                          | HITL handling                       |

---

## 6. GOVERNANCE TOOLS ARE MANDATORY

| Action               | Tool                                                 |
| -------------------- | ---------------------------------------------------- |
| Status/stage update  | `governance.atp_change_status()` (preferred)         |
| Full ATP update      | `governance.atp_set()`                               |
| Send message/handoff | `governance.message_send()` (messageType: 'Handoff') |
| Create artifact      | `governance.artifact_create()`                       |

**If a tool fails:** Report error in your response, do NOT proceed manually.

---

## 7. HANDOFF CONTEXT REQUIREMENTS (MANDATORY)

**Every handoff message MUST include sufficient context for continuity across agent boundaries.**

The goal: Anyone reading the message history can fully understand WHY things happened, WHAT was done, and WHAT is expected next.

### 7.1 Required Handoff Sections

| Section                  | Purpose                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| **Flow Context**         | Explain why YOU received this ATP and your role in the flow       |
| **Chain of Custody**     | List all previous handoffs: agent + action + date                 |
| **Completed Work**       | What you accomplished (be specific with files, tests, evidence)   |
| **Expected Actions**     | What the receiving agent should do (high-level, not micromanaged) |
| **Transition Rationale** | Why you're handing to THIS specific agent                         |
| **Exit Criteria**        | What "done" looks like for the receiving agent's phase            |

### 7.2 Receiving Agent: Understand Before Executing

**Do NOT blindly execute.** When you receive a handoff:

1. Read and understand the full context
2. Review the chain of custody to see how we got here
3. Confirm you understand what's expected
4. If something doesn't make sense, use the disagreement protocol

### 7.3 Disagreement Handling

| Severity        | Action                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| **Minor**       | Fix it yourself, proceed, mention adjustment in your next handoff         |
| **Medium**      | Respond to sender asking for clarification (material to ATP outcome)      |
| **Significant** | Immediately escalate to @PM for resolution; do not proceed until resolved |

**For full handoff template and details:** `fetch_protocol({ id: 'agent-handoff' })`

---

## 8. POLICY DISCOVERY

| Situation              | Fetch Protocol                                       |
| ---------------------- | ---------------------------------------------------- |
| Error during execution | `fetch_protocol({ id: 'error-recovery' })`           |
| Agent handoff          | `fetch_protocol({ id: 'agent-handoff' })`            |
| HITL escalation        | `fetch_protocol({ id: 'hitl-escalation' })`          |
| PM verification        | `fetch_protocol({ id: 'pm-verification-protocol' })` |

---

## 9. MESSAGE ROUTING

| Scenario                | fromAgent | toAgent       |
| ----------------------- | --------- | ------------- |
| PM → Dev directive      | `'@pm'`   | `'@dev'`      |
| Dev → QA handoff        | `'@dev'`  | `'@qa'`       |
| QA → PM handoff         | `'@qa'`   | `'@pm'`       |
| Dev → PM handoff        | `'@dev'`  | `'@pm'`       |
| PM closure notification | `'@pm'`   | `'@operator'` |
| HITL escalation         | Any       | `'@operator'` |

### 🚫 8.0 NO SELF-MESSAGING (FORBIDDEN - IMMEDIATE HITL ON DETECTION)

**ERROR:** `fromAgent` must NEVER equal `toAgent`. Self-messaging is strictly prohibited.

| ❌ FORBIDDEN                         | ✅ CORRECT                         |
| ------------------------------------ | ---------------------------------- |
| `fromAgent: "@pm", toAgent: "@pm"`   | Execute the action directly        |
| `fromAgent: "@dev", toAgent: "@dev"` | Just do it, don't message yourself |

**Why:** Self-messaging indicates confusion about role boundaries. If you have a synthesis, decision, or action ready, **execute it immediately** rather than "messaging yourself" about it. Use `governance.decision()` to track internal decisions if needed.

#### 🚨 RECEIVING A SELF-MESSAGE = SYSTEM ERROR (HITL REQUIRED)

**If you receive a message where `fromAgent === toAgent` (including messages addressed TO yourself FROM yourself):**

1. **DO NOT process the message content** - it's invalid
2. **Immediately escalate to HITL** with the following:

```typescript
governance.message_send({
  atpId: "<current ATP>",
  fromAgent: "@<your-agent>",
  toAgent: "@operator",
  messageType: "Escalation",
  priority: "P1-High",
  subject: "SYSTEM ERROR: Self-Message Detected",
  body: `A self-addressed message was received, indicating a system routing problem.

**Invalid Message Details:**
- From: @<agent>
- To: @<agent> (SAME - INVALID)
- Subject: <original subject>
- Content snippet: <first 200 chars>

**Action Required:**
Operator must investigate the message routing error and redirect appropriately.
If no prior HITL context exists, operator will advise on correct next action.`,
});
```

3. **HALT and wait for operator resolution** - do not continue with any other work

**Why immediate HITL:**

- Self-messages indicate a routing bug or agent confusion
- The system cannot self-correct this state
- Operator must determine root cause and redirect
- Continuing work on invalid messages causes cascading errors

### 🚨 8.1 OWNERSHIP TRANSFER PRINCIPLE (BLOCKING - AD-20260202-01)

**FUNDAMENTAL RULE: Every message MUST transfer ATP ownership. Messages that do NOT transfer ownership are FORBIDDEN.**

#### What is Ownership Transfer?

Ownership transfer means the message assigns responsibility for the next action on the ATP to a different agent. The sender is saying: "I am done with my part, YOU now own this ATP."

#### Allowed Message Types (Transfer Ownership)

| Message Type   | From      | To               | Ownership Transfer                      |
| -------------- | --------- | ---------------- | --------------------------------------- |
| **Directive**  | @PM       | @Dev/@QA         | ✅ PM → Dev/QA (start work)             |
| **Handoff**    | @Dev/@QA  | @PM/@QA/@Dev     | ✅ Agent → Next Agent (review/continue) |
| **HITL**       | Any       | @Operator        | ✅ Agent → Operator (human decision)    |
| **Resolution** | @Operator | Requesting Agent | ✅ Operator → Agent (resume work)       |
| **Blocker**    | Any       | @PM/@Operator    | ✅ Agent → PM/Operator (needs help)     |
| **Rejection**  | @PM/@QA   | @Dev             | ✅ Reviewer → Dev (rework required)     |

#### 🚫 FORBIDDEN: ACK Messages (DO NOT Transfer Ownership)

**ACK (Acknowledgement) messages are ABSOLUTELY PROHIBITED.**

| ❌ FORBIDDEN Message                | Why Forbidden                 |
| ----------------------------------- | ----------------------------- |
| "ACK: Received your directive"      | Does NOT transfer ownership   |
| "Acknowledged: Will proceed with X" | Does NOT transfer ownership   |
| "ACK: Correction Applied"           | Does NOT transfer ownership   |
| "Confirmation: Message received"    | Does NOT transfer ownership   |
| "ACK Received - Process Verified"   | ACK of an ACK = infinite loop |

**Why ACKs are forbidden:**

1. ACKs do NOT transfer ownership - the same agent still owns the ATP
2. ACKs create message loops: Directive → ACK → "Got your ACK" → "Thanks" → ...
3. ACKs waste tokens and clutter the message history
4. ACKs confuse governance tracking (which message is the real handoff?)

#### 🚫 ALSO FORBIDDEN: Requesting ACKs

**NEVER ask for an ACK.** Using `requiresAck: true` or asking "please confirm receipt" invites a forbidden ACK response.

| ❌ FORBIDDEN Request                | Why Forbidden                                |
| ----------------------------------- | -------------------------------------------- |
| `requiresAck: true` in message_send | Invites forbidden ACK response               |
| "Please acknowledge receipt"        | Invites forbidden ACK response               |
| "Confirm you received this"         | Invites forbidden ACK response               |
| "ACK required before proceeding"    | Creates blocking dependency on forbidden msg |

**Correct approach:**

- ✅ Send message with `requiresAck: false` (or omit the field)
- ✅ Trust that silence = receipt (agents process messages they receive)
- ✅ If you need confirmation of WORK DONE, wait for the Handoff

**The correct response to receiving a message:**

- ✅ **DO THE WORK** and send a Handoff when complete
- ✅ **Silence = acknowledgement** - receiving a message implies you got it
- ❌ **NEVER** send "I got your message" or "ACK" or "Acknowledged"

#### Message Flow (Correct vs Wrong)

```
✅ CORRECT:
  @PM: Directive to @Dev (ownership: PM → Dev)
  @Dev: [works silently]
  @Dev: Handoff to @QA (ownership: Dev → QA)
  @QA: [works silently]
  @QA: Handoff to @PM (ownership: QA → PM)
  @PM: Closure (ownership: PM → done)

❌ WRONG (ACK LOOPS):
  @PM: Directive to @Dev
  @Dev: "ACK: Received directive" ← FORBIDDEN (no ownership transfer)
  @PM: "ACK: Got your ACK" ← FORBIDDEN (ACK of ACK)
  @Dev: "ACK: Confirmed" ← FORBIDDEN (infinite loop)
```

#### Detection Rule

**If you are about to send a message, ask: "Does this transfer ATP ownership to a different agent AND will they know that this transfers ownership?"**

- If YES → Send the message
- If NO → DO NOT send the message. Execute the action silently instead.

### 🚨 8.1.1 ONE MESSAGE PER HANDOFF (ABSOLUTE CONSTRAINT - AD-20260202-02)

**BLOCKING RULE: An agent can send EXACTLY ONE MESSAGE per ownership transfer. No exceptions.**

This is the most fundamental communication constraint in the system. Violations cause:

- Message queue confusion
- Duplicate work requests
- Infinite response loops
- Token waste
- Governance tracking failures

#### The Rule (Memorize This)

| ✅ ALLOWED               | ❌ FORBIDDEN                          |
| ------------------------ | ------------------------------------- |
| 1 message to 1 recipient | 2+ messages to anyone                 |
| Send Handoff, done       | Send Handoff + Send "also FYI to @pm" |
| Send Directive, done     | Send Directive + Request ACK          |
| Send HITL, done          | Send HITL + Inform @pm                |
| Silence after sending    | Any follow-up message                 |

#### What Counts as "One Message"?

One `governance.message_send()` call = One message. Period.

**You are DONE after calling `message_send()` once.** Do not:

- Call `message_send()` again
- Add "one more thing" in a second message
- Send a "summary" to another agent
- Request acknowledgement
- Inform others about the message you just sent

#### Common Violations (ALL FORBIDDEN)

| Violation Pattern                    | Why It's Wrong           |
| ------------------------------------ | ------------------------ |
| Handoff to @QA + "heads up" to @PM   | 2 messages               |
| Directive to @Dev + "please ACK"     | Requesting forbidden ACK |
| HITL to @operator + Blocker to @dev  | 2 messages               |
| Handoff + "also updating @architect" | 2 messages               |
| Rejection + "FYI this failed" to @pm | 2 messages               |
| "Sending follow-up details..."       | 2 messages               |

#### Pre-Send Validation (MANDATORY)

Before calling `governance.message_send()`, ask:

1. **"Have I already sent a message this iteration?"**
   - If YES → STOP. You cannot send another.
   - If NO → Proceed to step 2.

2. **"Does this message transfer ownership?"**
   - If YES → Send it. You're done.
   - If NO → Do NOT send. Execute silently instead.

3. **"Am I about to send a second message for any reason?"**
   - If YES → STOP. Combine into the first message or don't send.
   - If NO → Proceed.

#### If You Have Multiple Recipients

**WRONG:** Send to @QA, then send to @PM.
**RIGHT:** Send to the ONE agent who owns the ATP next. Others learn via governance tools or when their turn comes.

The handoff chain is: @PM → @Dev → @QA → @PM → done.
Each arrow is ONE message. @Dev doesn't message @PM when handing to @QA - @PM sees the status via governance.

#### Enforcement

**System behavior when this rule is violated:**

- Second message will be ignored or cause errors
- PM will reject handoffs that include multi-message patterns
- Governance tracking will flag the violation
- Work may need to be redone with correct single-message protocol

**Remember: SILENCE IS NORMAL. Other agents don't need to be "informed" - they query governance state.**

### 🚨 8.2 HITL ESCALATION IS SELF-SUFFICIENT (CRITICAL)

**HITL = ONLY MESSAGE.** When escalating to HITL, the HITL message is the ONLY message you send.

| ❌ WRONG (Dual Messages)     | ✅ CORRECT (Single Message) |
| ---------------------------- | --------------------------- |
| Message 1: HITL to @operator |                             |
| Message 2: "Blocker" to @dev | ONLY: HITL to @operator     |

| ❌ ALSO WRONG               | ✅ CORRECT              |
| --------------------------- | ----------------------- |
| HITL to @operator           |                         |
| + "I'm raising HITL" to @pm | ONLY: HITL to @operator |

**HITL Escalation Rules:**

1. ❌ DO NOT also send a "Blocker" message to @dev or other agents
2. ❌ DO NOT inform @pm about the HITL (they'll see the resolution)
3. ❌ DO NOT send any message except the HITL itself
4. ✅ ONLY send the single Escalation message to @operator

**Why this matters:**

- HITL is a direct escalation to the human operator
- Other agents learn about it when the operator resolves it
- Sending HITL + Blocker creates duplicate notifications
- Confuses which message requires action
- Causes unnecessary message volume

**One message rule applies to:** Handoffs, Directives, Blockers, HITL escalations, Closures.

### 📨 8.3 HITL RESOLUTION RESPONSE (MANDATORY FOR @operator)

**When @operator resolves a HITL escalation, they MUST send a decision message back to the requesting agent.**

| Message Flow       | From      | To               | Content                          |
| ------------------ | --------- | ---------------- | -------------------------------- |
| 1. HITL Escalation | Any agent | @operator        | Issue + options + recommendation |
| 2. HITL Resolution | @operator | Requesting agent | Decision summary + next steps    |

**❌ DO NOT trigger HCM/memory summarization after HITL resolution.**

By skipping HCM, the granular details of the HITL conversation are preserved in the transcript. The requestor can read the full conversation history if they need the detailed rationale.

**Resolution Message Requirements:**

- `fromAgent: "@operator"`
- `toAgent: "@[agent-who-raised-hitl]"`
- `messageType: "Decision"`
- `requiresAck: false` (agent begins work, no ACK needed)

**Message Content:**

- Brief summary of how the HITL was resolved
- The decision made (which option selected)
- Any further actions needed from the requestor
- Instruction to carry on (granular details preserved in transcript)

**Example:**

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@operator",
  toAgent: "@pm", // Whoever raised the HITL
  messageType: "Decision",
  priority: "P2-Normal",
  subject: "HITL Resolution: AT-XX-YY - Proceed with Option A",
  body: `**Resolution Summary:** Option A selected - proceed with schema migration.

**Decision:** Minimal dependencies, straightforward rollback.

**Next Steps:** Issue directive to @dev for implementation.

**Note:** Full HITL discussion preserved in transcript if you need details. Please continue with ATP execution.`,
});
```

---

## 10. END-OF-ITERATION CHECKLIST (MANDATORY)

Before ending ANY iteration, complete this checklist:

- [ ] **Evaluated next owner** - Who works on this ATP next?
- [ ] **Updated status+stage** - Set for the NEXT agent's work, not your completed work
- [ ] **Sent handoff message** - `governance.message_send({ messageType: 'Handoff' })` if changing owners
- [ ] **Handoff context complete** - Included flow context, chain of custody, expected actions, transition rationale
- [ ] **Reported any blockers** - Escalate to @pm if blocked

**FAILURE TO UPDATE STATUS+STAGE AT ITERATION END = GOVERNANCE VIOLATION**
| @PM | All statuses | All stages | Only agent who can set `Closed` + `done` |
| @QA | `InProgress`, `Blocked`, `Complete` | `test` only | After QA passes, hands to @PM |

---

**For detailed flows, artifacts, and level-specific requirements:**
`fetch_protocol({ id: 'atp-lifecycle' })` or `fetch_protocol({ id: 'atp-flow-[type]' })`
