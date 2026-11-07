import json
import time
import random
import asyncio
from app.database import init_db, get_db
from app.scrapers import scrape_all_platforms
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ETL_PIPELINE")

def extract():
    """Extract raw data from live web scrapers into the staging layer."""
    logger.info("Starting Extract Phase...")
    try:
        raw_data = asyncio.run(scrape_all_platforms("laptop", "560102"))
    except Exception as e:
        logger.error(f"Scraper error in ETL pipeline: {e}")
        raw_data = []
    
    with get_db() as conn:
        cursor = conn.cursor()
        for item in raw_data:
            cursor.execute('''
                INSERT INTO staging_scrapes (raw_json, source_platform)
                VALUES (?, ?)
            ''', (json.dumps(item.dict() if hasattr(item, 'dict') else str(item)), getattr(item, 'platform', 'unknown')))
        conn.commit()
    logger.info(f"Extracted {len(raw_data)} items to staging.")
    return len(raw_data)

def transform_and_load():
    """Process staging data, validate, deduplicate, and load to warehouse."""
    logger.info("Starting Transform & Load Phase...")
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get unprocessed staging records
        cursor.execute("SELECT id, raw_json, source_platform FROM staging_scrapes WHERE processed = FALSE")
        rows = cursor.fetchall()
        
        processed_count = 0
        duplicate_count = 0
        error_count = 0
        
        for row in rows:
            staging_id = row['id']
            try:
                data = json.loads(row['raw_json'])
                
                # Data Quality Checks (Validation)
                if not data.get('id') or not data.get('title') or data.get('price') is None:
                    error_count += 1
                    continue
                
                # Deduplication / Upsert (Incremental Load)
                cursor.execute("SELECT id FROM warehouse_products WHERE id = ?", (data['id'],))
                exists = cursor.fetchone()
                
                if exists:
                    duplicate_count += 1
                    cursor.execute('''
                        UPDATE warehouse_products 
                        SET price = ?, in_stock = ?, last_updated = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (
                        data.get('price_breakdown', {}).get('total_landed_cost', data['price']),
                        True,
                        data['id']
                    ))
                else:
                    cursor.execute('''
                        INSERT INTO warehouse_products (id, title, platform, price, url, image_url, in_stock)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        data['id'], data['title'], data['platform'],
                        data.get('price_breakdown', {}).get('total_landed_cost', data['price']),
                        data.get('url', ''), data.get('image_url', ''), True
                    ))
                
                # Mark as processed
                cursor.execute("UPDATE staging_scrapes SET processed = TRUE WHERE id = ?", (staging_id,))
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing row {staging_id}: {e}")
                error_count += 1
                
        conn.commit()
    
    logger.info(f"Transform/Load Complete: {processed_count} processed, {duplicate_count} updated/dupes, {error_count} rejected.")
    return processed_count, error_count

def log_metrics(items_scraped, success_rate, latency):
    """Log ETL metrics for the monitoring dashboard."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scrape_metrics (platform, items_scraped, success_rate, latency_ms)
            VALUES (?, ?, ?, ?)
        ''', ("System-Wide", items_scraped, success_rate, latency))
        conn.commit()

def run_etl_job():
    """Execute the full ETL pipeline."""
    init_db()
    
    start_time = time.time()
    extracted = extract()
    
    # Simulate processing delay
    time.sleep(random.uniform(0.5, 1.5))
    
    processed, errors = transform_and_load()
    
    latency = int((time.time() - start_time) * 1000)
    success_rate = (processed / extracted) * 100 if extracted > 0 else 0
    
    log_metrics(extracted, success_rate, latency)
    logger.info(f"ETL Job completed in {latency}ms with {success_rate:.1f}% success rate.")

if __name__ == "__main__":
    run_etl_job()
