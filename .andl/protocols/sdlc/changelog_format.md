---
id: changelog-format
name: Changelog Format Policy
version: 1.0.0
category: sdlc
description: >-
  Defines the canonical format for changelog entries across all ANDL repositories
  and ATP closure artifacts. Follows Keep a Changelog specification with
  ANDL-specific extensions.
displayMode: on-demand
criticality: medium
isTopLevel: false
parentPolicyId: sdlc-master
triggerDescription: >-
  Use when writing changelog entries during ATP closure or release documentation.
  Ensures consistent, human-readable change documentation.
triggerKeywords:
  - changelog
  - release notes
  - what changed
  - version history
  - keep a changelog
estimatedTokens: 1200
metadata:
  author: system
  createdAt: "2026-01-12"
  updatedAt: "2026-01-12"
---

# 📝 CHANGELOG FORMAT POLICY

**Keep a Changelog format with ANDL-specific extensions for consistent change documentation.**

---

## 🎯 Purpose

This policy defines the canonical format for changelog entries across all ANDL repositories and ATP closure artifacts. Consistent changelog formatting ensures:

- Users can quickly understand what changed
- Changes are categorized for easy scanning
- Entries are traceable to ATPs/UOWs
- Automated tooling can parse changelog content

---

## 📋 PART 1: CHANGELOG STANDARD

ANDL follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) specification.

### 1.1 Core Principles

1. Changelogs are for **humans**, not machines
2. There should be an entry for **every version**
3. Same types of changes should be **grouped**
4. Versions and sections should be **linkable**
5. The **latest version comes first**
6. The **release date** of each version is displayed

---

## 📋 PART 2: CHANGE CATEGORIES

Use these exact category headers in this order:

| Category       | Description                  | Examples                           |
| -------------- | ---------------------------- | ---------------------------------- |
| **Added**      | New features                 | New tool, new API                  |
| **Changed**    | Changes in existing features | Behavior change, API update        |
| **Deprecated** | Soon-to-be removed features  | Old API marked for removal         |
| **Removed**    | Removed features             | Deleted API, removed capability    |
| **Fixed**      | Bug fixes                    | Resolved issue, corrected behavior |
| **Security**   | Vulnerability fixes          | Security patch, CVE fix            |
| **Improved**   | Performance/quality (ANDL)   | Optimization, better UX            |

---

## 📋 PART 3: ENTRY FORMAT

### 3.1 Standard Entry

```markdown
### Category

- **Brief title** - Description of the change. ([AT-XX.YY](link))
```

### 3.2 Detailed Entry (for significant changes)

```markdown
### Category

- **Brief title** - Description with context about why and what it enables.
  - Sub-detail 1
  - Sub-detail 2
  - Reference: [AT-XX.YY](governance/reference/path)
```

### 3.3 Examples

```markdown
### Added

- **Protocol menu filtering** - Agents can now filter protocols by category
  and criticality. Enables more efficient protocol discovery.
  ([AT-3.18.3-01.05](governance/reference/UOW_3.18.3-ATP01.md#at-0105))

### Fixed

- **WebSocket reconnection** - Fixed race condition in reconnect handler that
  caused duplicate connections. ([AT-2.4.1-03.02])

### Changed

- **Default persist mode** - Changed default artifact persistence from "both"
  to "tcs" (database only) for cleaner file system.
```

---

## 📋 PART 4: VERSION HEADER FORMAT

### 4.1 Standard Version

```markdown
## [1.2.0] - 2026-01-12
```

### 4.2 Unreleased Section

```markdown
## [Unreleased]

### Added

- Feature in development

## [1.2.0] - 2026-01-12

...
```

---

## 📋 PART 5: FILE STRUCTURE

### 5.1 Standard CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-01-12

### Added

- ...

### Changed

- ...

## [1.1.0] - 2026-01-05

...
```

---

## ⚠️ ANTI-PATTERNS

**DON'T:**

- ❌ Mix multiple changes in one bullet
- ❌ Use vague descriptions ("various fixes")
- ❌ Omit ATP/issue references
- ❌ Use past tense inconsistently
- ❌ Include internal-only changes in user-facing changelog

**DO:**

- ✅ One change per bullet point
- ✅ Specific, actionable descriptions
- ✅ Link to ATPs/issues for traceability
- ✅ Use consistent past tense ("Added", "Fixed")
- ✅ Focus on user impact

---

## 🔗 Related Policies

- **Parent:** `sdlc-master` (SDLC Master Policy)
- **See Also:** `atp-format` (ATP structure specification)
