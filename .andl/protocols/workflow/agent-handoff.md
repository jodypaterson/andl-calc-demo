---
id: agent-handoff
name: Agent Handoff Protocol
version: 3.1.0
category: workflow
description: >-
  Tool-driven handoff protocol for multi-agent workflows. Uses governance.message_send
  tool for all transitions with TCS persistence (messageType: 'Handoff').
  Ensures context preserved across agent boundaries with audit trail.
  Includes enhanced flow context, COMPLETE chain of custody (past + expected future),
  expected actions, transition rationale, and disagreement handling protocol.
  NO ACKNOWLEDGMENT MESSAGES - per atp_lifecycle_core Section 8.
displayMode: on-demand
criticality: medium
parentProtocol: atp_lifecycle
triggerDescription: >-
  FETCH when: @PM transitioning work to @Dev or receiving work from @Dev.
  Tool-driven handoff with TCS persistence. Required for stage transitions.
triggerKeywords:
  - handoff
  - transition
  - transfer
  - pass to
  - stage complete
estimatedTokens: 3200
metadata:
  author: system
  createdAt: '2026-01-10'
  updatedAt: '2026-02-03'
---

# 🔄 AGENT HANDOFF PROTOCOL (v3.1 - Tool-Driven with Chain of Custody)

**Automated agent handoffs using governance tools with TCS persistence.**

---

## 🚨 CRITICAL: NO ACKNOWLEDGMENT MESSAGES

**Before reading anything else, understand this absolute rule:**

| ❌ FORBIDDEN                           | ✅ REQUIRED BEHAVIOR                       |
| -------------------------------------- | ------------------------------------------ |
| "ACK: Handoff Received"                | Receive → BEGIN WORK (silently)            |
| "Acknowledged, proceeding..."          | DO THE WORK → Send handoff when DONE       |
| "Confirmation: Directive received"     | Silence = receipt confirmed                |
| Any message that doesn't transfer work | Only send messages that transfer ownership |

**ONE MESSAGE PER HANDOFF:** You may send exactly ONE message per ownership transfer. That message is your HANDOFF or DELIVERABLE, not an acknowledgment. See `atp_lifecycle_core` Section 8 for full rules.

---

## 📜 1. Overview

This protocol defines the **tool-driven workflow** for agent handoffs. All handoffs use governance tools that automatically:

- Persist handoff records to TCS database
- Create audit trail for orchestrator automation
- Preserve context across agent boundaries

**Key Principle:** Use `governance.message_send` tool with `messageType: 'Handoff'` - no manual tracker updates. **NO ACK MESSAGES.**

---

## � 1.1 Standard ATP Flow Reference (Chain of Custody Baseline)

These are the **expected** chains of custody for common ATP types. When preparing a handoff, reference the appropriate flow and document any deviations.

### Standard Code Change Flow
```
@PM (plan) → @Dev (implement) → @QA (test) → @PM (review) → Done
```

| Step | Agent | Stage | Action | Hands To |
|------|-------|-------|--------|----------|
| 1 | @PM | plan | Create ATP, define requirements, issue directive | @Dev |
| 2 | @Dev | implement | Execute directive, write code, tests | @QA |
| 3 | @QA | test | Validate implementation, run test suite | @PM |
| 4 | @PM | review | Review work, approve, close ATP | (done) |

### Documentation-Only Flow (No QA)
```
@PM (plan) → @Dev (implement) → @PM (review) → Done
```

| Step | Agent | Stage | Action | Hands To |
|------|-------|-------|--------|----------|
| 1 | @PM | plan | Create ATP, define documentation requirements | @Dev |
| 2 | @Dev | implement | Write/update documentation, configs | @PM |
| 3 | @PM | review | Review documentation, approve, close ATP | (done) |

### Bug Fix Flow
```
@PM (plan) → @BugDev (implement) → @QA (test) → @PM (review) → Done
```

| Step | Agent | Stage | Action | Hands To |
|------|-------|-------|--------|----------|
| 1 | @PM | plan | Create bug ATP, assign to bug specialist | @BugDev |
| 2 | @BugDev | implement | Fix bug, add regression test | @QA |
| 3 | @QA | test | Validate fix, verify no regression | @PM |
| 4 | @PM | review | Review fix, approve, close bug ATP | (done) |

