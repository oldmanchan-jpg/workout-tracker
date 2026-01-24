# Node.js Upgrade for Ubuntu WSL

Run in Ubuntu WSL: `bash scripts/wsl/upgrade_node_ubuntu_to_20.sh`

**Important:** Restart Cursor after upgrade for MCPs to pick up the new Node version.

## Acceptance Checks

1. In Ubuntu WSL: `node -v` shows `v20.x.x` or higher
2. Filesystem MCP still connects in Cursor and can list repo root after restart
