---
id: tool_discovery
name: Tool Discovery Protocol
version: 2.0.0
category: workflow
description: >-
  How to get training/schema for tools. Two simple tools: get_schema for a 
  specific tool, list_tools to see all available tools.
displayMode: on-demand
criticality: reference
triggerDescription: >-
  FETCH when you need parameter details or usage guidance for a tool.
triggerKeywords:
  - tools
  - schema
  - tool training
  - parameters
estimatedTokens: 400
metadata:
  author: system
  createdAt: "2026-01-12"
  updatedAt: "2026-01-12"
---

# Tool Discovery Protocol

> **Category:** Workflow  
> **Trigger:** When you need schema/training for a tool  
> **Last Updated:** 2026-01-12

## Two Simple Tools

### 1. `tooling.get_schema` - Get Training for a Specific Tool

**Use when you know the tool name but need parameter details.**

```json
{ "tool": "tooling.get_schema", "args": { "toolName": "file_search" } }
```

**Returns (if found):**

```json
{
  "found": true,
  "tool": {
    "name": "file_search",
    "description": "Find files matching a glob pattern",
    "parameters": { "query": "string", "maxResults": "number?" },
    "usage": ["Enumerate candidate files matching a glob before deeper scans."],
    "examples": [
      {
        "description": "Find service files",
        "call": { "tool": "file_search", "params": { "query": "**/*.ts" } }
      }
    ]
  }
}
```

**Returns (if NOT found):**

```json
{
  "found": false,
  "error": "Tool \"file_serch\" not found.",
  "suggestions": ["file_search", "grep_search", "search_codebase"],
  "availableTools": ["file_search", "grep_search", "read_file", "..."]
}
```

### 2. `tooling.list_tools` - List All Available Tools

**Use when you need to see what tools exist.**

```json
{ "tool": "tooling.list_tools", "args": {} }
```

**Returns:**

```json
{
  "count": 45,
  "tools": ["file_search", "grep_search", "read_file", "create_file", "..."]
}
```

---

## Usage Pattern

1. **Most common:** You already know the tool name → call `tooling.get_schema`
2. **Exploration:** Unsure what tools exist → call `tooling.list_tools` first
3. **Typo recovery:** If `get_schema` returns `found: false`, check `suggestions`

---

## Version History

| Date       | Change                                                 |
| ---------- | ------------------------------------------------------ |
| 2026-01-12 | v2.0: Simplified to two tools (get_schema, list_tools) |
| 2026-01-12 | v1.x: Complex capabilities_index (deprecated)          |
