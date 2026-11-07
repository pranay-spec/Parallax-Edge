import asyncio
import httpx
from bs4 import BeautifulSoup
import json

async def test_bigbasket():
    # Simplify query
    query = "Campus Running Shoes" 
    search_url = f"https://www.bigbasket.com/ps/?q={query.replace(' ', '+')}"
    print(f"Scraping: {search_url}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(search_url, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check for grid items
            items = soup.select('li[class*="PaginateItems___StyledLi"]')
            print(f"Found {len(items)} items via StyledLi")
            
            # Print titles if any
            for item in items[:3]:
                print(item.get_text()[:50])

            # Check via JSON data
            scripts = soup.find_all('script', {'id': '__NEXT_DATA__'})
            if scripts:
                print("Found __NEXT_DATA__ script")
                try:
                    data = json.loads(scripts[0].string)
                    products = data.get('props', {}).get('pageProps', {}).get('initialState', {}).get('search', {}).get('products', {}).get('prods', [])
                    print(f"Found {len(products)} products in JSON data")
                    for p in products[:3]:
                         print(f" - {p.get('desc')}")
                except:
                    print("Error parsing JSON")

if __name__ == "__main__":
    asyncio.run(test_bigbasket())
