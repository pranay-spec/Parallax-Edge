"""
Product Matcher Utility
Uses thefuzz for fuzzy string matching to group identical products
with different titles across platforms.
"""
from rapidfuzz import fuzz, process
from typing import List, Tuple, Dict, Optional
import re


def normalize_product_title(title: str) -> str:
    """
    Normalize product title for better matching.
    Removes common noise words, extra spaces, and standardizes format.
    """
    # Convert to lowercase
    title = title.lower()
    
    # Remove common noise patterns
    noise_patterns = [
        r'\(pack of \d+\)',
        r'\[\d+\s*(ml|g|kg|l|gm|gram|litre|liter)\]',
        r'(?:free|combo|offer|deal|sale)',
        r'(?:limited|edition|new|latest)',
        r'[-–—]',
        r'\s+',
    ]
    
    for pattern in noise_patterns[:-1]:
        title = re.sub(pattern, ' ', title, flags=re.IGNORECASE)
    
    # Normalize whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    
    return title


def extract_product_attributes(title: str) -> Dict[str, Optional[str]]:
    """
    Extract key attributes from product title.
    Helps in matching products with different title formats.
    """
    attributes = {
        'brand': None,
        'quantity': None,
        'unit': None,
    }
    
    # Normalize units map
    unit_map = {
        'gm': 'g', 'gram': 'g', 'kgs': 'kg', 'liter': 'l', 'litre': 'l',
        'ml': 'ml', 'pcs': 'pcs', 'pack': 'pack'
    }

    # 1. Handle "Pack of X" specifically
    pack_match = re.search(r'pack of\s*(\d+)', title, re.IGNORECASE)
    if pack_match:
        attributes['quantity'] = pack_match.group(1)
        attributes['unit'] = 'pack'
    else:
        # 2. Extract standard quantity and unit (e.g., "500ml", "1kg", "250g")
        quantity_match = re.search(r'(\d+\.?\d*)\s*(ml|g|kg|l|gm|gram|litre|liter|pcs|pack)', title, re.IGNORECASE)
        if quantity_match:
            qty = quantity_match.group(1)
            unit = quantity_match.group(2).lower()
            attributes['quantity'] = qty
            attributes['unit'] = unit_map.get(unit, unit)
    
    # First word is often the brand
    words = title.split()
    if words:
        attributes['brand'] = words[0].capitalize()
    
    return attributes


def calculate_match_score(title1: str, title2: str) -> int:
    """
    Calculate comprehensive match score between two product titles.
    Uses multiple fuzzy matching algorithms for accuracy.
    
    Returns:
        Match score from 0-100
    """
    # Normalize titles
    norm1 = normalize_product_title(title1)
    norm2 = normalize_product_title(title2)
    
    # Extract attributes for constraint checking
    attrs1 = extract_product_attributes(title1)
    attrs2 = extract_product_attributes(title2)
    
    # CRITICAL CONSTRAINT: If both have quantity/unit, they MUST match exactly
    if attrs1['quantity'] and attrs2['quantity']:
        # If units differ (e.g. ml vs g), it's a mismatch (unless conversion logic exists, mostly no)
        if attrs1['unit'] != attrs2['unit']:
            return 0
        
        # If quantities differ (e.g. 500 vs 1000)
        try:
            q1 = float(attrs1['quantity'])
            q2 = float(attrs2['quantity'])
            if q1 != q2:
                return 0
        except ValueError:
            if attrs1['quantity'] != attrs2['quantity']:
                return 0
    
    # Calculate multiple matching scores
    ratio = fuzz.ratio(norm1, norm2)
    partial_ratio = fuzz.partial_ratio(norm1, norm2)
    token_sort = fuzz.token_sort_ratio(norm1, norm2)
    token_set = fuzz.token_set_ratio(norm1, norm2)
    
    # Weighted average (token_set_ratio works best for product titles)
    weighted_score = (
        ratio * 0.15 +
        partial_ratio * 0.20 +
        token_sort * 0.25 +
        token_set * 0.40
    )
    
    # Boost score if key attributes match
    boost = 0
    if attrs1['brand'] and attrs2['brand'] and attrs1['brand'].lower() == attrs2['brand'].lower():
        boost += 5
    if attrs1['quantity'] and attrs2['quantity'] and attrs1['quantity'] == attrs2['quantity']:
        boost += 5
    
    final_score = min(100, weighted_score + boost)
    
    return int(final_score)


def find_best_match(query: str, candidates: List[str], threshold: int = 70) -> Optional[Tuple[str, int]]:
    """
    Find the best matching product title from a list of candidates.
    
    Args:
        query: The product title to match
        candidates: List of candidate product titles
        threshold: Minimum score to consider a match (0-100)
    
    Returns:
        Tuple of (best_match, score) or None if no match above threshold
    """
    if not candidates:
        return None
    
    norm_query = normalize_product_title(query)
    
    # Use process.extractOne for efficiency
    result = process.extractOne(
        norm_query,
        [normalize_product_title(c) for c in candidates],
        scorer=fuzz.token_set_ratio
    )
    
    if result and result[1] >= threshold:
        # Find the original (non-normalized) candidate
        index = [normalize_product_title(c) for c in candidates].index(result[0])
        return (candidates[index], result[1])
    
    return None


def group_similar_products(titles: List[str], threshold: int = 75) -> List[List[int]]:
    """
    Group similar products together based on fuzzy title matching.
    
    Args:
        titles: List of product titles (strings)
        threshold: Minimum score to consider products as same (0-100)
    
    Returns:
        List of index groups, where each group contains indices of similar products
    """
    if not titles:
        return []
    
    groups: List[List[int]] = []
    used = set()
    
    for i, title in enumerate(titles):
        if i in used:
            continue
        
        # Start a new group with this product index
        group = [i]
        used.add(i)
        
        # Find all matching products
        for j, other_title in enumerate(titles):
            if j in used:
                continue
            
            score = calculate_match_score(title, other_title)
            
            if score >= threshold:
                group.append(j)
                used.add(j)
        
        groups.append(group)
    
    return groups


def get_canonical_title(titles: List[str]) -> str:
    """
    Generate a canonical title from a list of product titles.
    Typically picks the most informative/complete title.
    """
    if not titles:
        return ""
    
    if len(titles) == 1:
        return titles[0]
    
    # Pick the title with the most words (usually most descriptive)
    return max(titles, key=lambda t: len(t.split()))


# Example usage and testing
if __name__ == "__main__":
    # Test cases
    test_products = [
        "Amul Butter 500g",
        "AMUL Butter - 500 Grams",
        "Amul Pasteurized Butter 500gm",
        "Mother Dairy Butter 500g",
        "Britannia Bread 400g",
        "Britannia White Bread - 400 Grams",
    ]
    
    print("Testing Product Matcher\n" + "="*50)
    
    # Test score calculation
    print("\nMatch Scores:")
    print(f"Amul vs AMUL: {calculate_match_score(test_products[0], test_products[1])}")
    print(f"Amul vs Mother Dairy: {calculate_match_score(test_products[0], test_products[3])}")
    print(f"Britannia vs Britannia: {calculate_match_score(test_products[4], test_products[5])}")
    
    # Test grouping
    print("\nGrouped Products:")
    products_dicts = [{"title": t, "id": i} for i, t in enumerate(test_products)]
    groups = group_similar_products(products_dicts)
    
    for idx, group in enumerate(groups):
        print(f"\nGroup {idx + 1}:")
        for p in group:
            print(f"  - {p['title']}")
