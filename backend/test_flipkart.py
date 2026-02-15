
import asyncio
import httpx
from bs4 import BeautifulSoup
import sys

async def test_scrape(query):
    search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.select("div[data-id]") 
        
        with open("flipkart_card_dump.html", "w", encoding="utf-8") as f:
            f.write(f"<!-- Scraping: {search_url} -->\n")
            f.write(f"<!-- Found {len(cards)} data-id cards -->\n")
            if cards:
                f.write("<!-- First card HTML dump: -->\n")
                f.write(cards[0].prettify())

if __name__ == "__main__":
    asyncio.run(test_scrape("laptop"))
