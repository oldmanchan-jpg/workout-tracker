#!/usr/bin/env node
/**
 * UI Eyes Playwright MCP Server
 * 
 * A minimal MCP server that provides "UI eyes" via Playwright headful (visible browser).
 * Provides tools to open, navigate, screenshot, and close a browser instance.
 * 
 * Usage:
 *   node ui_eyes_playwright_server.mjs <REPO_ROOT>
 * 
 * Protocol: stdio (MCP over stdin/stdout)
 * 
 * CRITICAL: This server must NEVER output to STDOUT except for JSON-RPC messages.
 * - Use console.error() for errors (goes to stderr)
 * - Use process.stderr.write() for debug logs if needed
 * - NEVER use console.log() (goes to stdout and pollutes JSON-RPC)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const REPO_ROOT = process.argv[2];

// Validate repository root before starting server
if (!REPO_ROOT) {
  console.error('Error: Repository root path is required');
  console.error('Usage: node ui_eyes_playwright_server.mjs <REPO_ROOT>');
  process.exit(1);
}

// Normalize and resolve path
let repoRoot;
try {
  repoRoot = resolve(REPO_ROOT);
} catch (error) {
  console.error(`Error: Invalid repository root path: ${REPO_ROOT}`);
  process.exit(1);
}

// Check if path exists
if (!existsSync(repoRoot)) {
  console.error(`Error: Repository root does not exist: ${repoRoot}`);
  process.exit(1);
}

// Screenshot output directory
const SCREENSHOT_DIR = resolve(repoRoot, 'artifacts', 'screenshots');

// Ensure screenshot directory exists
try {
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
} catch (error) {
  console.error(`Error: Failed to create screenshot directory: ${error.message}`);
  process.exit(1);
}

// Browser instance state
let browser = null;
let context = null;
let page = null;

// Helper to generate screenshot filename
function generateScreenshotFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `screenshot-${timestamp}.png`;
}

// Helper to validate and resolve screenshot path
function validateAndResolveScreenshotPath(fullPath, repoRoot) {
  // If no path provided, use default
  if (!fullPath) {
    const filename = generateScreenshotFilename();
    return resolve(repoRoot, 'artifacts', 'screenshots', filename);
  }

  // Reject paths containing .. (path traversal attempt)
  if (fullPath.includes('..')) {
    throw new Error(`Screenshot path cannot contain '..'. Got: ${fullPath}`);
  }
  
  // Resolve path against repoRoot (handles both relative and absolute paths)
  const resolved = resolve(repoRoot, fullPath);
  const screenshotsDir = resolve(repoRoot, 'artifacts', 'screenshots');
  
  // Ensure the resolved path is within the screenshots directory
  // This check rejects absolute paths outside the repo and relative paths that escape
  if (!resolved.startsWith(screenshotsDir)) {
    throw new Error(`Screenshot path must be under artifacts/screenshots/. Got: ${fullPath}`);
  }
  
  return resolved;
}

// Create MCP server
const server = new Server(
  {
    name: 'ui-eyes-playwright-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'open',
      description: 'Open a visible browser window (headful mode)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'goto',
      description: 'Navigate to a URL',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL to navigate to',
          },
        },
        required: ['url'],
      },
    },
    {
      name: 'screenshot',
      description: 'Take a screenshot and save it to artifacts/screenshots/',
      inputSchema: {
        type: 'object',
        properties: {
          fullPath: {
            type: 'string',
            description: 'Full path where screenshot should be saved. Must be under artifacts/screenshots/. If not provided, defaults to artifacts/screenshots/screenshot-<timestamp>.png',
          },
          fullPage: {
            type: 'boolean',
            description: 'Whether to capture the full page (default: true)',
          },
        },
      },
    },
    {
      name: 'close',
      description: 'Close the browser',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'open': {
        if (browser) {
          return {
            content: [
              {
                type: 'text',
                text: 'Browser is already open. Use close() first if you want to open a new browser.',
              },
            ],
            isError: true,
          };
        }

        try {
          browser = await chromium.launch({
            headless: false, // Headful mode - browser will be visible
          });
          context = await browser.newContext();
          page = await context.newPage();

          return {
            content: [
              {
                type: 'text',
                text: 'Browser opened successfully in headful (visible) mode.',
              },
            ],
          };
        } catch (error) {
          browser = null;
          context = null;
          page = null;
          return {
            content: [
              {
                type: 'text',
                text: `Error: Failed to open browser: ${error.message || String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'goto': {
        if (!page) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Browser is not open. Call open() first.',
              },
            ],
            isError: true,
          };
        }

        const url = args?.url;
        if (!url || typeof url !== 'string') {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: url parameter is required and must be a string',
              },
            ],
            isError: true,
          };
        }

        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          const currentUrl = page.url();
          const title = await page.title();

          return {
            content: [
              {
                type: 'text',
                text: `Successfully navigated to: ${currentUrl}\nPage title: ${title}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Failed to navigate to ${url}: ${error.message || String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'screenshot': {
        if (!page) {
          return {
            content: [
              {
                type: 'text',
                text: 'Error: Browser is not open. Call open() first.',
              },
            ],
            isError: true,
          };
        }

        try {
          const fullPage = args?.fullPage !== false; // Default to true
          const fullPath = args?.fullPath;
          
          // Validate and resolve the screenshot path
          const filepath = validateAndResolveScreenshotPath(fullPath, repoRoot);
          
          // Ensure parent directory exists
          const parentDir = dirname(filepath);
          if (!existsSync(parentDir)) {
            mkdirSync(parentDir, { recursive: true });
          }

          // Save screenshot directly to the requested path
          await page.screenshot({
            path: filepath,
            fullPage: fullPage,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  path: filepath,
                  message: `Screenshot saved to: ${filepath}`,
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: Failed to take screenshot: ${error.message || String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'close': {
        if (!browser) {
          return {
            content: [
              {
                type: 'text',
                text: 'Browser is not open.',
              },
            ],
          };
        }

        try {
          await browser.close();
          browser = null;
          context = null;
          page = null;

          return {
            content: [
              {
                type: 'text',
                text: 'Browser closed successfully.',
              },
            ],
          };
        } catch (error) {
          // Clean up state even if close fails
          browser = null;
          context = null;
          page = null;

          return {
            content: [
              {
                type: 'text',
                text: `Error: Failed to close browser: ${error.message || String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Error: Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Cleanup on exit
process.on('SIGINT', async () => {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
  process.exit(0);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now running and will handle requests
}

main().catch((error) => {
  // Use console.error (stderr) for errors - never console.log (stdout)
  // This ensures MCP JSON-RPC traffic on stdout remains clean
  console.error('Fatal error:', error);
  if (browser) {
    browser.close().catch(() => {});
  }
  process.exit(1);
});
