#!/usr/bin/env python3
"""
Stealthy Fetcher Template
Fetch web pages while bypassing anti-bot systems like Cloudflare.

Usage:
    python stealthy-fetch.py --url https://protected-site.com --output data.json
"""

import argparse
import json
from scrapling.fetchers import StealthyFetcher


def fetch_page(url, solve_cloudflare=True, headless=True, network_idle=True):
    """Fetch a page using StealthyFetcher."""
    print(f"Fetching {url}...")
    
    page = StealthyFetcher.fetch(
        url,
        headless=headless,
        solve_cloudflare=solve_cloudflare,
        network_idle=network_idle
    )
    
    return page


def main():
    parser = argparse.ArgumentParser(description='Stealthy Web Fetcher')
    parser.add_argument('--url', required=True, help='URL to fetch')
    parser.add_argument('--output', default='output.json', help='Output JSON file')
    parser.add_argument('--selector', help='CSS selector to extract')
    parser.add_argument('--no-cloudflare', action='store_true', 
                       help='Disable Cloudflare solving')
    parser.add_argument('--visible', action='store_true',
                       help='Run browser in visible mode')
    
    args = parser.parse_args()
    
    # Fetch the page
    page = fetch_page(
        args.url,
        solve_cloudflare=not args.nocloudflare,
        headless=not args.visible
    )
    
    # Extract data
    if args.selector:
        items = page.css(args.selector).getall()
        data = {
            'url': args.url,
            'selector': args.selector,
            'count': len(items),
            'items': items
        }
    else:
        data = {
            'url': args.url,
            'title': page.css('title::text').get(),
            'content': page.css('body').html
        }
    
    # Save to file
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {args.output}")
    if 'count' in data:
        print(f"Extracted {data['count']} items")


if __name__ == '__main__':
    main()
