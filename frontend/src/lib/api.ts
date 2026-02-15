import { SearchResponse, CountryCode, CartOptimizationResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function searchProducts(
    query: string,
    postalCode: string,
    country: CountryCode = 'IN'
): Promise<SearchResponse> {
    const params = new URLSearchParams({
        query,
        pincode: postalCode,
        country,
    });

    const response = await fetch(`${API_URL}/search?${params}`);

    if (!response.ok) {
        throw new Error('Search failed');
    }

    return response.json();
}

export async function getCountries(): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_URL}/countries`);
    return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
    const response = await fetch(`${API_URL}/health`);
    return response.json();
}

export async function optimizeCart(
    queries: string[],
    postalCode: string,
    country: CountryCode = 'IN'
): Promise<CartOptimizationResponse> {
    const response = await fetch(`${API_URL}/cart/optimize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries, postal_code: postalCode, country }),
    });

    if (!response.ok) {
        throw new Error('Cart optimization failed');
    }

    return response.json();
}
