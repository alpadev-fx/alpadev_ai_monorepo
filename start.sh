#!/usr/bin/env sh
set -e

# Parses JSON secret files (mounted by Cloud Run Secret Manager volumes)
# into environment variables, then starts the Node.js application.
#
# Secret volumes are mounted at /secrets/{category}/secrets.json
# Each JSON file contains key-value pairs that become env vars.

parse_secret_file() {
  local file="$1"
  if [ -f "$file" ]; then
    # Use node to parse JSON and export each key-value pair
    eval "$(node -e "
      const secrets = JSON.parse(require('fs').readFileSync('$file', 'utf8'));
      for (const [key, value] of Object.entries(secrets)) {
        console.log('export ' + key + '=' + JSON.stringify(String(value)));
      }
    ")"
  fi
}

# Parse all secret categories
parse_secret_file "/secrets/auth-secrets/secrets.json"
parse_secret_file "/secrets/api-keys/secrets.json"
parse_secret_file "/secrets/storage-secrets/secrets.json"

# Start the application
exec node apps/frontend/server.js
