import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const LOG_DIR = path.join(ROOT, 'logs');
export const PRICE_LOG = path.join(LOG_DIR, 'price-log.json');
export const ASIN_LIST_PATH = path.join(ROOT, 'asin-list.json');

// 1MB rotate threshold
export const MAX_LOG_SIZE = 1024 * 1024;
