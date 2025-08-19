export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token || token !== process.env.WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (req.method !== 'POST') return new Response('Only POST', { status: 405 });

  const update = await req.json().catch(() => ({}));
  const msg = update.message || update.edited_message || null;
  const chatId = msg?.chat?.id;
  const text = msg?.text;
  if (!chatId || !text) return new Response(JSON.stringify({ ok: true }), { status: 200 });

  const reply = (text === '/start')
    ? 'Hello! I am alive. I will report test submissions to my owner.'
    : `You said: ${text}`;

  const body = JSON.stringify({ chat_id: chatId, text: reply });
  const tgresp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body
  });
  const ok = tgresp.ok;
  return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 502 });
}
