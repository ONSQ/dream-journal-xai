#!/bin/bash
# Restores the GitHub deploy key from the GITHUB_DEPLOY_KEY secret
# Run this at the start of any session that needs to push to GitHub
set -e

if [ -z "$GITHUB_DEPLOY_KEY" ]; then
  echo "GITHUB_DEPLOY_KEY secret is not set. Skipping SSH key setup."
  exit 0
fi

mkdir -p ~/.ssh
printf '%s' "$GITHUB_DEPLOY_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

if ! grep -q "IdentityFile /tmp/deploy_key" ~/.ssh/config 2>/dev/null; then
  cat >> ~/.ssh/config <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile /tmp/deploy_key
  StrictHostKeyChecking no
EOF
fi

echo "SSH deploy key restored successfully."
