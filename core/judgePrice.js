import fs from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('env/.env') });

const { PRICE_THRESHOLD = '10000', ASIN, ZAPIER_WEBHOOK_URL } = process.env;

const PRICE_LOG = path.resolve('logs/price-log.json');

async function judge() {
  const exists = await fs.stat(PRICE_LOG).then(() => true).catch(() => false);
  if (!exists) {
    console.error('price-log.json not found. Run npm run fetch first.');
    process.exit(1);
  }
  const arr = JSON.parse(await fs.readFile(PRICE_LOG, 'utf8'));
  if (arr.length === 0) {
    console.error('price-log.json empty');
    return;
  }
  const latest = arr[arr.length - 1];
  const limit = Number(PRICE_THRESHOLD);
  if (latest.price !== null && latest.price <= limit) {
    console.log(`PRICE_DROP_TRIGGER: ASIN ${ASIN} price ${latest.price} <= threshold ${limit}`);
    // 送信先が設定されていれば Zapier Webhook POST
    if (ZAPIER_WEBHOOK_URL) {
      const payload = {
        asin: ASIN,
        price: latest.price,
        timestamp: new Date(latest.ts ?? Date.now()).toISOString(),
      };
      try {
        const res = await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        console.log(`📨 Zapier 送信: ${res.status}`);
      } catch (err) {
        console.error('⚠️ Zapier 送信エラー:', err.message);
      }
    }
    // ToDo: trigger webhook / generate tweet in future step
  } else {
    console.log(`NO_TRIGGER: price ${latest.price} > threshold ${limit}`);
  }
}

judge().catch(e => {
  console.error(e);
  process.exit(1);
});
