# MCP Baseline Hardening Template

Copy/paste checklist for every new MCP server installation.

## 1. WSL Distro Selection Rule

**Always force Ubuntu explicitly** - Never rely on default WSL distro.

Use: `wsl.exe -d Ubuntu ...` in all MCP command configurations.

## 2. Minimal .cursor/mcp.json Structure

```json
{
  "mcpServers": {
    "your-mcp-name": {
      "command": "wsl.exe",
      "args": [
        "-d",
        "Ubuntu",
        "-e",
        "/bin/bash",
        "-lc",
        "node \"/mnt/c/Users/ABY/Documents/APP test/workout-tracker/scripts/mcp/your_server.mjs\" \"/mnt/c/Users/ABY/Documents/APP test/workout-tracker\""
      ],
      "env": {}
    }
  }
}
```

**Launch pattern**: `wsl.exe -d Ubuntu -e /bin/bash -lc "<command>"`

## 3. Three-Step Verification Script

### Step A: Inside-repo list/read works
- In Cursor: Ask assistant to list repo root directory → Should succeed
- In Cursor: Ask assistant to read `README.md` → Should succeed

### Step B: Outside-repo path read is blocked
- In Cursor: Ask assistant to read `/etc/passwd` → Should fail with access denied
- In Cursor: Ask assistant to read `/home/dharma/.ssh/id_rsa` → Should fail with access denied

### Step C: Repo remains clean (git status clean)
- In terminal: `git status` → Should show clean working tree (no unexpected changes)
