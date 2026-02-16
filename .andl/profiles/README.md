# ANDL Profiles Directory

This folder is the **single source of truth** for AI agent profiles.

## How It Works

1. **All profile consumers read from this folder** - headless, agentchat, extension UI
2. **Editing here edits the actual profile** - no separate "source" location
3. **Builtins are fallback only** - used when a profile doesn't exist here yet

## Current Profiles

| File                            | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| `execution-model.json`          | Base profile with core policies and tools |
| `copilot-workflow.json`         | Copilot-compatible workflow profile       |
| `default-current-behavior.json` | Legacy compatibility profile              |

## Adding Agent Profiles

To add a canonical agent profile (e.g., `@pm-profile`):

1. The system will automatically fall back to builtins if not present here
2. To customize: copy from builtins and edit here
3. All edits made via Extension UI are saved here

## Profile ID Convention

- `@{role}-profile` - Full agent profiles (e.g., `@dev-profile`, `@pm-profile`)
- `@{role}` - Shortcuts that map to the full profile
- `execution-model` - Base profile all agents can extend
- Custom names - Any JSON file you create

## Documentation

See `andl-ai-client/src/profiles/README.md` for complete profile system documentation including:

- Profile structure and fields
- Inheritance with `extends`
- toolkitConfig, memoryConfig, protocolsConfig
- Editing and using profiles
- Troubleshooting
