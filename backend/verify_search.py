import httpx
import json
import asyncio

async def test():
    url = "http://localhost:8000/search"
    params = {
        "query": "Bella Vita Luxury CEO MEN Long Lasting Perfume | Perfume for Man | EDP 100ml | Lemor",
        "pincode": "411037",
        "country": "IN"
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(url, params=params)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            print(f"Groups: {len(r.json()['product_groups'])}")
        else:
            print(f"Error: {r.text}")

if __name__ == "__main__":
    asyncio.run(test())
