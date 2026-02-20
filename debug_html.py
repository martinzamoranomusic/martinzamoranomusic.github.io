#!/usr/bin/env python3
"""
debug_html.py — Dump the fully-rendered HTML of one page to inspect structure.
Usage:  python debug_html.py [url]
"""
import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.martinzamorano.com/vita"


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
        )
        await page.goto(URL, wait_until="networkidle", timeout=30_000)
        await page.wait_for_timeout(3000)
        html = await page.content()
        out = Path("debug_page.html")
        out.write_text(html, encoding="utf-8")
        print(f"Written {len(html)} bytes to {out}")
        # Also print all class names found
        classes = await page.eval_on_selector_all("[class]", "els => els.map(e => e.className)")
        unique = sorted(set(" ".join(classes).split()))
        print("\nUnique CSS classes found:")
        for c in unique[:80]:
            print(" ", c)
        await browser.close()


asyncio.run(main())
