export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  if (req.headers['x-shared-secret'] !== process.env.SHARED_SECRET) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const {
      testId, studentName, studentId, score, maxScore,
      startedAt, finishedAt, durationSec, detailsUrl, className
    } = req.body || {};

    const escape = (s = '') =>
      String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const pct = (score != null && maxScore) ? Math.round((score / maxScore) * 100) : null;
    const lines = [
      '📝 <b>Test submitted</b>',
      `<b>Student:</b> ${escape(studentName || 'Unknown')}`,
      className ? `<b>Class:</b> ${escape(className)}` : null,
      `<b>Test:</b> ${escape(testId || 'Unknown')}`,
      (score != null && maxScore != null)
        ? `<b>Score:</b> ${score}/${maxScore}${pct != null ? ` (${pct}%)` : ''}`
        : null,
      durationSec != null ? `<b>Duration:</b> ${Math.round(durationSec/60)} min` : null,
      startedAt ? `<b>Started:</b> ${escape(startedAt)}` : null,
      finishedAt ? `<b>Finished:</b> ${escape(finishedAt)}` : null,
      detailsUrl ? `<b>Details:</b> ${escape(detailsUrl)}` : null
    ].filter(Boolean).join('\n');

    const tgResp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: lines,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const tgData = await tgResp.json();
    if (!tgData.ok) {
      console.error('Telegram error:', tgData);
      return res.status(502).json({ ok: false, error: 'Failed to send Telegram message', tgData });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