### Failure/Revision Flow (QA Finds Issues)
```
@QA (test) → @Dev (implement) → @QA (test) → @PM (review) → Done
```

| Step | Agent | Stage | Action | Hands To |
|------|-------|-------|--------|----------|
| 1 | @QA | test | Find issues, document failures | @Dev |
| 2 | @Dev | implement | Fix issues, re-run local tests | @QA |
| 3 | @QA | test | Re-validate, confirm fixes | @PM |
| 4 | @PM | review | Review work, approve, close ATP | (done) |

**⚠️ IMPORTANT:** These are the EXPECTED flows. Agents MAY deviate if circumstances require, but MUST:
1. Explain the deviation in the handoff message
2. Document WHY the deviation is necessary
3. Ensure the receiving agent understands the non-standard flow

---

## �🚦 2. Handoff Triggers

A structured handoff is required when crossing agent boundaries.

### 📋 Stage Completion Triggers

| From    | To      | Trigger                             | Required Evidence             |
| ------- | ------- | ----------------------------------- | ----------------------------- |
| 🔧 @dev | 📋 @pm  | AT/ATP work complete                | Tests pass, governance synced |
| 📋 @pm  | 🔧 @dev | Verification passed, next directive | Approval decision, AT ID      |
| 🔧 @dev | 🧪 @qa  | Implementation ready for QA         | Build passes, unit tests pass |
| 🧪 @qa  | 📋 @pm  | QA complete                         | Test results, findings report |

### 🎯 Expertise Boundary Triggers

| Transition            | When                                                               |
| --------------------- | ------------------------------------------------------------------ |
| 🔧 **@dev → @pm**     | Governance decisions, priority changes, scope clarification        |
| 📋 **@pm → @dev**     | Implementation details, technical blockers, architecture questions |
| 🔧 **@dev → @sre**    | Infrastructure issues, deployment concerns                         |
| 📋 **@pm → @analyst** | Requirements ambiguity, user research needs                        |

### 🚨 Error/Escalation Triggers

- ⚠️ Technical blocker requiring different expertise
- 🔄 Context drift detected (agent lost workspace awareness)
- ⚖️ Policy conflict requiring adjudication
- 🔀 Shift change in multi-agent scenarios

### 👤 HITL Escalation & Resolution Flow

| Step          | From      | To               | Message Type | Action                        |
| ------------- | --------- | ---------------- | ------------ | ----------------------------- |
| 1. Escalation | Any agent | @operator        | Escalation   | Agent sends HITL with options |
| 2. Resolution | @operator | Requesting agent | Decision     | Operator sends decision back  |

**CRITICAL:** Operator MUST respond with a decision message. The requesting agent cannot proceed until they receive the resolution.

**Resolution Message Example:**

```typescript
governance.message_send({
  atpId: 'AT-XX-YY',
  fromAgent: '@operator',
  toAgent: '@pm', // or whichever agent raised HITL
  messageType: 'Decision',
  priority: 'P2-Normal',
  subject: 'HITL Resolution: AT-XX-YY - [Decision]',
  body: 'Selected Option: [A/B]\nRationale: [Why]\nNext Steps: [What to do]',
  requiresAck: false, // No ACK needed, agent begins work
});
```

---

## 📝 2. Handoff Format Template

Use this **exact template** for all agent handoffs. The goal is that anyone reading the message history can fully understand WHY things happened, WHAT was done, and WHAT is expected next.

