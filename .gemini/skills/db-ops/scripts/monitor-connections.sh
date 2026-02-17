#!/bin/bash

# Port to check
DB_PORT=${1:-5432}

echo "Monitoring connections on port $DB_PORT..."

if command -v ss >/dev/null 2>&1; then
    # Linux (usually)
    ESTABLISHED=$(ss -ant "sport = :$DB_PORT or dport = :$DB_PORT" | grep ESTAB | wc -l)
    TOTAL=$(ss -ant "sport = :$DB_PORT or dport = :$DB_PORT" | wc -l)
    # Header line correction for ss
    TOTAL=$((TOTAL - 1)) 
elif command -v netstat >/dev/null 2>&1; then
    # MacOS / General
    ESTABLISHED=$(netstat -an | grep ".$DB_PORT " | grep ESTABLISHED | wc -l)
    TOTAL=$(netstat -an | grep ".$DB_PORT " | wc -l)
else
    echo "Error: Neither 'ss' nor 'netstat' found."
    exit 1
fi

echo "Active/Established Connections: $ESTABLISHED"
echo "Total Connections (Wait/Close/etc): $TOTAL"

if [ "$ESTABLISHED" -gt 100 ]; then
    echo "WARNING: High number of established connections detected!"
fi