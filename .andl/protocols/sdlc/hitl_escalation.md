---
id: hitl-escalation
name: HITL Escalation Policy
version: 1.0.0
category: workflow
description: >-
  Human-in-the-Loop (HITL) escalation policy for high-risk decisions. Covers
  risk levels 4-5, uncertainty thresholds, destructive actions, scope changes,
  and policy conflicts. Requires structured ESCALATION block with options.
displayMode: on-demand
criticality: high
parentProtocol: sdlc-master
triggerDescription: >-
  FETCH when: Risk level 4-5 decision, uncertainty >50%, destructive action
  (delete, deploy, production), scope expansion beyond directive, missing
  requirements, or policy conflict. Format: ESCALATION block with options.
---

# 🚨 HITL ESCALATION POLICY

**Human-in-the-Loop (HITL) escalation is required for high-risk decisions or when confidence is low.**

---

## 1. Escalation Triggers

### 🎯 1.1 Risk Level Triggers

| Risk Level | Escalation Required | Rationale                                     |
| ---------- | ------------------- | --------------------------------------------- |
| **1-3**    | ❌ No               | Autonomous handling appropriate               |
| **4**      | ⚠️ PM Gate          | High-impact changes need verification         |
| **5**      | ✅ HITL Required    | Critical/security changes need human approval |

### 🤔 1.2 Uncertainty Triggers

- **Uncertainty >50%:** When confidence in the correct approach is below 50%
- **Conflicting Requirements:** Two or more requirements contradict each other
- **Missing Information:** Critical context needed to proceed is unavailable
- **Novel Situation:** Scenario not covered by existing policies or precedent

### 📢 1.3 Explicit Triggers

- **User Request:** Human explicitly asks for escalation
- **Override Request:** Human wants to deviate from policy
- **Sensitive Domain:** Security, privacy, data integrity, or compliance matters
- **Cross-cutting Impact:** Change affects multiple systems or teams

---

## 2. Escalation Format

When escalating to HITL, use this structured format:

```markdown
## 🚨 HITL Escalation Request

**Context:** [AT/ATP ID and brief description]
**Risk Level:** [4 or 5]
**Urgency:** [Critical|High|Medium]

### 📋 Situation

[2-3 sentence description of what triggered the escalation]

### 🔀 Options

**Option A: [Name]**

- Approach: [Description]
- Pros: [List benefits]
- Cons: [List drawbacks]
- Risk: [Assessment]

**Option B: [Name]**

- Approach: [Description]
- Pros: [List benefits]
- Cons: [List drawbacks]
- Risk: [Assessment]

### 📎 Evidence

- [Links to relevant files, docs, or data]
- [Test results or analysis supporting options]

### 💡 Recommendation

I recommend **Option [X]** because [clear rationale].

### ❓ Input Needed

[Specific question or decision required from human]
```

---

## 3. Option Requirements

### ✅ Option Quality Standards

- **Minimum 2 options** (unless single viable path with blocking concern)
- **Maximum 4 options** (more creates decision fatigue)
- Each option must have pros, cons, and risk assessment
- Recommendation should be clear with rationale

### 📊 Evidence Quality

Evidence must be:

- **Verifiable:** Links work, files exist
- **Relevant:** Directly supports decision
- **Current:** Reflects latest state

---

## 4. User Response Handling

### 📝 4.1 Structured Prompts

When requesting input, use clear prompts:

```markdown
**Decision Required:**

Please select one of the following:

1. Option A: [Brief description]
2. Option B: [Brief description]
3. Provide alternative direction
4. Request more information

**Timeout:** This decision will block progress.
Default action after 24h: [block|proceed with Option X]
```

### ⏰ 4.2 Timeout Behavior

| Urgency      | Timeout  | Default Action                         |
| ------------ | -------- | -------------------------------------- |
| **Critical** | 2 hours  | Block (no autonomous action)           |
| **High**     | 8 hours  | Block (no autonomous action)           |
| **Medium**   | 24 hours | Proceed with recommendation if risk ≤3 |
| **Low**      | 48 hours | Proceed with recommendation            |

### 🔇 4.3 No Response Handling

If timeout expires without response:

1. Log the timeout in governance tracking
2. For Critical/High: Create reminder and continue blocking
3. For Medium/Low with low-risk recommendation: Proceed and document
4. **Never** proceed autonomously for risk level 5

---

## 5. HITL Message Efficiency (CRITICAL)

### 🚨 5.0 HITL = ONLY MESSAGE (CRITICAL)

**When escalating to HITL, send ONLY the HITL message. No other messages.**

| ❌ WRONG (Dual Messages)     | ✅ CORRECT (Single Message) |
| ---------------------------- | --------------------------- |
| Message 1: HITL to @operator |                             |
| Message 2: "Blocker" to @dev | ONLY: HITL to @operator     |

| ❌ ALSO WRONG       | ✅ CORRECT              |
| ------------------- | ----------------------- |
| HITL to @operator   |                         |
| + "Heads up" to @pm | ONLY: HITL to @operator |

**Rules:**

1. **HITL message IS the only notification** - No "Blocker" message to @dev needed
2. **Direct to @operator** - HITL goes straight to human operator
3. **One message per escalation** - Never send additional messages
4. **No agent notifications** - @dev/@pm learn about it from the resolution
5. **No ACK expected** - Operator responds with decision, not ACK

**Rationale:** Sending HITL + a blocker/notification message creates:

