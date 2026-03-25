#!/bin/bash
# Restores the GitHub deploy key from the GITHUB_DEPLOY_KEY secret (base64-encoded)
# Run this at the start of any session that needs to push to GitHub
set -e

if [ -z "$GITHUB_DEPLOY_KEY" ]; then
  echo "GITHUB_DEPLOY_KEY secret is not set. Skipping SSH key setup."
  exit 0
fi

mkdir -p ~/.ssh

# Decode the base64-encoded private key to the key file
echo "$GITHUB_DEPLOY_KEY" | base64 -d > /tmp/deploy_key
chmod 600 /tmp/deploy_key

# Ensure SSH config points to this key
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
