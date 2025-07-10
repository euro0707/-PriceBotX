import { mkdir } from 'fs/promises';

/**
 * Sleep for specified milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Ensure directory exists (like mkdir -p)
 * @param {string} dirPath
 */
export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}
