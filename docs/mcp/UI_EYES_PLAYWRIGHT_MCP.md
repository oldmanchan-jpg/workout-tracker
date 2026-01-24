# UI Eyes Playwright MCP for WorkflowAI

## Overview

The UI Eyes Playwright MCP (Model Context Protocol) server provides the AI agent with "UI eyes" via Playwright in headful (visible browser) mode. This allows the agent to visually interact with web pages, navigate to URLs, and capture screenshots.

## Purpose

The UI Eyes Playwright MCP serves as visual browser automation for the AI agent:
- **Open visible browser** - Launch a headful (non-headless) browser window that is visible to the user
- **Navigate to URLs** - Load web pages and wait for them to be ready
- **Capture screenshots** - Take screenshots and save them to `artifacts/screenshots/`
- **Close browser** - Properly shut down the browser instance

## Security Model: Read-Only with Screenshot Output

### Read-Only Enforcement

**All browser operations are read-only by design**:
- ✅ **Read operations**: `open()`, `goto()`, `screenshot()` - Always allowed
- ❌ **Write operations**: No file writes except screenshots to `artifacts/screenshots/`
- ❌ **Form submissions**: Not supported (read-only navigation only)
- ❌ **File downloads**: Not supported
- ❌ **Cookie/localStorage manipulation**: Not supported

### Screenshot Output

Screenshots are the only file write operation allowed:
- ✅ **Screenshots**: Saved to `artifacts/screenshots/` directory
- ✅ **Automatic directory creation**: Directory is created if it doesn't exist
- ✅ **Timestamped filenames**: Each screenshot has a unique timestamp-based filename
- ❌ **No other file writes**: All other file system writes are blocked

### Security Guarantees

1. **Headful mode only**: Browser runs in visible (headful) mode for transparency
2. **Read-only navigation**: Can navigate to URLs but cannot submit forms or interact with pages
3. **Screenshot-only writes**: Only screenshots can be written to `artifacts/screenshots/`
4. **No persistent state**: Browser state is not persisted between sessions
5. **Clean shutdown**: Browser is properly closed on server shutdown

## Configuration

The UI Eyes Playwright MCP server is configured in Cursor's MCP settings (`.cursor/mcp.json`). The server runs via Node.js and communicates over stdio.

### Key Configuration Points

- **Server**: Custom MCP server (`scripts/mcp/ui_eyes_playwright_server.mjs`)
- **Wrapper Script**: `scripts/mcp/run_ui_eyes_playwright_mcp.sh`
- **Execution**: Runs via WSL Ubuntu bash
- **Protocol**: stdio (standard input/output)
- **Browser**: Playwright Chromium in headful mode

### Example Configuration

```json
{
  "mcpServers": {
    "ui_eyes_playwright": {
      "command": "wsl.exe",
      "args": [
        "-d",
        "Ubuntu",
        "-e",
        "/bin/bash",
        "-lc",
        "\"/mnt/c/Users/ABY/Documents/APP test/workout-tracker/scripts/mcp/run_ui_eyes_playwright_mcp.sh\" \"/mnt/c/Users/ABY/Documents/APP test/workout-tracker\""
      ],
      "env": {}
    }
  }
}
```

## Available Tools

The server exposes exactly 4 tools:

### 1. `open()`
Opens a visible browser window in headful mode.

**Parameters**: None

**Returns**: Success message if browser opened successfully

**Errors**: Returns error if:
- Browser is already open (must call `close()` first)
- Failed to launch browser (Playwright not installed, system issues, etc.)

### 2. `goto(url)`
Navigates to a URL and waits for the page to load.

**Parameters**:
- `url` (string, required): URL to navigate to

**Returns**: Object with:
- Current URL after navigation
- Page title

**Errors**: Returns error if:
- Browser is not open (must call `open()` first)
- URL is invalid or unreachable
- Navigation times out
- Network errors occur

### 3. `screenshot(fullPage?)`
Takes a screenshot of the current page and saves it to `artifacts/screenshots/`.

**Parameters**:
- `fullPage` (boolean, optional): Whether to capture the full page (default: false)

**Returns**: Path to saved screenshot file

**Errors**: Returns error if:
- Browser is not open (must call `open()` first)
- Screenshot directory cannot be created
- Screenshot capture fails

### 4. `close()`
Closes the browser and cleans up resources.

**Parameters**: None

**Returns**: Success message if browser closed successfully

**Errors**: Returns error if:
- Browser close fails (state is still cleaned up)

## Browser State Management

