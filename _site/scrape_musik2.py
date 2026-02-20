#!/usr/bin/env python3
import asyncio
import re
import sys

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

URL = "https://www.martinzamorano.com/musik"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        # extra wait for dynamic content
        await page.wait_for_timeout(5000)
        content = await page.content()
        with open("debug_musik.html", "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Saved {len(content)} bytes to debug_musik.html")
        await browser.close()

    html = open("debug_musik.html", encoding="utf-8").read()
    soup = BeautifulSoup(html, "html.parser")

    # Try multiple content selectors
    for sel in ["l-main-content", "ce-text", "frame-content", "col-container"]:
        el = soup.find(class_=sel)
        if el and el.get_text(strip=True):
            print(f"\n=== {sel} ===")
            print(el.get_text("\n", strip=True)[:3000])

    # All text paragraphs
    print("\n=== ALL PARAGRAPHS ===")
    for p in soup.find_all(["p", "h1", "h2", "h3", "h4"]):
        t = p.get_text(strip=True)
        if t and len(t) > 10:
            print(repr(t))

    # Background images in style attrs
    bg_urls = set()
    for tag in soup.find_all(True):
        style = tag.get("style", "")
        matches = re.findall(r'url\(["\']?(https?://[^)"\']+)["\']?\)', style)
        bg_urls.update(matches)
    # Also in raw HTML
    bg_raw = re.findall(r"background-image:\s*url\(&quot;(https?://[^&]+)&quot;\)", html)
    bg_urls.update(bg_raw)
    print("\n=== BACKGROUND IMAGES ===")
    for b in bg_urls:
        print(b)

    # YouTube
    yt = re.findall(r'youtube(?:-nocookie)?\.com/embed/([^?/"&]+)', html)
    print("\n=== YOUTUBE IDs ===", list(set(yt)))

    # Images
    imgs = [(i.get("src", ""), i.get("alt", "")) for i in soup.find_all("img") if i.get("src")]
    print("\n=== IMAGES ===")
    for src, alt in imgs[:30]:
        print(f"  {alt!r}: {src}")


asyncio.run(main())
