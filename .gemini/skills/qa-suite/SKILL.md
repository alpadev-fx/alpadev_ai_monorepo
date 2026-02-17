---
name: qa-suite
description: Unified testing runner for Go, React, and Python services.
---

# QA Suite Instructions

## Test Commands

### Backend
```bash
go test -v ./...
```

### Frontend
```bash
npm run test:ui
```

### AI
```bash
pytest tests/
```

## Failure Protocol
If a test fails, you must:
1. Capture the stack trace.
2. Analyze the root cause.
3. Propose a fix immediately.
