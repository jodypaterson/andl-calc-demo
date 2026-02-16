---
id: enterprise-security
name: Enterprise Security & Governance Protocol
category: safety
description: >-
  Security protocol for handling sensitive operations. Mandatory checks for
  secrets/credentials, .env files, destructive operations (rm, sudo), PII,
  and production deployments. Prevents security incidents.
triggerDescription: >-
  FETCH when: Handling secrets/credentials/API keys, editing .env or config
  files, destructive operations (rm -rf, sudo), PII/sensitive data, production
  deployment, or any security-relevant task. Mandatory security checks.
triggerKeywords:
  - secret
  - password
  - token
  - api key
  - credential
  - .env
  - delete
  - rm -rf
  - sudo
  - permission
  - PII
  - sensitive
  - security
  - production
  - deploy
  - config file
  - package.json
  - docker
version: 1.0.0
autoSuggest: true
estimatedTokens: 500
metadata:
  author: system
  createdAt: "2025-12-03"
  updatedAt: "2025-12-03"
---

# SECURITY & DATA GOVERNANCE PROTOCOLS

**MANDATORY:** Fetch this protocol when handling sensitive data, credentials, or destructive operations.

---

## 🛡️ Data Leakage Prevention (OWASP LLM02)

1. **Secret Blindness:** You are strictly FORBIDDEN from reading, printing, or analyzing files named `.env`, `secrets.yml`, `id_rsa`, or any file containing "key", "token", or "password" in the filename.

2. **Redaction Mandate:** If a tool output accidentally contains an API key or credential, you MUST redact it in your final answer (e.g., `sk-******`).

3. **No-Log Zone:** Do not output full customer PII (Email, Phone, Address) in your reasoning blocks.

---

## 🔒 Excessive Agency Constraints (OWASP LLM06)

1. **Destructive Action Verification:** You MUST pause and ask for explicit user confirmation before:

   - Deleting any file
   - Overwriting a configuration file (e.g., `package.json`, `docker-compose.yml`, `.env`)
   - Running a command that modifies the system outside the workspace (e.g., `rm -rf`, `systemctl`, `sudo`)

2. **Least Privilege:** Do not read entire directories (`ls -R /`) unless absolutely necessary. Scope your search to the relevant module.

---

## 🧩 Idempotency & Code Integrity

1. **"Check Before Write" Rule:** Before adding a function/class, use `grep_search` to ensure it doesn't already exist. Duplicate definitions crash builds.

2. **Atomic Writes:** When refactoring, ensure you do not leave the file in a broken intermediate state. If you change a function signature, you MUST update all callers in the same session.

3. **Import Hygiene:** When adding new code that uses external modules, verify the import exists. Do not create orphan references.

---

## 🚨 Red Flags - STOP and Ask

- User asks to handle production credentials
- User asks to delete files in bulk
- User asks to modify system configuration
- User asks to commit/push sensitive data
- User asks to bypass security controls

**Response:** "This operation involves [sensitive area]. I'll need explicit confirmation before proceeding."
