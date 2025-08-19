# CDI Telegram Bot Starter (Vercel + Webhook + Reporting)

This project gives you:
- `/api/telegram-webhook` — a Telegram webhook that echoes and responds to `/start`.
- `/api/report` — a secure endpoint your HTML tests can POST to; it forwards a formatted message to your Telegram chat.
- `example_test.html` — a tiny front-end demo showing how to send the report.

## 1) Create your bot
- Use @BotFather → `/newbot` → copy the token.

## 2) Set environment variables in Vercel (Project → Settings → Environment Variables)
- `TELEGRAM_BOT_TOKEN` — from BotFather (for your bot, e.g., @test_xabarchi_bot)
- `TELEGRAM_CHAT_ID` — where reports should go (your DM/group/channel chat id)
- `SHARED_SECRET` — any strong random string; used by `/api/report`
- `WEBHOOK_SECRET` — any strong random string; used by `/api/telegram-webhook?token=...`

To find `TELEGRAM_CHAT_ID` for your DM: send `/start` to your bot and open:
`https://api.telegram.org/bot<token>/getUpdates` then read `chat.id`.

If `getUpdates` is empty, clear webhook first:
`https://api.telegram.org/bot<token>/deleteWebhook`

## 3) Deploy to Vercel
```
npm i -g vercel
vercel
```
After deploy, you will have a URL like:
`https://your-app.vercel.app`

## 4) Set the webhook (optional, enables echo replies)
Open:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram-webhook?token=<YOUR_WEBHOOK_SECRET>`

Check status:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo`

Now message your bot `/start` — it should reply.

## 5) Test reporting from the front-end
- Open `example_test.html` and replace:
  - `REPLACE_WITH_YOUR_DEPLOY_URL` with `https://your-app.vercel.app`
  - `REPLACE_WITH_SHARED_SECRET` with your `SHARED_SECRET`
- Open the file in your browser, fill a name, click **Finish & Report**.
- You should receive a formatted Telegram message in `TELEGRAM_CHAT_ID`.

## 6) Use `/api/report` from your own CDI HTML
After you compute the score, call:
```js
await fetch('https://your-app.vercel.app/api/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shared-Secret': '<your SHARED_SECRET>'
  },
  body: JSON.stringify({
    testId: 'Listening Full Test 26',
    studentName: document.querySelector('#studentName')?.value || 'Unknown',
    score, maxScore, startedAt, finishedAt, durationSec,
    className: 'Group A',
    detailsUrl: location.href
  })
});
```

Never expose your bot token in front-end code.
