#!/usr/bin/env node
import { fetchPrice } from '../services/keepaService.js';
import { appendLog } from '../services/logService.js';

const [,, asin] = process.argv;
if (!asin) {
  console.error('Usage: node scripts/fetchOne.js <ASIN>');
  process.exit(1);
}

(async () => {
  try {
    const entry = await fetchPrice(asin);
    await appendLog(entry);
    console.log(entry);
  } catch (err) {
    console.error('fetchOne error:', err.message);
    process.exit(1);
  }
})();
