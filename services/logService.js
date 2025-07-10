import fs from 'fs/promises';
import path from 'path';
import { PRICE_LOG_PATH, LOGS_DIR, MAX_LOG_SIZE } from '../utils/config.js';
import { ensureDir } from '../utils/helpers.js';

/**
 * Rotate the main price log if it exceeds MAX_LOG_SIZE.
 * The rotated file will be renamed with an ISO timestamp suffix.
 */
export async function rotateLog() {
  await ensureDir(LOGS_DIR);
  const stat = await fs.stat(PRICE_LOG_PATH).catch(() => null);
  if (stat && stat.size > MAX_LOG_SIZE) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const rotated = PRICE_LOG_PATH.replace('price-log', `price-log-${ts}`);
    await fs.rename(PRICE_LOG_PATH, rotated);
    console.log(`🔁 ログをローテーション: ${rotated}`);
  }
}

/**
 * Append a price entry to both (1) product-nested main log and (2) daily log file.
 * Handles migration from old array format automatically.
 * @param {{asin:string, price:number|null, timestamp:string}} entry
 */
export async function appendLog(entry) {
  const { asin, price, timestamp } = entry;
  await ensureDir(LOGS_DIR);
  await rotateLog();

  // 1. Main log (product-nested)
  let data;
  try {
    data = JSON.parse(await fs.readFile(PRICE_LOG_PATH, 'utf8'));
  } catch {
    data = {};
  }

  // migrate array -> nested object
  if (Array.isArray(data)) {
    const migrated = {};
    for (const rec of data) {
      const a = rec.asin;
      if (!migrated[a]) migrated[a] = [];
      migrated[a].push({ price: rec.price, timestamp: rec.timestamp });
    }
    data = migrated;
  }

  if (!data[asin]) data[asin] = [];
  data[asin].push({ price, timestamp });
  await fs.writeFile(PRICE_LOG_PATH, JSON.stringify(data, null, 2));

  // 2. Daily log (YYYY-MM-DD.json)
  const today = timestamp.slice(0, 10);
  const dailyPath = path.join(LOGS_DIR, `${today}.json`);
  let dailyArr = [];
  try {
    dailyArr = JSON.parse(await fs.readFile(dailyPath, 'utf8'));
    if (!Array.isArray(dailyArr)) dailyArr = [];
  } catch {}

  dailyArr.push(entry);
  await fs.writeFile(dailyPath, JSON.stringify(dailyArr, null, 2));
  console.log(`🗂 日別ログも保存: ${dailyPath}`);
}
