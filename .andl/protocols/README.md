# ANDL Protocols

## Overview

This folder contains ANDL protocols - reusable knowledge documents that can be dynamically injected into agent prompts. Protocols provide detailed instructions, formats, and workflows without bloating the base agent profile.

## Architecture

```
.andl/protocols/   (THIS FOLDER - in extension or ANDL Home)
      │
      ├─── coding/        # Code standards, patterns, testing
      ├─── governance/    # ATP lifecycle, compliance, decisions
      ├─── safety/        # Security, error handling, incidents
      ├─── sdlc/          # Software development lifecycle
      └─── workflow/      # Execution patterns, tool discovery
```

## Protocol Distribution Flow

1. **Bundled with Extension**: Protocols ship with `andl-ai-config-extension`
2. **Seeding**: Copied to ANDL Home `.andl/protocols/` on first activation
3. **Runtime**: Protocols are loaded from workspace when agent needs them
4. **Injection**: Agents request protocols via `fetch_protocol` tool

## Directory Structure

| Directory     | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| `coding/`     | Code commentary, testing patterns, multi-file coherence |
| `governance/` | ATP lifecycle, ADR format, compliance review            |
| `safety/`     | Error recovery, enterprise security, incident response  |
| `sdlc/`       | Full SDLC master protocol, definition of done           |
| `workflow/`   | ReAct execution, plan revision, tool discovery          |

## Protocol Format

Each protocol is a Markdown file with:

```markdown
# Protocol Name

## Overview

Brief description of protocol purpose.

## When to Use

Trigger conditions for this protocol.

## Instructions

Detailed step-by-step guidance.

## Examples (optional)

Concrete examples of applying the protocol.
```

## How Agents Use Protocols

Agents have two mechanisms for accessing protocols:

### 1. Protocol Menu (Sticky Fragment)

Agents with `protocol-menu` fragment see available protocols listed and can request them:

```
To load a protocol, use: fetch_protocol({ ids: ["protocol-id"] })
```

### 2. On-Demand Fetching

Agents call `fetch_protocol` tool when they need specific guidance:

```json
{
  "tool": "fetch_protocol",
  "params": {
    "ids": ["atp-lifecycle-core", "coding-guidance"]
  }
}
```

## Protocol Categories

### Workflow Protocols

- `react_execution` - ReAct loop execution pattern
- `tool_discovery` - How to discover and use tools
- `atp_flow_standard` - Standard ATP execution flow
- `atp_flow_hotfix` - Emergency hotfix flow
- `plan_revision` - How to revise plans mid-execution

### Governance Protocols

- `atp_lifecycle` - Complete ATP state machine
- `atp_lifecycle_core` - Core ATP rules (always injected)
- `adr_format` - Architectural Decision Record format
- `compliance_review` - Compliance review framework

### Coding Protocols

- `coding_guidance` - General coding standards
- `code_commentary` - Comment and documentation standards
- `multi_file_coherence` - Cross-file edit consistency
- `test_design_patterns` - Testing patterns and practices

### Safety Protocols

- `failure_recovery` - Error recovery procedures
- `enterprise_security` - Security constraints
- `incident_response_format` - Incident report format

## Syncing with Canonical Source

Protocols in `andl-ai-config-extension/.andl/protocols/` are the canonical source for the extension. To sync to ANDL Home:

1. **Automatic**: Re-seed protocols via command palette: "ANDL: Reseed Protocols"
2. **Manual**:
   ```bash
   cp -r .andl/protocols/* ~/path/to/andl-home/.andl/protocols/
   ```

## Customization

Users can:

- Edit protocols in their `.andl/protocols/` folder
- Add new protocols in any category
- Disable protocols by removing them

Changes to workspace protocols do NOT affect the bundled builtins.
