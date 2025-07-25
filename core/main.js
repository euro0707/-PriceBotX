import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import '../config/loadEnv.js';

import { ASIN_LIST_PATH } from '../utils/config.js';
import { fetchPrice } from '../services/keepaService.js';
import { appendLog } from '../services/logService.js';
import { isTrigger, notifyAll } from '../services/judgeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const asinList = JSON.parse(await fs.readFile(ASIN_LIST_PATH, 'utf8'));

  for (const { asin, title, desiredPrice, threshold: legacyThreshold } of asinList) {
    const threshold = desiredPrice ?? legacyThreshold;
    let entry;
    try {
      entry = await fetchPrice(asin); // { asin, price, timestamp }
    } catch (err) {
      console.error(`fetchPrice failed for ${asin}:`, err.message);
      continue;
    }

    await appendLog({ ...entry, title });

    if (threshold !== undefined && isTrigger(entry.price, threshold)) {
      console.log(`PRICE_DROP_TRIGGER: ${title} (${entry.price} <= ${threshold})`);
      await notifyAll({ asin, title, price: entry.price, timestamp: entry.timestamp, threshold });
    } else if (threshold !== undefined) {
      console.log(`NO_TRIGGER: ${title} (${entry.price} > ${threshold})`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('main.js')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
