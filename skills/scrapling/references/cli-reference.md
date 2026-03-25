# Scrapling CLI Reference

## Installation

```bash
pip install "scrapling[shell]"
scrapling install  # Install browser dependencies
```

---

## Interactive Shell

Launch the interactive web scraping shell with IPython integration:

```bash
scrapling shell
```

**Features:**
- Pre-loaded Scrapling imports
- Shortcuts for common operations
- Convert curl requests to Scrapling code
- View results in browser

---

## Extract Commands

Extract page content directly without writing code.

### Basic Extract

```bash
# Extract full page to markdown
scrapling extract get 'https://example.com' content.md

# Extract to plain text
scrapling extract get 'https://example.com' content.txt

# Extract HTML
scrapling extract get 'https://example.com' content.html
```

### With CSS Selector

```bash
# Extract specific elements
scrapling extract get 'https://example.com/products' products.txt \
    --css-selector '.product'

# With impersonation
scrapling extract get 'https://example.com' data.md \
    --css-selector '#main-content' \
    --impersonate 'chrome'
```

### Stealthy Fetch (Anti-Bot)

```bash
# Bypass Cloudflare
scrapling extract stealthy-fetch 'https://protected.com' data.md \
    --solve-cloudflare

# With CSS selector
scrapling extract stealthy-fetch 'https://site.com' content.txt \
    --css-selector '.articles' \
    --headless
```

### Dynamic Fetch (Browser)

```bash
# Full browser automation
scrapling extract dynamic-fetch 'https://spa.com' content.md \
    --network-idle

# With options
scrapling extract dynamic-fetch 'https://app.com' data.txt \
    --headless \
    --disable-resources
```

---

## CLI Options

### Global Options

| Option | Description |
|--------|-------------|
| `--help` | Show help message |
| `--version` | Show version |

### Extract Options

| Option | Description |
|--------|-------------|
| `--css-selector` | CSS selector to extract |
| `--xpath-selector` | XPath selector to extract |
| `--impersonate` | Browser fingerprint (chrome, firefox, etc.) |
| `--headless` | Run browser headless |
| `--solve-cloudflare` | Auto-solve Cloudflare |
| `--network-idle` | Wait for network idle |
| `--disable-resources` | Block images/CSS/JS |
| `--proxy` | Proxy URL |
| `--output-format` | Output format (txt, md, html, json) |

---

## Output Formats

The output format is determined by the file extension:

| Extension | Format |
|-----------|--------|
| `.txt` | Plain text content |
| `.md` | Markdown representation |
| `.html` | Raw HTML content |
| `.json` | JSON structured data |

---

## Examples

### Quick Product Scraping

```bash
scrapling extract get 'https://quotes.toscrape.com/' quotes.txt \
    --css-selector '.quote'
```

### Bypass Cloudflare and Extract

```bash
scrapling extract stealthy-fetch 'https://nopecha.com/demo/cloudflare' \
    content.md \
    --css-selector '#padded_content' \
    --solve-cloudflare \
    --headless
```

### Extract to JSON

```bash
scrapling extract get 'https://api.example.com/data' \
    output.json \
    --output-format json
```

---

## Shell Shortcuts

In the interactive shell, use these shortcuts:

- `curl2scrapling <curl_command>` - Convert curl to Scrapling code
- `view <selector>` - Open element in browser
- `inspect` - Show DOM tree
- `export <file>` - Export current data

---

## Tips

1. **File extension determines format** - Use `.md` for markdown, `.txt` for plain text
2. **Use stealthy-fetch for protected sites** - Automatically handles Cloudflare
3. **Combine with pipes** - Pipe output to other tools
4. **Use in scripts** - CLI can be called from bash scripts for automation
