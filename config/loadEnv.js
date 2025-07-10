import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env located at projectRoot/env/.env
dotenv.config({ path: path.resolve(__dirname, '../env/.env') });

// No exports needed; importing this file applies side-effects.