The server maintains a single browser instance:
- **Single instance**: Only one browser can be open at a time
- **State tracking**: Server tracks browser, context, and page instances
- **Cleanup on exit**: Browser is automatically closed on server shutdown (SIGINT/SIGTERM)
- **Error recovery**: State is cleaned up even if operations fail

## Screenshot Storage

Screenshots are saved to `artifacts/screenshots/`:
- **Directory**: `artifacts/screenshots/` (relative to repository root)
- **Filename format**: `screenshot-YYYY-MM-DDTHH-MM-SS-sssZ.png`
- **Automatic creation**: Directory is created automatically if it doesn't exist
- **Read-only exception**: This is the only directory where file writes are allowed

## Troubleshooting

### MCP Server Not Connecting

1. **Check Node.js is available**: `node --version` should work (Node 18+ required)
2. **Verify Playwright is installed**: `npx playwright --version` should work
3. **Check Playwright browsers**: Run `npx playwright install chromium` if needed
4. **Review Cursor logs**: Check Cursor's MCP connection logs for error messages
5. **Verify script permissions**: Ensure `run_ui_eyes_playwright_mcp.sh` is executable
6. **Check WSL Ubuntu**: Ensure WSL Ubuntu is available and accessible

### Browser Launch Failures

If `open()` fails:

1. **Playwright not installed**: Install Playwright: `npm install playwright`
2. **Chromium not installed**: Install browsers: `npx playwright install chromium`
3. **Display server issues**: On Linux/WSL, ensure X11 forwarding or display server is configured
4. **Permissions**: Check that the user has permission to launch browsers
5. **System resources**: Ensure sufficient system resources are available

### Navigation Failures

If `goto()` fails:

1. **Invalid URL**: Verify URL format is correct (must include protocol: `https://` or `http://`)
2. **Network issues**: Check internet connectivity
3. **Timeout**: Page may be taking too long to load
4. **SSL errors**: Some sites may have certificate issues
5. **Browser not open**: Ensure `open()` was called first

### Screenshot Failures

If `screenshot()` fails:

1. **Directory permissions**: Check that `artifacts/screenshots/` can be created/written
2. **Disk space**: Ensure sufficient disk space is available
3. **Browser not open**: Ensure `open()` was called first
4. **Page not loaded**: Ensure page has finished loading before taking screenshot

### Display Issues (WSL/Linux)

If browser window doesn't appear:

1. **X11 forwarding**: Configure X11 forwarding for WSL: `export DISPLAY=:0` or use VcXsrv/X410
2. **Display server**: Ensure an X server is running (X11, Wayland, etc.)
3. **WSL2 GUI**: On Windows 11, WSL2 GUI support may be available
4. **Headless fallback**: If display is unavailable, consider using headless mode (not recommended for UI eyes)

## Manual Test Plan

Inside Cursor, after configuring the MCP server:

1. **Confirm connection**: Check that the MCP server shows "connected" status
2. **Test open()**: Ask the assistant to open a browser - should see a visible browser window appear
3. **Test goto()**: Ask to navigate to `https://example.com` - browser should load the page
4. **Test screenshot()**: Ask to take a screenshot - should save to `artifacts/screenshots/`
5. **Test close()**: Ask to close the browser - browser window should disappear
6. **Test error handling**: Try `goto()` before `open()` - should return appropriate error
7. **Test multiple operations**: Open, navigate to multiple URLs, take screenshots, then close

## Acceptance Checks

Before considering the UI Eyes Playwright MCP server ready:

- ✅ Server starts successfully via WSL Ubuntu bash
- ✅ MCP appears in Cursor MCP list as `ui_eyes_playwright`
- ✅ `open()` launches a visible browser window (headful mode)
- ✅ `goto("https://example.com")` loads successfully
- ✅ `screenshot()` returns an image artifact and saves to `artifacts/screenshots/`
- ✅ `close()` shuts the browser properly
- ✅ Browser state is properly managed (single instance)
- ✅ Screenshots are the only file writes allowed
- ✅ Browser cleanup on server shutdown works correctly
- ✅ All tools work correctly when tested manually

## Future Enhancements

Potential improvements for future phases:
- Support for multiple browser instances
- Page interaction tools (click, type, etc.) - if write operations are needed
- Wait for specific elements before screenshot
- Custom viewport sizes
- PDF export capability
- Video recording of browser sessions
- Cookie/localStorage inspection (read-only)

---

**Status**: Minimal Baseline (Read-Only Navigation + Screenshots)
**Last Updated**: 2026-01-24
