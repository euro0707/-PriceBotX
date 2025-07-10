#!/usr/bin/env node
import { fetchPrice } from '../services/keepaService.js';
import { isTrigger, notifyAll } from '../services/judgeService.js';

const [,, asin, thresholdStr] = process.argv;
if (!asin || !thresholdStr) {
  console.error('Usage: node scripts/judgeOne.js <ASIN> <THRESHOLD>');
  process.exit(1);
}
const threshold = Number(thresholdStr);
if (Number.isNaN(threshold)) {
  console.error('THRESHOLD must be a number');
  process.exit(1);
}

(async () => {
  try {
    const entry = await fetchPrice(asin);
    console.log('Current:', entry);
    if (isTrigger(entry.price, threshold)) {
      console.log('PRICE_DROP_TRIGGER');
      await notifyAll({ ...entry, threshold });
    } else {
      console.log('NO_TRIGGER');
    }
  } catch (err) {
    console.error('judgeOne error:', err.message);
    process.exit(1);
  }
})();
