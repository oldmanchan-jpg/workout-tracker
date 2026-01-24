#!/bin/bash
# Idempotent script to upgrade Node.js to v20+ in Ubuntu WSL using nvm
# Safe to re-run multiple times

set -e

echo "=== Node.js Upgrade Script for Ubuntu WSL ==="

# Check if nvm is installed, install if not
if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
    echo "nvm already installed, loading..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Install Node.js 20 LTS if not already installed
if ! nvm list | grep -q "v20\."; then
    echo "Installing Node.js 20 LTS..."
    nvm install 20 --lts
else
    echo "Node.js 20 LTS already installed"
fi

# Set Node 20 as default
echo "Setting Node.js 20 as default..."
nvm alias default 20
nvm use default

# Verify installation
echo ""
echo "=== Verification ==="
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""
echo "✓ Node.js upgrade complete!"
