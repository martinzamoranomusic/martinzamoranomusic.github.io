import asyncio
import re

from playwright.async_api import async_playwright

pages_to_check = [
    ("healing", "https://www.martinzamorano.com/healing"),
    ("zamoranoandstamer", "https://www.martinzamorano.com/zamoranoandstamer"),
    ("mental-pocus-records", "https://www.martinzamorano.com/mental-pocus-records"),
    ("musiktheorie", "https://www.martinzamorano.com/musiktheorie"),
    ("transcriptions", "https://www.martinzamorano.com/transcriptions"),
    ("kontakt", "https://www.martinzamorano.com/kontakt"),
]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, url in pages_to_check:
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(1500)
            html = await page.content()
            bg = re.findall(r"background-image: url\(&quot;(https?://[^&]+)&quot;\)", html)
            print(f"{name}: {bg}")
            await page.close()
        await browser.close()


asyncio.run(main())
