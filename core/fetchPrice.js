import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('env/.env') });

const { KEEPA_API_KEY, ASIN } = process.env;

if (!KEEPA_API_KEY || !ASIN) {
  console.error('KEEPA_API_KEY or ASIN is not set in env/.env');
  process.exit(1);
}

const PRICE_LOG = path.resolve('logs/price-log.json');

async function fetchPrice() {
  const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=jp&buybox=1&buyboxSeller=1&stats=90&buyboxType=BB&history=1&asin=${ASIN}`;
  const { data } = await axios.get(url);
  if (!data || !data.products || data.products.length === 0) throw new Error('No product data');
  const product = data.products[0];
  // Keepa の buyBoxSellerHistory は価格配列（1 単位 = 5 分間隔）なので末尾が最新値
  const latestPrice = Array.isArray(product.buyBoxSellerHistory)
    ? product.buyBoxSellerHistory.at(-1)
    : null;
  const ts = Date.now();
  const logEntry = { ts, price: latestPrice, asin: ASIN };
  await appendLog(logEntry);
  console.log(JSON.stringify(logEntry));
  return logEntry;
}

async function appendLog(entry) {
  try {
    await fs.mkdir(path.dirname(PRICE_LOG), { recursive: true });
    const exists = await fs.stat(PRICE_LOG).then(() => true).catch(() => false);
    const arr = exists ? JSON.parse(await fs.readFile(PRICE_LOG, 'utf8')) : [];
    arr.push(entry);
    await fs.writeFile(PRICE_LOG, JSON.stringify(arr, null, 2));
  } catch (e) {
    console.error('Failed to write price log', e);
  }
}

fetchPrice().catch(e => {
  console.error(e);
  process.exit(1);
});
