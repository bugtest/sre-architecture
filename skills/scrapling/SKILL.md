---
name: scrapling
description: Web scraping with Scrapling framework. Use when user needs to scrape websites, extract web data, crawl pages, or bypass anti-bot systems like Cloudflare. Supports HTTP requests, stealthy browser automation, and full-scale spider crawls with pause/resume.
---

# Scrapling Web Scraping Skill

Scrapling is an adaptive web scraping framework for Python. Use this skill when the user needs to:
- Extract data from websites (single pages or full crawls)
- Bypass anti-bot systems (Cloudflare Turnstile, etc.)
- Build concurrent crawlers with pause/resume capability
- Use CLI to scrape without writing code

## Quick Start

### Installation

```bash
pip install scrapling
scrapling install  # Install browser dependencies
```

### Basic Usage

```python
from scrapling.fetchers import Fetcher

# Simple HTTP request
page = Fetcher.get('https://example.com')
data = page.css('.target-class::text').getall()
```

## Fetchers

### Fetcher - HTTP Requests
Fast HTTP requests with TLS fingerprint impersonation.

```python
from scrapling.fetchers import Fetcher, FetcherSession

# One-off request
page = Fetcher.get('https://quotes.toscrape.com/', impersonate='chrome')
quotes = page.css('.quote .text::text').getall()

# Session with cookies
with FetcherSession(impersonate='chrome') as session:
    page1 = session.get('https://example.com/login')
    page2 = session.get('https://example.com/protected')
```

### StealthyFetcher - Anti-Bot Bypass
Bypasses Cloudflare and other anti-bot systems automatically.

```python
from scrapling.fetchers import StealthyFetcher

page = StealthyFetcher.fetch(
    'https://nopecha.com/demo/cloudflare',
    headless=True,
    solve_cloudflare=True
)
data = page.css('#content').getall()
```

### DynamicFetcher - Full Browser Automation
Full browser automation with Playwright/Chrome.

```python
from scrapling.fetchers import DynamicFetcher

page = DynamicFetcher.fetch(
    'https://quotes.toscrape.com/',
    headless=True,
    network_idle=True
)
data = page.xpath('//span[@class="text"]/text()').getall()
```

## Selection Methods

```python
from scrapling.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')

# CSS Selector
quotes = page.css('.quote')
text = page.css('.text::text').get()
all_texts = page.css('.text::text').getall()

# XPath
quotes = page.xpath('//div[@class="quote"]')

# BeautifulSoup-style
quotes = page.find_all('div', class_='quote')

# By text
quote = page.find_by_text('quote', tag='div')

# Navigation
first = page.css('.quote')[0]
parent = first.parent
sibling = first.next_sibling
similar = first.find_similar()
```

## Building Spiders

For large-scale crawls with concurrency and pause/resume:

```python
from scrapling.spiders import Spider, Response

class QuotesSpider(Spider):
    name = "quotes"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 10

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                "text": quote.css('.text::text').get(),
                "author": quote.css('.author::text').get(),
            }

        next_page = response.css('.next a')
        if next_page:
            yield response.follow(next_page[0].attrib['href'])

# Run with pause/resume support
result = QuotesSpider(crawldir="./crawl_data").start()
result.items.to_json("quotes.json")
```

## CLI Usage

Scrapling includes a powerful CLI for scraping without code:

```bash
# Launch interactive shell
scrapling shell

# Extract page content
scrapling extract get 'https://example.com' content.md

# Extract with CSS selector
scrapling extract get 'https://example.com' data.txt --css-selector '.products'

# Stealthy fetch (bypass Cloudflare)
scrapling extract stealthy-fetch 'https://site.com' data.md --solve-cloudflare
```

## Reference Files

- See `references/api-reference.md` for complete API documentation
- See `references/examples.md` for more usage patterns
- See `references/cli-reference.md` for CLI commands

## Tips

1. **Start simple**: Use `Fetcher` for basic HTTP requests
2. **Use StealthyFetcher** when encountering Cloudflare or bot detection
3. **Use Spiders** for large-scale concurrent crawls
4. **Enable adaptive mode**: `page.css('.product', adaptive=True)` to handle website changes
5. **Export easily**: `result.items.to_json()` or `result.items.to_jsonl()`
