import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { URL } from "node:url";

const server = new McpServer({ name: "fetch_ro", version: "1.0.0" });

function getAllowlist() {
  const raw = process.env.MCP_FETCH_ALLOWLIST || "";
  return raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}

function hostAllowed(hostname, allow) {
  const h = hostname.toLowerCase();
  return allow.some(a => h === a || h.endsWith(`.${a}`));
}

server.registerTool(
  "fetch_text",
  {
    description: "Fetch a URL (GET only) as text. Enforces MCP_FETCH_ALLOWLIST domains. Max 200KB.",
    inputSchema: {
      url: z.string().url(),
      maxBytes: z.number().int().min(1000).max(200000).optional(),
    },
  },
  async ({ url, maxBytes = 200000 }) => {
    const allow = getAllowlist();
    if (allow.length === 0) {
      return { content: [{ type: "text", text: "Blocked: MCP_FETCH_ALLOWLIST is empty." }] };
    }

    let u;
    try { u = new URL(url); } catch {
      return { content: [{ type: "text", text: "Invalid URL." }] };
    }

    if (!["https:", "http:"].includes(u.protocol)) {
      return { content: [{ type: "text", text: `Blocked: protocol ${u.protocol} not allowed.` }] };
    }

    if (!hostAllowed(u.hostname, allow)) {
      return { content: [{ type: "text", text: `Blocked: host not in allowlist (${u.hostname}).` }] };
    }

    try {
      const res = await fetch(url, { method: "GET" });
      const buf = new Uint8Array(await res.arrayBuffer());
      const sliced = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
      const text = new TextDecoder("utf-8").decode(sliced);

      return {
        content: [{
          type: "text",
          text:
            `HTTP ${res.status} ${res.statusText}\n` +
            `Content-Type: ${res.headers.get("content-type") || "unknown"}\n` +
            `Bytes: ${sliced.byteLength}${buf.byteLength > maxBytes ? ` (truncated from ${buf.byteLength})` : ""}\n\n` +
            text
        }]
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Fetch failed: ${e?.message ?? e}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("fetch_ro MCP server running (stdio)");
}

main().catch((err) => {
  console.error("fetch_ro fatal:", err);
  process.exit(1);
});
