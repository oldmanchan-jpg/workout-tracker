import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const server = new McpServer({ name: "runner_ro", version: "1.0.0" });

server.registerTool(
  "node_version",
  { description: "Return Node.js version for this MCP process", inputSchema: {} },
  async () => ({ content: [{ type: "text", text: process.version }] })
);

server.registerTool(
  "which_node",
  { description: "Return absolute path to node used by this MCP process", inputSchema: {} },
  async () => ({ content: [{ type: "text", text: process.execPath }] })
);

server.registerTool(
  "npm_version",
  { description: "Return npm version", inputSchema: {} },
  async () => {
    try {
      const { stdout } = await execFileAsync("npm", ["-v"], { timeout: 20000 });
      return { content: [{ type: "text", text: stdout.trim() }] };
    } catch (e) {
      return { content: [{ type: "text", text: `npm failed: ${e?.message ?? e}` }] };
    }
  }
);

// Strict allowlist, no shell.
const ALLOW = new Set(["node", "npm", "git", "ls", "pwd", "cat", "whoami"]);

server.registerTool(
  "exec_ro",
  {
    description: "Run a safe read-only command from allowlist (no shell).",
    inputSchema: {
      cmd: z.string().min(1),
      args: z.array(z.string()).optional(),
      cwd: z.string().optional(),
    },
  },
  async ({ cmd, args = [], cwd }) => {
    if (!ALLOW.has(cmd)) {
      return { content: [{ type: "text", text: `Blocked: ${cmd} not in allowlist` }] };
    }
    try {
      const { stdout } = await execFileAsync(cmd, args, {
        cwd: cwd || process.cwd(),
        timeout: 20000,
      });
      return { content: [{ type: "text", text: stdout.trim() || "(no output)" }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Command failed: ${e?.message ?? e}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("runner_ro MCP server running (stdio)");
}

main().catch((err) => {
  console.error("runner_ro fatal:", err);
  process.exit(1);
});
