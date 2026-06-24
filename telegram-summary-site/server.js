const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Helper: fetch telegram channel page and extract messages grouped by date
async function fetchTelegramMessages() {
  const url = 'https://t.me/s/hedgecat0301';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const messages = [];

  // Each message is in a div with class 'tgme_widget_message_wrap'
  $('.tgme_widget_message_wrap').each((_, el) => {
    const $msg = $(el);
    const time = $msg.find('time').attr('datetime'); // ISO string
    const text = $msg.find('.tgme_widget_message_text').text().trim();
    if (time && text) {
      const date = new Date(time).toISOString().split('T')[0]; // YYYY-MM-DD
      messages.push({ date, text });
    }
  });
  return messages;
}

// API endpoint: get summary for a specific date
app.get('/api/summary/:date', async (req, res) => {
  try {
    const date = req.params.date; // expected YYYY-MM-DD
    const messages = await fetchTelegramMessages();
    const filtered = messages.filter(m => m.date === date);
    if (filtered.length === 0) {
      return res.json({ date, summary: '해당 날짜에 메시지가 없습니다.' });
    }
    // Combine texts and create a simple summary (first 300 chars)
    const combined = filtered.map(m => m.text).join(' ');
    const summary = combined.length > 300 ? combined.slice(0, 300) + '...' : combined;
    res.json({ date, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch telegram data' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});