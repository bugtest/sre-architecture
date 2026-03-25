# Agent Browser Skill

Fast browser automation using accessibility tree snapshots with refs for deterministic element selection.

## Installation

```bash
npm install -g agent-browser
agent-browser install --with-deps  # Install Chrome + system deps
```

## Core Workflow

# 1. Navigate and snapshot
agent-browser open https://example.com
agent-browser snapshot -i --json

# 2. Parse refs from JSON, then interact
agent-browser click @e2
agent-browser fill @e3 "text"

# 3. Re-snapshot after page changes
agent-browser snapshot -i --json

## Key Commands

### Navigation
- `agent-browser open <url>` - Open URL
- `agent-browser back | forward | reload | close` - Navigation controls

### Snapshot (Always use -i --json)
- `agent-browser snapshot -i --json` - Interactive elements, JSON output
- `agent-browser snapshot -i -c -d 5 --json` - Compact, depth limit
- `agent-browser snapshot -s "#main" -i` - Scope to selector

### Interactions (Ref-based)
- `agent-browser click @e2` - Click element
- `agent-browser fill @e3 "text"` - Fill text field
- `agent-browser type @e3 "text"` - Type text
- `agent-browser hover @e4` - Hover element
- `agent-browser check @e5 | uncheck @e5` - Check/uncheck
- `agent-browser select @e6 "value"` - Select option
- `agent-browser press "Enter"` - Press key
- `agent-browser scroll down 500` - Scroll page
- `agent-browser drag @e7 @e8` - Drag and drop

### Get Information
- `agent-browser get text @e1 --json` - Get text
- `agent-browser get html @e2 --json` - Get HTML
- `agent-browser get value @e3 --json` - Get value
- `agent-browser get attr @e4 "href" --json` - Get attribute
- `agent-browser get title --json` - Get page title
- `agent-browser get url --json` - Get current URL
- `agent-browser get count ".item" --json` - Count elements

### Check State
- `agent-browser is visible @e2 --json` - Check visibility
- `agent-browser is enabled @e3 --json` - Check enabled
- `agent-browser is checked @e4 --json` - Check checked

### Wait
- `agent-browser wait @e2` - Wait for element
- `agent-browser wait 1000` - Wait milliseconds
- `agent-browser wait --text "Welcome"` - Wait for text
- `agent-browser wait --url "**/dashboard"` - Wait for URL
- `agent-browser wait --load networkidle` - Wait for network
- `agent-browser wait --fn "window.ready === true"` - Wait for JS condition

### Sessions (Isolated Browsers)
- `agent-browser --session admin open site.com` - Admin session
- `agent-browser --session user open site.com` - User session
- `agent-browser session list` - List sessions

### State Persistence
- `agent-browser state save auth.json` - Save cookies/storage
- `agent-browser state load auth.json` - Load (skip login)

### Screenshots & PDFs
- `agent-browser screenshot page.png` - Screenshot
- `agent-browser screenshot --full page.png` - Full page screenshot
- `agent-browser pdf page.pdf` - Save as PDF

### Network Control
- `agent-browser network route "**/ads/*" --abort` - Block requests
- `agent-browser network route "**/api/*" --body '{"x":1}'` - Mock API
- `agent-browser network requests --filter api` - View requests

### Cookies & Storage
- `agent-browser cookies` - Get all cookies
- `agent-browser cookies set name value` - Set cookie
- `agent-browser storage local key` - Get localStorage
- `agent-browser storage local set key val` - Set localStorage

### Tabs & Frames
- `agent-browser tab new https://example.com` - New tab
- `agent-browser tab 2` - Switch to tab
- `agent-browser frame @e5` - Switch to iframe
- `agent-browser frame main` - Back to main frame

## Best Practices

- Always use `-i` flag - Focus on interactive elements
- Always use `--json` - Easier to parse
- Wait for stability - `agent-browser wait --load networkidle`
- Save auth state - Skip login flows with state save/load
- Use sessions - Isolate different browser contexts
- Use `--headed` for debugging - See what's happening

## Example: Search and Extract

```bash
agent-browser open https://www.google.com
agent-browser snapshot -i --json
# AI identifies search box @e1
agent-browser fill @e1 "AI agents"
agent-browser press Enter
agent-browser wait --load networkidle
agent-browser snapshot -i --json
# AI identifies result refs
agent-browser get text @e3 --json
agent-browser get attr @e4 "href" --json
```

## Example: Multi-Session Testing

```bash
# Admin session
agent-browser --session admin open app.com
agent-browser --session admin state load admin-auth.json

# User session
agent-browser --session user open app.com
agent-browser --session user snapshot -i --json
```
