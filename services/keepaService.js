import axios from 'axios';
import '../config/loadEnv.js';
import { sleep } from '../utils/helpers.js';

const KEEPA_API_KEY = process.env.KEEPA_API_KEY;
const KEEP_DOMAIN = 'jp';

const BASE_URL = 'https://api.keepa.com/product';

/**
 * Axios GET with retry.
 * @param {string} url
 * @param {number} retries
 * @param {number} delayMs
 */
export async function fetchWithRetry(url, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 5000 });
      return res.data;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Retry ${attempt}/${retries} failed: ${err.message}`);
      await sleep(delayMs);
    }
  }
}

/**
 * Fetch current price for an ASIN. Returns { asin, price, timestamp }
 * price will be null if not found.
 * @param {string} asin
 */
export async function fetchPrice(asin) {
  if (!KEEPA_API_KEY) throw new Error('KEEPA_API_KEY is not set');
  const url = `${BASE_URL}?key=${KEEPA_API_KEY}&domain=${KEEP_DOMAIN}&buybox=1&buyboxSeller=1&stats=90&buyboxType=BB&history=1&asin=${asin}`;
  const data = await fetchWithRetry(url);
  // quick parse – use last price value if available
  const product = data.products?.[0];
  const priceCents = product?.buyBoxPriceHistory?.slice(-1)[0];
  const price = typeof priceCents === 'number' && priceCents > 0 ? Math.round(priceCents / 100) : null;
  return { asin, price, timestamp: new Date().toISOString() };
}

/**
 * Fetch product details for an ASIN.
 * Returns { asin, title, imageUrl, currentPrice }
 * currentPrice is in JPY (integer) or null.
 * @param {string} asin
 */
export async function fetchProduct(asin) {
  if (!KEEPA_API_KEY) throw new Error('KEEPA_API_KEY is not set');
  const url = `${BASE_URL}?key=${KEEPA_API_KEY}&domain=${KEEP_DOMAIN}&asin=${asin}`;
  const data = await fetchWithRetry(url);
  const product = data.products?.[0];
  if (!product) return null;

  const currentCents = product.stats?.current?.price ?? null;
  return {
    asin,
    title: product.title ?? null,
    imageUrl: product.imagesCSV?.split(',')[0] ?? null,
    currentPrice: typeof currentCents === 'number' && currentCents > 0 ? Math.round(currentCents / 100) : null,
  };
}
