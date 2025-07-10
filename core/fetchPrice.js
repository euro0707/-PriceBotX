import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import '../config/loadEnv.js';

const { KEEPA_API_KEY } = process.env;

if (!KEEPA_API_KEY) {
  console.error('KEEPA_API_KEY or ASIN is not set in env/.env');
  process.exit(1);
}

const PRICE_LOG = path.resolve('logs/price-log.json');
const ASIN_LIST_PATH = path.resolve('asin-list.json');

// ----- utility constants & helpers -----
const MAX_SIZE = 1_000_000; // 1 MB
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function fetchWithRetry(url, retries=3, delay=1500){
  for(let i=0;i<=retries;i++){
    try{
      const { data } = await axios.get(url);
      return data;
    }catch(err){
      console.warn(`Retry ${i+1}/${retries} failed: ${err.message}`);
      if(i<retries) await sleep(delay);
      else throw err;
    }
  }
}


export async function fetchPrice(asin) {
    const url = `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=jp&buybox=1&buyboxSeller=1&stats=90&buyboxType=BB&history=1&asin=${asin}`;
  const data = await fetchWithRetry(url);
  if (!data || !data.products || data.products.length === 0) throw new Error('No product data');
  const product = data.products[0];
  // Keepa の buyBoxSellerHistory は価格配列（1 単位 = 5 分間隔）なので末尾が最新値
  const latestPrice = Array.isArray(product.buyBoxSellerHistory)
    ? product.buyBoxSellerHistory.at(-1)
    : null;
  const ts = Date.now();
  const logEntry = { ts, price: latestPrice, asin };
  await appendLog(logEntry);
  console.log(JSON.stringify(logEntry));
  return logEntry;
}

async function appendLog(entry) {
  const { asin, price, ts } = entry;
  await fs.mkdir(path.dirname(PRICE_LOG), { recursive: true });
  // rotate if > MAX_SIZE
  const stat = await fs.stat(PRICE_LOG).catch(() => null);
  if (stat && stat.size > MAX_SIZE) {
    const rotated = PRICE_LOG.replace('.json', `-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
    await fs.rename(PRICE_LOG, rotated);
    console.log(`🔁 ログをローテーション: ${rotated}`);
  }

  // read existing (array or object)
  let data;
  try {
    data = JSON.parse(await fs.readFile(PRICE_LOG, 'utf8'));
  } catch { data = {}; }

  // migrate old array format
  if (Array.isArray(data)) {
    const migrated = {};
    for (const rec of data) {
      const a = rec.asin;
      if (!migrated[a]) migrated[a] = [];
      migrated[a].push({ price: rec.price, timestamp: rec.timestamp || new Date(rec.ts).toISOString() });
    }
    data = migrated;
  }

  if (!data[asin]) data[asin] = [];
  data[asin].push({ price, timestamp: new Date(ts).toISOString() });

  await fs.writeFile(PRICE_LOG, JSON.stringify(data, null, 2));

  // also store daily log (YYYY-MM-DD.json)
  const today = new Date().toISOString().slice(0, 10);
  const dailyPath = path.join(path.dirname(PRICE_LOG), `${today}.json`);
  let dailyArr = [];
  try {
    dailyArr = JSON.parse(await fs.readFile(dailyPath, 'utf8'));
    if (!Array.isArray(dailyArr)) dailyArr = [];
  } catch {}
  dailyArr.push({ asin, price, timestamp: new Date(ts).toISOString() });
  await fs.writeFile(dailyPath, JSON.stringify(dailyArr, null, 2));
  console.log(`🗂 日別ログも保存: ${dailyPath}`);
}


  

// If run directly via CLI, loop over asin-list.json
if (import.meta.url === process.argv[1] || import.meta.url.endsWith('/core/fetchPrice.js')) {
  (async () => {
    const listExists = await fs.stat(ASIN_LIST_PATH).then(()=>true).catch(()=>false);
    if (!listExists) {
      console.error('asin-list.json not found.');
      process.exit(1);
    }
    const asinList = JSON.parse(await fs.readFile(ASIN_LIST_PATH, 'utf8'));
    for (const item of asinList) {
      await fetchPrice(item.asin);
    }
  })().catch(err=>{console.error(err);process.exit(1);});
}
