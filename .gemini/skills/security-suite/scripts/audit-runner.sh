#!/bin/bash

TARGET_DIR=${1:-.}
SEVERITY_FAIL_LEVEL="high"

echo "Running Security Audit in: $TARGET_DIR"

# Go Security Check
if [ -f "$TARGET_DIR/go.mod" ]; then
    echo "Detected Go project. Running gosec..."
    if command -v gosec >/dev/null 2>&1; then
        # -no-fail runs checks but doesn't exit 1 immediately, we check output or use specific flags
        # actually standard gosec -severity high returns exit code 1 if issues found
        gosec -severity $SEVERITY_FAIL_LEVEL ./...
    else
        echo "Warning: gosec not found."
    fi
fi

# Python Security Check
if [ -f "$TARGET_DIR/requirements.txt" ] || [ -f "$TARGET_DIR/pyproject.toml" ]; then
    echo "Detected Python project. Running bandit..."
    if command -v bandit >/dev/null 2>&1; then
        # -ll: report only high severity
        bandit -ll -r "$TARGET_DIR"
    else
        echo "Warning: bandit not found."
    fi
fi

# Node/NPM Security Check
if [ -f "$TARGET_DIR/package.json" ]; then
    echo "Detected Node project. Running npm audit..."
    if command -v npm >/dev/null 2>&1; then
        # npm audit --audit-level=high exits with error if high/critical found
        npm audit --audit-level=$SEVERITY_FAIL_LEVEL
    else
        echo "Warning: npm not found."
    fi
fi