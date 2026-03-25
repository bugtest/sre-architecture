# Scrapling Usage Examples

## Example 1: Simple Product Scraping

```python
from scrapling.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')

products = []
for quote in page.css('.quote'):
    products.append({
        'text': quote.css('.text::text').get(),
        'author': quote.css('.author::text').get(),
        'tags': quote.css('.tag::text').getall()
    })

print(f"Scraped {len(products)} quotes")
```

---

## Example 2: Bypassing Cloudflare

```python
from scrapling.fetchers import StealthyFetcher

page = StealthyFetcher.fetch(
    'https://nopecha.com/demo/cloudflare',
    headless=True,
    solve_cloudflare=True,
    network_idle=True
)

content = page.css('#padded_content a').getall()
print(content)
```

---

## Example 3: Pagination Crawl

```python
from scrapling.fetchers import Fetcher

def scrape_all_pages(base_url, max_pages=10):
    all_items = []
    
    for page_num in range(1, max_pages + 1):
        url = f"{base_url}?page={page_num}"
        page = Fetcher.get(url)
        
        items = page.css('.item').getall()
        if not items:
            break
            
        all_items.extend(items)
        print(f"Page {page_num}: {len(items)} items")
    
    return all_items

items = scrape_all_pages('https://example.com/products')
```

---

## Example 4: Spider with Concurrent Requests

```python
from scrapling.spiders import Spider, Response

class ProductSpider(Spider):
    name = "products"
    start_urls = ["https://quotes.toscrape.com/"]
    concurrent_requests = 5

    async def parse(self, response: Response):
        # Extract quotes
        for quote in response.css('.quote'):
            yield {
                'text': quote.css('.text::text').get(),
                'author': quote.css('.author::text').get()
            }

        # Follow next page
        next_page = response.css('.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

# Run and export
result = ProductSpider().start()
result.items.to_json("quotes.json")
print(f"Total: {len(result.items)} quotes")
```

---

## Example 5: Multi-Session Spider

```python
from scrapling.spiders import Spider, Request, Response
from scrapling.fetchers import FetcherSession, AsyncStealthySession

class MixedSpider(Spider):
    name = "mixed"
    start_urls = ["https://example.com/"]

    def configure_sessions(self, manager):
        # Fast session for regular pages
        manager.add("fast", FetcherSession(impersonate="chrome"))
        # Stealthy session for protected pages
        manager.add("stealth", AsyncStealthySession(headless=True), lazy=True)

    async def parse(self, response: Response):
        links = response.css('a::attr(href)').getall()
        
        for link in links:
            if "protected" in link or "login" in link:
                # Use stealthy session for protected pages
                yield Request(link, sid="stealth", callback=self.parse_protected)
            else:
                # Use fast session for regular pages
                yield Request(link, sid="fast", callback=self.parse)

    async def parse_protected(self, response: Response):
        yield {
            'url': response.url,
            'content': response.css('body::text').get()
        }

result = MixedSpider().start()
```

---

## Example 6: Pause and Resume Long Crawl

```python
from scrapling.spiders import Spider, Response

class LongCrawlSpider(Spider):
    name = "longcrawl"
    start_urls = ["https://example.com/"]
    concurrent_requests = 10

    async def parse(self, response: Response):
        # Your scraping logic
        for item in response.css('.item'):
            yield {'data': item.css('::text').get()}
        
        # Follow links
        for link in response.css('a::attr(href)').getall():
            yield response.follow(link)

# Start with checkpoint directory
spider = LongCrawlSpider(crawldir="./crawl_checkpoints")
result = spider.start()

# Press Ctrl+C to pause gracefully
# Later restart with same crawldir to resume
```

---

## Example 7: Streaming Mode

```python
import asyncio
from scrapling.spiders import Spider, Response

class StreamingSpider(Spider):
    name = "streaming"
    start_urls = ["https://quotes.toscrape.com/"]

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                'text': quote.css('.text::text').get(),
                'author': quote.css('.author::text').get()
            }
        
        next_page = response.css('.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page)

# Process items as they arrive
async def main():
    async for item in StreamingSpider().stream():
        print(f"Received: {item}")

asyncio.run(main())
```

---

## Example 8: Adaptive Selection

```python
from scrapling.fetchers import Fetcher

page = Fetcher.get('https://example.com/products')

# Auto-save selector for future use
products = page.css('.product', auto_save=True)

# Later, if website structure changes
# Pass adaptive=True to relocate elements
products = page.css('.product', adaptive=True)

# Find similar elements
if products:
    similar = products[0].find_similar()
```

---

## Example 9: CLI Usage

```bash
# Interactive shell
scrapling shell

# Extract to markdown
scrapling extract get 'https://example.com' content.md

# Extract with CSS selector to text file
scrapling extract get 'https://example.com/products' products.txt \
    --css-selector '.product' \
    --impersonate 'chrome'

# Stealthy fetch (bypass Cloudflare)
scrapling extract stealthy-fetch 'https://protected.com' data.md \
    --solve-cloudflare \
    --headless

# Dynamic fetch with browser
scrapling extract dynamic-fetch 'https://spa.com' content.md \
    --network-idle
```

---

## Example 10: Element Navigation

```python
from scrapling.fetchers import Fetcher

page = Fetcher.get('https://quotes.toscrape.com/')

# Get first quote
first_quote = page.css('.quote')[0]

# Navigate relationships
text = first_quote.css('.text::text').get()
author = first_quote.next_sibling.css('.author::text').get()
parent = first_quote.parent
container = parent.parent

# Find elements below
below = first_quote.below_elements()

# Generate selectors
css = first_quote.css_selector
xpath = first_quote.xpath_selector
print(f"CSS: {css}")
print(f"XPath: {xpath}")
```

---

## Example 11: Proxy Rotation

```python
from scrapling.fetchers import StealthyFetcher, ProxyRotator

proxies = [
    'http://proxy1:port',
    'http://proxy2:port',
    'http://proxy3:port'
]

rotator = ProxyRotator(proxies, strategy='cyclic')

page = StealthyFetcher.fetch(
    'https://example.com',
    proxy_rotator=rotator,
    solve_cloudflare=True
)
```

---

## Example 12: Export Data

```python
from scrapling.spiders import Spider, Response

class ExportSpider(Spider):
    name = "export"
    start_urls = ["https://quotes.toscrape.com/"]

    async def parse(self, response: Response):
        for quote in response.css('.quote'):
            yield {
                'text': quote.css('.text::text').get(),
                'author': quote.css('.author::text').get(),
                'tags': quote.css('.tag::text').getall()
            }
        
        next_page = response.css('.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page)

result = ExportSpider().start()

# Export formats
result.items.to_json("quotes.json")
result.items.to_jsonl("quotes.jsonl")

# Or access directly
import json
with open('manual.json', 'w') as f:
    json.dump(list(result.items), f, indent=2)
```
