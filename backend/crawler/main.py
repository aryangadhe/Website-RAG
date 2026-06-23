import asyncio
import sys
import json
import re
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from urllib.parse import urlparse

def clean_content(markdown: str) -> str:
    markdown = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', markdown)
    markdown = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', '', markdown)
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    markdown = re.sub(r'[ \t]+', ' ', markdown)
    return markdown.strip()

async def crawl(url, max_pages=30):
    results = []
    visited = set()
    base_domain = urlparse(url).netloc

    browser_config = BrowserConfig(headless=True, verbose=False, text_mode=True)
    run_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, exclude_all_images=True)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        urls_to_crawl = [url]

        while urls_to_crawl and len(visited) < max_pages:
            batch = []
            while urls_to_crawl and len(batch) < 3:
                next_url = urls_to_crawl.pop(0)
                if next_url not in visited:
                    batch.append(next_url)
                    visited.add(next_url)

            if not batch:
                break

            # run batch in parallel
            tasks = [crawler.arun(url=u, config=run_config) for u in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for i, result in enumerate(batch_results):
                current_url = batch[i]

                if isinstance(result, Exception):
                    print(f"Error crawling {current_url}: {result}", file=sys.stderr)
                    continue

                if result.success and result.markdown:
                    cleaned = clean_content(result.markdown)

                    if len(cleaned) > 100:
                        results.append({
                            "url": current_url,
                            "content": cleaned
                        })

                    # discover new links
                    if result.links:
                        excluded_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.xml', '.json']
                        internal_links = []
                        for link in result.links.get("internal", []):
                            href = link.get("href")
                            if not href or not href.startswith("http"):
                                continue
                            
                            # strip fragment (e.g., #section) to get base URL
                            base_href = href.split('#')[0]
                            parsed_href = urlparse(base_href)
                            
                            # check if same domain and not visited
                            if parsed_href.netloc == base_domain and base_href not in visited:
                                # check for media/doc extensions case-insensitively
                                path_lower = parsed_href.path.lower()
                                if not any(path_lower.endswith(ext) or ext in path_lower for ext in excluded_extensions):
                                    if base_href not in internal_links:
                                        internal_links.append(base_href)
                        
                        # add all discovered links to queue
                        for link in internal_links:
                            if link not in urls_to_crawl:
                                urls_to_crawl.append(link)

    return results

if __name__ == "__main__":
    url = sys.argv[1]
    max_pages = int(sys.argv[2]) if len(sys.argv) > 2 else 50

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    results = asyncio.run(crawl(url, max_pages))
    print(json.dumps({ "pages": results, "total_pages": len(results) }))