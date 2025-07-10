import fetch from 'node-fetch';
import '../config/loadEnv.js';

const { ZAPIER_WEBHOOK_URL, DISCORD_WEBHOOK_URL, SLACK_WEBHOOK_URL, LINE_NOTIFY_TOKEN } = process.env;

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
 * Send notification to all configured channels.
 * Currently supports Zapier/Discord/Slack webhook (JSON) and LINE Notify.
 * @param {object} payload
 */
export async function notifyAll(payload) {
  const tasks = [];

  if (ZAPIER_WEBHOOK_URL) {
    tasks.push(postWebhook(ZAPIER_WEBHOOK_URL, payload, 'Zapier'));
  }
  if (DISCORD_WEBHOOK_URL) {
    tasks.push(postWebhook(DISCORD_WEBHOOK_URL, payload, 'Discord'));
  }
  if (SLACK_WEBHOOK_URL) {
    tasks.push(postWebhook(SLACK_WEBHOOK_URL, payload, 'Slack'));
  }
  if (LINE_NOTIFY_TOKEN) {
    tasks.push(postLineNotify(LINE_NOTIFY_TOKEN, payload));
  }

  await Promise.all(tasks);
}

async function postWebhook(url, body, label) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`📨 ${label} 送信: ${res.status}`);
  } catch (err) {
    console.error(`⚠️ ${label} 送信エラー:`, err.message);
  }
}

async function postLineNotify(token, body) {
  try {
    const message = `[PriceBotX] ${body.title ?? body.asin}: ${body.price}円`;
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({ message }),
    });
    console.log(`📨 LINE Notify 送信: ${res.status}`);
  } catch (err) {
    console.error('⚠️ LINE Notify 送信エラー:', err.message);
  }
}

