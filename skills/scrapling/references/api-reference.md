# Scrapling API Reference

## Fetchers

### Fetcher (HTTP Requests)

```python
from scrapling.fetchers import Fetcher, FetcherSession
```

**Methods:**
- `Fetcher.get(url, **kwargs)` - GET request
- `Fetcher.post(url, data, **kwargs)` - POST request
- `FetcherSession(**kwargs)` - Session with cookie persistence

**Parameters:**
- `impersonate` - Browser TLS fingerprint ('chrome', 'firefox135', etc.)
- `stealthy_headers` - Use stealthy headers
- `http3` - Enable HTTP/3 support
- `proxy` - Proxy URL

**Example:**
```python
with FetcherSession(impersonate='chrome') as session:
    page = session.get('https://example.com', stealthy_headers=True)
```

---

### StealthyFetcher (Anti-Bot)

```python
from scrapling.fetchers import StealthyFetcher, StealthySession
```

**Methods:**
- `StealthyFetcher.fetch(url, **kwargs)` - Fetch with anti-bot bypass
- `StealthySession(**kwargs)` - Persistent stealthy session

**Parameters:**
- `headless` - Run browser headless (default: True)
- `solve_cloudflare` - Auto-solve Cloudflare challenges
- `google_search` - Use Google search mode
- `network_idle` - Wait for network idle

**Example:**
```python
page = StealthyFetcher.fetch(
    'https://nopecha.com/demo/cloudflare',
    headless=True,
    solve_cloudflare=True,
    network_idle=True
)
```

---

### DynamicFetcher (Browser Automation)

```python
from scrapling.fetchers import DynamicFetcher, DynamicSession
```

**Methods:**
- `DynamicFetcher.fetch(url, **kwargs)` - Fetch with full browser
- `DynamicSession(**kwargs)` - Persistent browser session

**Parameters:**
- `headless` - Run headless
- `disable_resources` - Block images/CSS/JS for speed
- `network_idle` - Wait for network idle
- `load_dom` - Load full DOM

**Example:**
```python
with DynamicSession(headless=True) as session:
    page = session.fetch('https://example.com', load_dom=False)
    data = page.xpath('//div/text()').getall()
```

---

## Parser/Selector API

All fetchers return a `Selector` object with these methods:

### Selection

| Method | Description |
|--------|-------------|
| `css(selector)` | CSS selector, returns list |
| `xpath(selector)` | XPath selector, returns list |
| `find_all(tag, attrs)` | BeautifulSoup-style |
| `find_by_text(text, tag)` | Find by text content |
| `regex(pattern)` | Regex search |

### Extraction

| Method | Description |
|--------|-------------|
| `.get()` | Get first element text |
| `.getall()` | Get all elements as list |
| `.attrib['attr']` | Get attribute value |
| `.html` | Get inner HTML |
| `.outer_html` | Get outer HTML |

### Navigation

| Property/Method | Description |
|-----------------|-------------|
| `.parent` | Parent element |
| `.next_sibling` | Next sibling |
| `.previous_sibling` | Previous sibling |
| `.find_similar()` | Find similar elements |
| `.below_elements()` | Elements below |

### Auto-Selector Generation

```python
element.css_selector  # Generate CSS selector
element.xpath_selector  # Generate XPath selector
```

---

## Spiders API

```python
from scrapling.spiders import Spider, Response, Request
```

### Spider Class

```python
class MySpider(Spider):
    name = "myspider"
    start_urls = ["https://example.com/"]
    concurrent_requests = 10
    download_delay = 0.5

    async def parse(self, response: Response):
        # Extract data
        for item in response.css('.item'):
            yield {"name": item.css('::text').get()}

        # Follow links
        next_link = response.css('.next a')
        if next_link:
            yield response.follow(next_link[0].attrib['href'])
```

### Configuration

| Attribute | Description |
|-----------|-------------|
| `name` | Spider name |
| `start_urls` | List of starting URLs |
| `concurrent_requests` | Max concurrent requests |
| `download_delay` | Delay between requests |
| `custom_settings` | Custom settings dict |

### Running Spiders

```python
# Basic run
result = MySpider().start()

# With pause/resume
result = MySpider(crawldir="./data").start()

# Streaming mode
async for item in MySpider().stream():
    print(item)
```

### Response Methods

| Method | Description |
|--------|-------------|
| `response.css()` | CSS selection |
| `response.xpath()` | XPath selection |
| `response.follow(link)` | Create Request from link |
| `response.url` | Current URL |
| `response.text` | Response text |
| `response.body` | Response bytes |

### Request Class

```python
from scrapling.spiders import Request

# Create request with specific session
yield Request('https://protected.com', sid='stealth')

# With callback
yield Request(url, callback=self.parse_detail)
```

---

## Session Management

### Multi-Session Spider

```python
from scrapling.spiders import Spider
from scrapling.fetchers import FetcherSession, AsyncStealthySession

class MultiSessionSpider(Spider):
    def configure_sessions(self, manager):
        manager.add("fast", FetcherSession(impersonate="chrome"))
        manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)

    async def parse(self, response: Response):
        for link in response.css('a::attr(href)').getall():
            if "protected" in link:
                yield Request(link, sid="stealth")
            else:
                yield Request(link, sid="fast")
```

---

## Export

```python
# After spider run
result = MySpider().start()

# Export to JSON
result.items.to_json("output.json")

# Export to JSONL
result.items.to_jsonl("output.jsonl")

# Access items directly
for item in result.items:
    print(item)
```

---

## Proxy Rotation

```python
from scrapling.fetchers import ProxyRotator, StealthySession

# Built-in rotator
rotator = ProxyRotator(['proxy1', 'proxy2', 'proxy3'])

with StealthySession(proxy_rotator=rotator) as session:
    page = session.fetch('https://example.com')
```

---

## Async Support

```python
import asyncio
from scrapling.fetchers import AsyncStealthySession

async with AsyncStealthySession(max_pages=2) as session:
    tasks = [session.fetch(url) for url in urls]
    results = await asyncio.gather(*tasks)
```
