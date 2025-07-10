import fetch from 'node-fetch';
import '../config/loadEnv.js';

const { ZAPIER_WEBHOOK_URL } = process.env;

/**
 * Check if price triggers threshold.
 * @param {number|null} price current price
 * @param {number} threshold configured threshold
 * @returns {boolean}
 */
export function isTrigger(price, threshold) {
  return price !== null && price <= threshold;
}

/**
 * Send notification to Zapier if webhook is configured.
 * @param {object} payload
 */
export async function notifyZapier(payload) {
  if (!ZAPIER_WEBHOOK_URL) return;
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
