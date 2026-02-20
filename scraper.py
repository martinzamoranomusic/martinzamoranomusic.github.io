#!/usr/bin/env python3
"""
scraper.py — Website scraper for martinzamorano.com
----------------------------------------------------
Phase 1: Crawl the site, save each page as a Markdown file,
         and download all images into assets/.

Usage:
    python scraper.py

Output layout:
    scraped/
        index.md
        impressum.md
        datenschutz.md
        ...
        assets/
            image1.jpg
            image2.png
            ...
        _site_map.md   ← summary of all pages found
"""

import asyncio
import re
import sys
import time
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
from playwright.async_api import async_playwright

# ── Config ────────────────────────────────────────────────────────────────────
ENTRY_POINT = "https://www.martinzamorano.com/home"
BASE_DOMAIN = "martinzamorano.com"
OUTPUT_DIR = Path("scraped")
ASSETS_DIR = OUTPUT_DIR / "assets"
MAX_PAGES = 50  # safety cap
WAIT_MS = 3000  # ms to wait for JS to settle after navigation
REQUEST_DELAY = 0.8  # seconds between page loads (be polite)
# ──────────────────────────────────────────────────────────────────────────────


def slugify(url: str) -> str:
    """Turn a URL into a safe filename slug."""
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.strip("/") or "index"
    slug = re.sub(r"[^a-zA-Z0-9_\-]", "_", path)
    slug = re.sub(r"_+", "_", slug).strip("_") or "index"
    return slug


def is_internal(url: str) -> bool:
    """Return True if the URL belongs to the target domain."""
    try:
        return BASE_DOMAIN in urllib.parse.urlparse(url).netloc
    except Exception:
        return False


def normalise(url: str, base: str) -> str | None:
    """Resolve relative URLs and strip fragments/query-strings."""
    try:
        full = urllib.parse.urljoin(base, url)
        p = urllib.parse.urlparse(full)
        # Keep only scheme + netloc + path
        clean = urllib.parse.urlunparse((p.scheme, p.netloc, p.path, "", "", ""))
        return clean if p.scheme in ("http", "https") else None
    except Exception:
        return None


def download_image(img_url: str, assets_dir: Path) -> str | None:
    """
    Download an image and return the local relative path,
    or None on failure.
    """
    try:
        parsed = urllib.parse.urlparse(img_url)
        filename = Path(parsed.path).name
        if not filename:
            return None
        # Avoid duplicate names from different paths
        safe_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", filename)
        local = assets_dir / safe_name

        if not local.exists():
            resp = requests.get(img_url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
            local.write_bytes(resp.content)
            print(f"    📥 image  {safe_name}")

        return f"assets/{safe_name}"
    except Exception as e:
        print(f"    ⚠️  Could not download {img_url}: {e}")
        return None


def html_to_markdown(html: str, page_url: str, assets_dir: Path) -> tuple[str, list[str]]:
    """
    Convert HTML to Markdown.
    - Rewrites <img src> to local paths (and downloads them).
    - Returns (markdown_text, list_of_internal_links_found).
    """
    soup = BeautifulSoup(html, "html.parser")

    # ── Collect internal links ────────────────────────────────────────────────
    internal_links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = normalise(a["href"], page_url)
        if href and is_internal(href):
            internal_links.append(href)

    # ── Download images and rewrite src ──────────────────────────────────────
    for img in soup.find_all("img", src=True):
        src = normalise(img["src"], page_url)
        if src:
            local = download_image(src, assets_dir)
            if local:
                img["src"] = local

    # ── Convert to Markdown ───────────────────────────────────────────────────
    # Work on the most specific content container available.
    # musikerseiten.de CMS uses .l-main-content / .main-content
    target = (
        soup.select_one(".l-main-content")
        or soup.select_one(".main-content")
        or soup.select_one(".contentWrap")
        or soup.find("main")
        or soup.find("article")
        or soup.find(id=re.compile(r"content|main", re.I))
        or soup.body
        or soup
    )

    markdown = md(
        str(target),
        heading_style="ATX",
        bullets="-",
        strip=["script", "style", "nav", "footer", "header"],
    )

    # Clean up excessive blank lines
    markdown = re.sub(r"\n{3,}", "\n\n", markdown).strip()

    return markdown, internal_links


async def scrape() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    ASSETS_DIR.mkdir(exist_ok=True)

    visited: set[str] = set()
    queue: list[str] = [ENTRY_POINT]
    site_map: list[dict] = []  # [{url, slug, title}]

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        while queue and len(visited) < MAX_PAGES:
            url = queue.pop(0)

            if url in visited:
                continue
            visited.add(url)

            slug = slugify(url)
            md_path = OUTPUT_DIR / f"{slug}.md"

            print(f"\n🔍 [{len(visited)}/{MAX_PAGES}] {url}")
            print(f"   → {md_path}")

            try:
                await page.goto(url, wait_until="networkidle", timeout=30_000)
                # Wait for common content selectors to appear (JS-rendered CMS)
                for selector in [
                    ".l-main-content",
                    ".main-content",
                    ".contentWrap",
                    "main",
                    ".content",
                    "#content",
                    "article",
                    "section",
                    "p",
                ]:
                    try:
                        await page.wait_for_selector(selector, timeout=5_000)
                        break
                    except Exception:
                        continue
                # Extra settle time for late-loading JS content
                await page.wait_for_timeout(WAIT_MS)
            except Exception as e:
                print(f"   ❌ Navigation failed: {e}")
                continue

            # Page title
            title = await page.title()

            # Full rendered HTML
            html = await page.content()

            # Convert to Markdown + collect links + download images
            markdown, found_links = html_to_markdown(html, url, ASSETS_DIR)

            # Add a front-matter header
            front_matter = (
                f"---\n"
                f"url: {url}\n"
                f"title: {title}\n"
                f"scraped: {time.strftime('%Y-%m-%d')}\n"
                f"---\n\n"
            )
            md_path.write_text(front_matter + markdown, encoding="utf-8")
            print(f"   ✅ Saved  ({len(markdown)} chars)")

            site_map.append({"url": url, "slug": slug, "title": title})

            # Enqueue new internal links
            for link in found_links:
                if link not in visited and link not in queue:
                    queue.append(link)
                    print(f"   ➕ queued  {link}")

            time.sleep(REQUEST_DELAY)

        await browser.close()

    # ── Write site map ────────────────────────────────────────────────────────
    sm_lines = ["# Site Map\n", f"Scraped: {time.strftime('%Y-%m-%d %H:%M')}\n\n"]
    for entry in site_map:
        sm_lines.append(f"- [{entry['title'] or entry['slug']}]({entry['slug']}.md)  \n")
        sm_lines.append(f"  Source: {entry['url']}\n")
    (OUTPUT_DIR / "_site_map.md").write_text("".join(sm_lines), encoding="utf-8")

    print(f"\n\n{'='*60}")
    print(f"✅ Done!  {len(site_map)} pages scraped.")
    print(f"   Output : {OUTPUT_DIR.resolve()}")
    print(f"   Assets : {ASSETS_DIR.resolve()}")
    print(f"   Map    : {(OUTPUT_DIR / '_site_map.md').resolve()}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(scrape())
