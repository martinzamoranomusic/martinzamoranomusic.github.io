import asyncio
import re

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("https://www.martinzamorano.com/musik", wait_until="networkidle")
        content = await page.content()
        with open("debug_page.html", "w") as f:
            f.write(content)
        await browser.close()

    html = open("debug_page.html").read()
    soup = BeautifulSoup(html, "html.parser")

    # main content
    main = soup.find(class_="l-main-content")
    if main:
        print("=== MAIN CONTENT ===")
        print(main.get_text("\n", strip=True)[:4000])
    else:
        print("NO .l-main-content, trying body text")
        print(soup.body.get_text("\n", strip=True)[:4000])

    # background images
    bg = re.findall(r'url\(["\']?(https?://[^)"\' ]+)["\']?\)', html)
    print("\n=== BACKGROUND IMAGES ===")
    for b in set(bg):
        print(b)

    # youtube
    yt = re.findall(r'youtube(?:-nocookie)?\.com/embed/([^?/"]+)', html)
    print("\n=== YOUTUBE IDs ===", yt)

    # all images
    imgs = [img.get("src", "") for img in soup.find_all("img") if img.get("src")]
    print("\n=== IMG SRCS ===")
    for i in imgs[:20]:
        print(i)


asyncio.run(main())
