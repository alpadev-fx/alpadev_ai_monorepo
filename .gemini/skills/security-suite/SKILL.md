---
name: security-audit
description: Runs security scans using gosec, bandit, and npm audit.
---
# Security Audit Skill

This skill provides capabilities to scan the codebase for vulnerabilities.

## Usage
Run security checks on specific parts of the stack.

## Tools
- **Go**: `gosec ./...`
- **Python**: `bandit -r ai/`
- **Node**: `npm audit` (in front/)