```markdown
From: @[sending-agent]
To: @[receiving-agent]
Subject: Handoff: [AT/ATP ID] - [Brief Title]

---

## 🔄 Handoff: @[sending-agent] → @[receiving-agent]

**ATP/AT Context:** [ID and title]
**Stage:** [analyze|plan|develop|qa|finalize]
**Risk Level:** [1-5]

### 📍 Flow Context

[Explain in natural language why YOU received this ATP and what your role was in the flow.
This gives the receiving agent the full picture of how we got here.]

Example: "This ATP was assigned to me (@dev) by @PM after the planning phase completed.
My responsibility was to implement the feature according to the acceptance criteria.
The flow so far: @PM (planning) → @Dev (implementation) → now handing to @QA for validation."

### 🔗 Complete Chain of Custody (MANDATORY)

**PURPOSE:** This section provides mutual accountability. Each agent must document the COMPLETE 
chain - both what has happened AND what is expected to happen next. This ensures:
- Receiving agent knows the full history
- Each agent validates they are following the expected flow
- Deviations from expected flow are explicitly documented and explained

**Past Custody (What Happened):**
| # | Agent | Stage | Action Taken | Handed To | When |
|---|-------|-------|--------------|-----------|------|
| 1 | @PM   | plan  | Created ATP, defined requirements | @Dev | 2026-02-01 |
| 2 | @Dev  | implement | Completed implementation | @QA | 2026-02-03 |

**Current Handoff (This Message):**
| From | To | Stage | Reason |
|------|----|-------|--------|
| @Dev | @QA | test | Implementation complete, ready for validation |

**Expected Future Custody (What Should Happen Next):**
| # | Agent | Stage | Expected Action | Should Hand To |
|---|-------|-------|-----------------|----------------|
| 1 | @QA   | test  | Validate implementation, run tests | @PM |
| 2 | @PM   | review | Review work, approve and close ATP | (done) |

**⚠️ DEVIATION NOTICE (if applicable):**
[If you are NOT following the expected flow, you MUST explain why here.
Example: "Standard flow would have me hand to @QA, but this is a docs-only change
with no testable code, so I'm handing directly to @PM for review."]

**⛔ CRITICAL PROTOCOL REMINDERS:**
- NEVER send acknowledgement-only messages (ACK messages PROHIBITED)
- Each handoff = exactly 1 message transferring ATP ownership
- Receiving agent: Execute work → Send Handoff when complete
- You MAY deviate from expected flow if needed, but MUST explain deviation above

### ✅ Completed Work

- [Bulleted list of what was done]
- [Include specific files modified]
- [Include tests added/run]

### 🎯 What's Expected of You

[High-level description of what the receiving agent should accomplish. Don't micromanage -
trust them to figure out the HOW, but be clear about the WHAT and the exit criteria.]

Example: "Please validate that the implementation meets the acceptance criteria defined
in the original directive. Run the test suite and verify the feature works end-to-end.
If everything passes, hand off to @PM for final review and closure."

**Your exit criteria:** [What marks your phase as complete and ready for handoff]

### 🔄 Transition Rationale

[Explain WHY you're handing to THIS specific agent. What makes them the right next step?
This ensures continuity of thought across separate memory contexts.]

Example: "I'm handing to @QA because implementation is complete and all unit tests pass.
QA validation is required before @PM review per the standard ATP flow. @QA has the
expertise to verify the feature works correctly from a user perspective."

### ⏳ Pending Work

- [Bulleted list of what remains for the flow overall]
- [Ordered by priority if applicable]

### 🚫 Blockers (if any)

- [Any blocking issues preventing progress]
- [Include workarounds attempted]

### 📊 Evidence

- **Files Changed:** [List key files with links]
- **Tests Run:** [Command and result summary]
- **Governance Status:** [STATE-SYNC OK | Issues found]

### ⚠️ Disagreement Handling Reminder

If you disagree with something in this handoff:
- **Minor issue:** Fix it yourself and inform the next agent about the adjustment
- **Medium issue (material to ATP outcome):** Respond to me asking for clarification
- **Significant issue:** Immediately escalate to @PM for resolution
```

---

## ✅ 3. Handoff Quality Checklist

Before sending handoff, verify:

| Check                              | Requirement                                              |
| ---------------------------------- | -------------------------------------------------------- |
| ☐ **Flow Context Included**        | Explained why YOU received this and your role            |
| ☐ **Past Custody Documented**      | Listed ALL previous handoffs with dates in table format  |
| ☐ **Expected Future Custody**      | Listed expected next agents and their actions            |
| ☐ **Deviation Explained (if any)** | If not following standard flow, explained WHY            |
| ☐ **Protocol Reminders Included**  | Listed NO ACK rule and one-message-per-handoff           |
| ☐ **Expected Actions Clear**       | Receiving agent knows WHAT to do (not micromanaged HOW)  |
| ☐ **Transition Rationale**         | Explained WHY handing to this specific agent             |
| ☐ **Context Complete**             | Receiving agent can proceed without questions            |
| ☐ **Work Saved**                   | All changes committed/saved                              |
| ☐ **Tests Passing**                | Or failures documented                                   |
| ☐ **Governance Current**           | Artifacts up to date                                     |
| ☐ **Disagreement Reminder**        | Included the minor/medium/significant handling guidance  |

