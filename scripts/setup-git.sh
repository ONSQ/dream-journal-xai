#!/bin/bash
# Restores the GitHub deploy key from the GITHUB_DEPLOY_KEY secret (base64-encoded)
# Run this at the start of any session that needs to push to GitHub
set -e

if [ -z "$GITHUB_DEPLOY_KEY" ]; then
  echo "GITHUB_DEPLOY_KEY secret is not set. Skipping SSH key setup."
  exit 0
fi

mkdir -p ~/.ssh

# Decode the base64-encoded private key
echo "$GITHUB_DEPLOY_KEY" | base64 -d > /tmp/deploy_key
chmod 600 /tmp/deploy_key

# Rebuild SSH config from scratch for github.com to avoid stale entries
TMPCONF=$(mktemp)
grep -v -A 5 "^Host github.com" ~/.ssh/config 2>/dev/null | grep -v "HostName github.com" | grep -v "User git" | grep -v "IdentityFile /tmp/deploy_key" | grep -v "StrictHostKeyChecking" > "$TMPCONF" || true
cat >> "$TMPCONF" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile /tmp/deploy_key
  StrictHostKeyChecking no
EOF
mv "$TMPCONF" ~/.ssh/config
chmod 600 ~/.ssh/config

# Also configure git to use the explicit key (bypasses SSH agent caching issues)
git config --global core.sshCommand "ssh -i /tmp/deploy_key -o StrictHostKeyChecking=no"

echo "SSH deploy key restored. Testing connection..."
ssh -T git@github.com 2>&1 || true
