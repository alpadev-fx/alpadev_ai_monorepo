---
name: security-ai-platform
description: Use for security reviews or code touching authentication, authorization, billing data, AI/chat workflows, webhooks, secrets, and sensitive user information.
---

# Security AI Platform

## Scope
- Auth/session/admin logic.
- Billing, invoice, transaction, booking, and user data flows.
- AI prompts, chat history, webhook handlers, file upload/storage, and external API credentials.

## Review Priorities
1. Authz/authn bypass risk.
2. Data integrity for billing, booking, and admin actions.
3. Secret exposure, unsafe logging, and credential handling.
4. Prompt injection, data exfiltration, or unsafe tool use in AI flows.
5. Input validation, injection, SSRF, and unsafe command/file operations.
6. Webhook signature validation and replay risk.

## Required Output
List findings by severity:
- CRITICAL
- HIGH
- MEDIUM
- LOW

Each finding should include:
```text
Severity:
File:
Issue:
Impact:
Fix:
```