**Quality Goal:** Anyone reading the message history should fully understand WHY things happened, WHAT was done, and WHAT is expected next - without needing to ask questions.

**Chain of Custody Purpose:** By including BOTH past and expected future custody, each agent constantly reminds the next agent of the correct flow. This creates mutual accountability - if an agent receives a handoff with an unexpected flow, they should question it.

---

## 📥 4. Receiving Agent Responsibilities

### 4.1 🚫 NO ACKNOWLEDGMENT MESSAGES (CRITICAL)

**DO NOT send ACK messages.** Per `atp_lifecycle_core` Section 8:

| ❌ FORBIDDEN                        | ✅ CORRECT BEHAVIOR                    |
| ----------------------------------- | -------------------------------------- |
| "ACK: Handoff Received"             | Receive → BEGIN WORK (silently)        |
| "Acknowledged, proceeding with X"   | Receive → DO THE WORK → Send handoff   |
| "Confirmation: ATP-8 routed to @QA" | Just route it, no confirmation message |

**WHY:** ACK messages don't transfer ownership, waste tokens, and create infinite loops.

**ONE MESSAGE PER HANDOFF RULE:** You may send exactly ONE message per ownership transfer. That message is your HANDOFF or DELIVERABLE, not an acknowledgment.

### 4.2 Context Validation (MANDATORY)

When you receive a handoff, **read and understand the full context** before starting work:

1. **Flow Context:** Understand how the ATP got to you and your role in the flow
2. **Chain of Custody:** Review what each previous agent accomplished
3. **Expected Actions:** Confirm you understand what's expected of you
4. **Transition Rationale:** Understand why you're the right agent for this phase
5. **Exit Criteria:** Know what "done" looks like for your phase

**Do NOT blindly execute.** You should understand the context, agree with the approach, and only then proceed. If something doesn't make sense, use the disagreement handling protocol.

### 4.3 Disagreement Handling Protocol

If you disagree with something in the handoff or the approach being taken:

| Severity                   | Action                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Minor** (cosmetic, style, small improvements)         | Fix it yourself, proceed with your work, and mention the adjustment in your handoff to the next agent. No need to go back to the sender.        |
| **Medium** (material to ATP outcome, unclear requirements) | Respond to the sending agent asking for clarification or requesting adjustments. Include your reasoning and proposed alternative.               |
| **Significant** (fundamental disagreement, scope concerns, risk issues) | Immediately escalate to @PM for resolution. Do not proceed until the issue is resolved. The PM will arbitrate and provide direction. |

**Key Principle:** Use your judgment. You are trusted to make minor adjustments independently, but don't let material issues slide - raising concerns early prevents bigger problems later.

### 4.4 Context Verification Checklist

Before proceeding, receiving agent must:

| Step                     | Action                                |
| ------------------------ | ------------------------------------- |
| 📖 **Read full handoff** | Understand completed and pending work |
| 📁 **Verify workspace**  | `pwd` check, correct repo             |
| 🔍 **Validate evidence** | Spot-check tests pass, files exist    |
| ❓ **Clarify if needed** | Ask questions before starting         |

### 4.3 Incomplete Handoff Response

If handoff is incomplete:

```markdown
From: @[receiving-agent]
To: @[sending-agent]
Subject: ⚠️ Handoff Clarification Needed: [AT/ATP ID]

**Missing Information:**

- [What is unclear or missing]

**Questions:**

1. [Specific question]
2. [Specific question]

Please clarify before I proceed.
```

---

## 📊 5. Handoff Tools

### 5.1 governance.message_send (for Handoffs)

Send handoff message with full context preservation:

```typescript
await governance.message_send({
  atpId: 'AT-XX-YY',
  fromAgent: '@dev',
  toAgent: '@pm',
  messageType: 'Handoff',
  priority: 'P2-Normal',
  subject: 'Handoff: AT-XX-YY - [Title]',
  body: `## Handoff: @dev → @pm

### ✅ Completed Work
- Implemented feature X
- Added unit tests (15 new)
- Updated documentation

### ⏳ Pending Work  
- PM verification
- Production deployment

### 📊 Evidence
- Tests pass
- Build clean
- Lint OK