- Confusion about which message requires action
- Duplicate message volume
- Unclear ownership (who handles the blocker vs HITL?)
- Potential infinite loops if agents respond to the blocker

### � 5.0.1 NO SELF-MESSAGING (FORBIDDEN)

**Agents MUST NOT send messages to themselves.**

| ❌ FORBIDDEN                                   | ✅ CORRECT                         |
| ---------------------------------------------- | ---------------------------------- |
| `fromAgent: "@pm", toAgent: "@pm"`             | Execute the action directly        |
| `fromAgent: "@dev", toAgent: "@dev"`           | Just do it, don't message yourself |
| `fromAgent: "@operator", toAgent: "@operator"` | Read and act immediately           |

**Rules:**

1. **No self-messages** - `fromAgent` must NEVER equal `toAgent`
2. **Synthesis = Action** - If you have a decision/synthesis, execute it immediately
3. **No "notes to self"** - If you need to track something, use `governance.decision()`

**Why:** Self-messaging indicates confusion about role boundaries. If @pm sends a message to @pm, it means the agent is trying to "remind itself" of something instead of just doing it. Read the context, make the decision, and execute.

### �📨 5.1 HITL RESOLUTION RESPONSE (MANDATORY)

**When @operator resolves a HITL, they MUST send a response message back to the requesting agent.**

This ensures the requesting agent:

1. Knows the HITL has been resolved
2. Receives a summary of the decision made
3. Can proceed with work based on the decision

**❌ DO NOT trigger HCM/memory summarization after HITL resolution.**

By skipping HCM, the granular details of the HITL conversation are preserved in the transcript. The requestor can read the full conversation history if they need the detailed rationale.

**Message Content:**

- Brief summary of how the HITL was resolved
- The decision made (which option selected)
- Any further actions needed from the requestor
- Instruction to carry on with the additional context

**HITL Resolution Message Format:**

```markdown
From: @operator
To: @[requesting-agent] (the agent who raised the HITL)
Subject: HITL Resolution: [ATP-ID] - [Decision]

---

## ✅ HITL Resolution

**ATP Context:** [ATP-ID]
**Original Escalation:** [Brief summary of what was escalated]

### Decision

**Selected Option:** [Option A/B/C or custom decision]
**Summary:** [Brief explanation of why and what was decided]

### Next Steps

[What the requestor should do next]

### Additional Context

The full HITL conversation is preserved in the transcript if you need the detailed discussion. Please continue with ATP execution.
```

**Tool Usage for Resolution:**

```typescript
governance.message_send({
  atpId: "AT-XX-YY",
  fromAgent: "@operator",
  toAgent: "@[requesting-agent]", // The agent who raised HITL
  messageType: "Decision",
  priority: "P2-Normal",
  subject: "HITL Resolution: AT-XX-YY - [Selected Option]",
  body: "[Full resolution message]",
  requiresAck: false, // Agent begins work, no ACK needed
});
```

**CRITICAL:** The receiving agent begins work immediately upon receiving the resolution. NO acknowledgment message is required back to @operator.

---

## 6. Escalation Tracking

### 📊 6.1 Logging Requirements

All escalations must be logged with:

- Timestamp and context
- Options presented
- User decision (or timeout)
- Outcome of selected action

### 🔍 6.2 Audit Trail

Escalation logs enable:

- Pattern analysis (what triggers escalations)
- Policy refinement (should some escalations be autonomous?)
- Accountability (who decided what and when)

---

## 7. Common Resolutions to Common Problems (HITL Avoidance)

**Before escalating to HITL, check if the situation matches a known pattern with a standard resolution.**

These patterns do NOT require HITL - follow the documented resolution instead.

### 🔄 7.1 Scope Expansion Required

**Situation:** During implementation, agent discovers additional work is needed beyond the original ATP scope.

**❌ DO NOT escalate to HITL.** This is a routine scope adjustment, not a human decision.

**✅ Standard Resolution:**

1. **Update the ATP** with the additional scope:

   ```typescript
   governance.atp_set({
     atpId: "AT-XX-YY",
     notes:
       "SCOPE EXPANSION: [Description of additional work needed]. Original scope: [X]. Added: [Y].",
     agent: "@[your-agent]",
   });
   ```

2. **Route based on your role:**

   **If you are @pm:**
   - Re-issue the revised directive directly with the expanded scope
   - Include clear marking: `**REVISED DIRECTIVE - SCOPE EXPANDED**`
   - Document what was added vs original

   **If you are @dev or another agent:**
   - Send scope expansion notice to @pm:

   ```typescript
   governance.message_send({
     atpId: "AT-XX-YY",
     fromAgent: "@dev",
     toAgent: "@pm",
     messageType: "ScopeExpansion",
     priority: "P2-Normal",
     subject: "Scope Expansion Required: AT-XX-YY",
     body: "During implementation, discovered additional scope needed:\n\n**Original Scope:** [X]\n**Additional Scope:** [Y]\n**Reason:** [Why this is needed]\n\nRequest: Please re-issue revised directive with expanded scope.",
   });
   ```

   - PM will review and re-issue the complete directive with expanded scope

**Rationale:** Scope discovery during implementation is normal. It doesn't require human judgment - just proper documentation and re-issuance of an updated directive.

---

## ✅ Escalation Checklist

Before escalating, verify:

- [ ] Risk level accurately assessed
- [ ] At least 2 viable options presented
- [ ] Each option has pros, cons, and risk
- [ ] Evidence is attached and verifiable
- [ ] Clear recommendation with rationale
- [ ] Specific input needed is stated
