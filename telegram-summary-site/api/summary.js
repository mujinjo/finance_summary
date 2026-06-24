import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { date } = req.query;
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter required (YYYY-MM-DD)' });
  }
  try {
    const url = 'https://t.me/s/hedgecat0301';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch telegram page: ${resp.status}`);
    const html = await resp.text();
    const $ = cheerio.load(html);
    const messages = [];
    $('.tgme_widget_message_wrap').each((_, el) => {
      const $msg = $(el);
      const time = $msg.find('time').attr('datetime');
      const text = $msg.find('.tgme_widget_message_text').text().trim();
      if (time && text) {
        const d = new Date(time).toISOString().split('T')[0];
        messages.push({ date: d, text });
      }
    });
    const filtered = messages.filter(m => m.date === date);
    let summary = '';
    if (filtered.length === 0) {
      summary = '해당 날짜에 메시지가 없습니다.';
    } else {
      const combined = filtered.map(m => m.text).join(' ');
      summary = combined.length > 300 ? combined.slice(0, 300) + '...' : combined;
    }
    res.status(200).json({ date, summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch telegram data' });
  }
}