### ➡️ Recommended Next Action
[Clear, specific next step]`,
  requiresAck: false, // No ACK required - ownership transferred
});
```

**Returns:**

```typescript
{
  success: boolean;
  messageId: string; // MSG-YYYYMMDD-NNNN
  timestamp: string;
}
```

### 5.2 governance.message_send (For Directives)

Send structured message (Directive, Escalation, etc.):

```typescript
await governance.message_send({
  atpId: 'AT-XX-YY',
  fromAgent: '@pm',
  toAgent: '@dev',
  messageType: 'Directive',
  priority: 'P2-Normal',
  subject: 'Execute AT-XX-YY: Implement feature X',
  body: 'Full directive context...',
  requiresAck: false,  // NEVER request ACK - see atp_lifecycle_core
  deadline: '2026-01-15',
});
```

### 5.3 🚫 governance.message_ack DELETED (AD-20260203-01)

**This tool has been REMOVED from the codebase.** It no longer exists. Acknowledgment messages are PROHIBITED per `atp_lifecycle_core` Section 8.

| ❌ Anti-Pattern                       | ✅ Correct Pattern                            |
| ------------------------------------- | --------------------------------------------- |
| Receive message → ACK → Send response | Receive message → DO WORK → Handoff result    |
| Any acknowledgement message           | Just begin working immediately (silence = ACK)|
| "Confirming receipt of directive..."  | Silence = receipt confirmed, work in progress |

**Rule:** One directional message flow. Sender → Receiver → WORK → Handoff (no ACK step).

### 5.4 governance.message_delete (AD-20260203-06)

Delete a message you sent in error (e.g., wrong routing):

```typescript
await governance.message_delete({
  messageId: 'MSG-20260203-1234',
  reason: 'Sent to wrong agent, will resend to correct recipient',
});
```

**Use case:** When you realize you sent a handoff to the wrong agent (e.g., @pm instead of @qa), you can delete it and resend with correct routing.

### 5.5 TCS Records Created

| Table            | Record Created                         |
| ---------------- | -------------------------------------- |
| `Instructions`   | Handoff/message content and metadata   |
| `ContextEntries` | Preserved context (completed, pending) |
| `RunCheckpoints` | Checkpoint for rollback if needed      |

---

## 🚫 6. Anti-Patterns

| ❌ Anti-Pattern              | ✅ Correct Behavior                                       |
| ---------------------------- | --------------------------------------------------------- |
| Manual tracker updates       | Use `governance.message_send({ messageType: 'Handoff' })` |
| Incomplete context dump      | Full, structured handoff via tool                         |
| Skipping verification        | Always validate before proceeding                         |
| **Sending ACK messages**     | **Silence = receipt, just begin work immediately**        |
| **ACK → Response loop**      | **ACK is FORBIDDEN, begin work, no response**             |
| Ambiguous next action        | Clear, specific instruction in context                    |
| Handoff without testing      | Evidence of test completion in context                    |
| Chat-only handoffs           | Tools create audit trail                                  |
| Multiple back-and-forth      | Single message → Receiver works → Handoff result          |
| **HITL notification + HITL** | **HITL is self-sufficient, no pre-notification**          |
| "I'm about to escalate" msg  | **Skip notification, send HITL directly**                 |
| **HITL + Blocker to @dev**   | **HITL only - no additional blocker message**             |

---

## 💡 7. Best Practices

| Practice                           | Benefit                           |
| ---------------------------------- | --------------------------------- |
| 🔧 **Use governance.message_send** | Creates TCS audit trail           |
| 📝 **Complete context in body**    | Receiving agent won't need to ask |
| 🔗 **Include evidence array**      | Quick validation of work quality  |
| 📊 **List completed/pending**      | Clear scope understanding         |
| 🚫 **Never request ACK**           | ACK messages are PROHIBITED       |
| 🎯 **Single clear next action**    | No ambiguity about priority       |

---

## 🔗 8. Related Protocols

| Protocol                                                     | Relationship                           |
| ------------------------------------------------------------ | -------------------------------------- |
| [atp_lifecycle.md](../governance/atp_lifecycle.md)           | Parent lifecycle policy                |
| [atp_lifecycle_core.md](../governance/atp_lifecycle_core.md) | Core closure rules (PM only can close) |
| [dev-escalation.md](./dev-escalation.md)                     | Escalation handoffs                    |
