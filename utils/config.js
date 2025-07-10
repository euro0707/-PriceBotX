import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const LOGS_DIR = path.resolve(ROOT, 'logs');
export const PRICE_LOG_PATH = path.resolve(LOGS_DIR, 'price-log.json');
export const ASIN_LIST_PATH = path.resolve(ROOT, 'asin-list.json');

// 1MB rotate threshold
export const MAX_LOG_SIZE = 1024 * 1024;
