import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import '../config/loadEnv.js';
import OpenAI from 'openai';

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { OPENAI_API_KEY, PRICE_THRESHOLD = '10000' } = process.env;
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in env/.env');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const priceLogPath = path.resolve(__dirname, '../logs/price-log.json');
let log = [];
try {
  log = JSON.parse(await fs.readFile(priceLogPath, 'utf8'));
} catch (e) {
  console.error('price-log.json not found. Run npm run fetch first.');
  process.exit(1);
}

const target = log.find(entry => entry.price <= Number(PRICE_THRESHOLD));
if (!target) {
  console.log('⛔ 通知対象の商品がありません');
  process.exit(0);
}

const prompt = `以下の商品について、値下がりしたことをX（旧Twitter）に投稿する日本語メッセージを140文字以内で生成してください。
・商品名：${target.title}
・旧価格：不明
・新価格：${target.price}円
・トーン：買い時をアピール、カジュアル
出力はメッセージのみ。`;

try {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const tweet = response.choices[0].message.content.trim();
  console.log('✅ 生成された投稿文:\n', tweet);

  // 保存
  const tweetsLogPath = path.resolve(__dirname, '../logs/tweets.log');
  const existingLog = await fs.readFile(tweetsLogPath, 'utf8').then(JSON.parse).catch(() => []);
  existingLog.push({
    timestamp: new Date().toISOString(),
    asin: target.asin,
    price: target.price,
    message: tweet,
  });
  await fs.writeFile(tweetsLogPath, JSON.stringify(existingLog, null, 2));
  console.log('📝 tweets.log に保存しました');
} catch (error) {
  console.error('⚠️ ChatGPT API エラー:', error.message);
}
