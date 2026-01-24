import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const repoRoot = process.argv[2];
if (!repoRoot) {
  console.error("git_ro: missing repo path argument");
  process.exit(2);
}

const server = new McpServer({ name: "git_ro", version: "1.0.0" });

const ALLOW = new Set([
  "status",
  "log",
  "diff",
  "show",
  "branch",
  "rev-parse",
  "ls-files",
  "remote",
]);

async function git(args) {
  const { stdout } = await execFileAsync("git", args, { cwd: repoRoot, timeout: 20000 });
  return stdout.trim();
}

server.registerTool(
  "git",
  {
    description: "Run a read-only git subcommand. Allowed: status, log, diff, show, branch, rev-parse, ls-files, remote.",
    inputSchema: { subcommand: z.string().min(1), args: z.array(z.string()).optional() },
  },
  async ({ subcommand, args = [] }) => {
    if (!ALLOW.has(subcommand)) {
      return { content: [{ type: "text", text: `Blocked: git ${subcommand} not allowed.` }] };
    }
    try {
      const out = await git([subcommand, ...args]);
      return { content: [{ type: "text", text: out || "(no output)" }] };
    } catch (e) {
      return { content: [{ type: "text", text: `git failed: ${e?.message ?? e}` }] };
    }
  }
);

server.registerTool(
  "status",
  { description: "git status --porcelain=v1 -b", inputSchema: {} },
  async () => {
    try {
      const out = await git(["status", "--porcelain=v1", "-b"]);
      return { content: [{ type: "text", text: out || "(clean)" }] };
    } catch (e) {
      return { content: [{ type: "text", text: `git status failed: ${e?.message ?? e}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("git_ro MCP server running (stdio)");
}

main().catch((err) => {
  console.error("git_ro fatal:", err);
  process.exit(1);
});
