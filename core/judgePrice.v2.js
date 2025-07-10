import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import '../config/loadEnv.js';
import { fetchPrice } from './fetchPrice.js';

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASIN_LIST_FILE = path.resolve(__dirname, '../asin-list.json');
const PRICE_LOG_FILE = path.resolve(__dirname, '../logs/price-log.json');
const { ZAPIER_WEBHOOK_URL } = process.env;

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function judge() {
  // 1. Load watched ASIN list
  const asinList = JSON.parse(await fs.readFile(ASIN_LIST_FILE, 'utf8'));

  // 2. Prepare log storage
  await ensureDir(PRICE_LOG_FILE);
  const logArray = await fs.readFile(PRICE_LOG_FILE)
    .then(buf => JSON.parse(buf))
    .catch(() => []);

  // 3. Loop each product
  for (const { asin, title, threshold } of asinList) {
    let entry;
    try {
      entry = await fetchPrice(asin); // { ts, price, asin }
    } catch (err) {
      console.error(`fetchPrice failed for ${asin}:`, err.message);
      continue;
    }

    const price = entry.price;
    const log = { asin, title, price, timestamp: new Date().toISOString() };
    logArray.push(log);

    if (price !== null && price <= threshold) {
      console.log(`PRICE_DROP_TRIGGER: ${title} (${price} <= ${threshold})`);
      if (ZAPIER_WEBHOOK_URL) {
        try {
          const res = await fetch(ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
          });
          console.log(`📨 Zapier 送信: ${res.status}`);
        } catch (err) {
          console.error('⚠️ Zapier 送信エラー:', err.message);
        }
      }
    } else {
      console.log(`NO_TRIGGER: ${title} (${price} > ${threshold})`);
    }
  }

  // 4. Save accumulated log
  await fs.writeFile(PRICE_LOG_FILE, JSON.stringify(logArray, null, 2));
}

// Allow CLI execution: `node core/judgePrice.v2.js`
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('judgePrice.v2.js')) {
  judge().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
