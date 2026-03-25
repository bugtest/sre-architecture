#!/usr/bin/env python3
"""
Scrapling Spider Template
A reusable template for building web crawlers with Scrapling.

Usage:
    python spider-template.py --url https://example.com --output data.json
"""

import argparse
import asyncio
from scrapling.spiders import Spider, Response


class GenericSpider(Spider):
    """Generic spider template - customize for your needs."""
    
    name = "generic-spider"
    concurrent_requests = 10
    download_delay = 0.5
    
    def __init__(self, start_urls=None, css_selector=None, **kwargs):
        super().__init__(**kwargs)
        if start_urls:
            self.start_urls = start_urls
        self.css_selector = css_selector or '.item'
    
    async def parse(self, response: Response):
        """Parse a single page."""
        # Extract items using the configured selector
        for item in response.css(self.css_selector):
            yield {
                'url': response.url,
                'text': item.css('::text').get(),
                'html': item.html,
            }
        
        # Follow pagination links (customize selector as needed)
        next_links = response.css('a.next, a.next-page, .pagination a:last-child')
        for link in next_links:
            href = link.attrib.get('href')
            if href:
                yield response.follow(href, callback=self.parse)


def main():
    parser = argparse.ArgumentParser(description='Scrapling Spider Template')
    parser.add_argument('--url', required=True, help='Starting URL')
    parser.add_argument('--selector', default='.item', help='CSS selector for items')
    parser.add_argument('--output', default='output.json', help='Output JSON file')
    parser.add_argument('--crawldir', help='Directory for pause/resume checkpoints')
    parser.add_argument('--concurrency', type=int, default=10, help='Concurrent requests')
    parser.add_argument('--delay', type=float, default=0.5, help='Download delay')
    
    args = parser.parse_args()
    
    # Configure spider
    spider = GenericSpider(
        start_urls=[args.url],
        css_selector=args.selector,
        concurrent_requests=args.concurrency,
        download_delay=args.delay,
        crawldir=args.crawldir
    )
    
    # Run spider
    print(f"Starting spider for {args.url}")
    result = spider.start()
    
    # Export results
    result.items.to_json(args.output)
    print(f"Scraped {len(result.items)} items to {args.output}")


if __name__ == '__main__':
    main()
