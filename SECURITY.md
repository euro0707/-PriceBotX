# Security Policy for PriceBotX

## 🔐 API Key and Secrets Management

- All API keys, including `KEEPA_API_KEY`, `ZAPIER_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, and `LINE_NOTIFY_TOKEN`, **must be stored in the `.env` file** and **should never be committed** to version control.
- Ensure `.env` is listed in `.gitignore`.

## 🧪 Request Throttling & Fair Use

- Respect Keepa's API rate limits. Recommended: **no more than 1 request per second**.
- Use exponential backoff or retry logic (`fetchWithRetry`) to avoid overloading the API.

## 📦 Log Rotation

- Log files (e.g., `logs/price-log.json`) are automatically rotated if they exceed size limits.
- Keep the log file size under control to avoid file-based denial-of-service risks.

## 📤 Webhook Security

- Webhook URLs must be protected via `.env`.
- Do **not expose webhook URLs** via console logs or external logs.
- Prevent spamming by implementing cooldown logic (e.g., avoid duplicate notifications within a short window).

## 📁 Data Source Restrictions

- `asin-list.json` must only contain **publicly accessible product identifiers**.
- Do not scrape external sites or introduce ASINs from user-uploaded sources without validation.

## ✅ Legal & Compliance

- This tool uses the **official Keepa API** and does **not perform HTML scraping**.
- Usage is compliant with Keepa’s API Terms of Service, assuming:
  - You have a valid API subscription.
  - You do not redistribute or resell the raw data.
- Zapier/Discord/Slack/LINE usage is compliant as long as no private or sensitive user data is transmitted.

## 🛡 Recommended Practices

- Audit logs regularly.
- Rotate API keys periodically.
- Use GitHub Secrets or CI/CD secret management if deploying.

---

If you discover a security vulnerability, please open an issue or contact the repository maintainer privately.
