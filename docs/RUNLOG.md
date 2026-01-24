# Run Log
(append only)
- Date/Time:
  Task:
  Commit:
  Result:
  Notes:

---

**Date:** 2026-01-24

**Milestone:** MCP #1 (filesystem) connected + hardened

**Root cause (initial failure):** Cursor launched MCP via default WSL distro docker-desktop → execvpe(/bin/bash) failed: No such file or directory

**Fix:** Force WSL distro: wsl.exe -d Ubuntu -e /bin/bash -lc ...

**Final working MCP command:** Uses npx -y @modelcontextprotocol/server-filesystem with explicit WSL distro specification (Ubuntu) and proper bash invocation via wsl.exe

**Repo root path:** /mnt/c/Users/ABY/Documents/APP test/workout-tracker

**Verification:**
- Directory listing worked
- Escape test: /etc blocked ("path outside allowed directories")

**Commits made:**
- chore(mcp): add filesystem MCP (Ubuntu via wsl.exe)
- chore: allow tracking .cursor/mcp.json
