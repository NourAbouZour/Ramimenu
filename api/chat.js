/**
 * Vercel serverless proxy for the menu chatbot.
 * Same behaviour as api/chat.php: uses openingTimes, location, menuText + messages.
 * Set OPENAI_API_KEY in Vercel → Settings → Environment Variables.
 */

function buildSystemPrompt(openingTimes, location, menuText) {
  const ot = (openingTimes && String(openingTimes).trim()) || 'Opening times: (not provided)';
  const loc = (location && String(location).trim()) || 'Location: (not provided)';
  const menu = (menuText && String(menuText).trim()) || 'Menu: (not provided)';
  return `You are the assistant for a cafe & restaurant.

IMPORTANT RULES (must follow):
- You must ONLY answer questions about:
  1) Menu items (food/drinks): names, descriptions, and prices.
  2) Opening hours / opening times.
  3) Location, address, or how to find the restaurant.
- If the user asks about anything else (reservations, delivery, jobs, complaints, stories, jokes, general knowledge, etc.), you must politely refuse and say you can only help with menu, opening times, and location.
- Be kind, respectful, and concise.
- Respond in the SAME language as the user (Arabic ↔ Arabic, English ↔ English).
- Use ONLY the information provided below. Do not invent items, prices, hours, or address details.

INFORMATION YOU MAY USE:
${ot}
${loc}
${menu}`;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const messages = body.messages;
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: 'Missing messages' });
    return;
  }

  const openingTimes = body.openingTimes;
  const location = body.location;
  const menuText = body.menuText;
  const systemPrompt = buildSystemPrompt(openingTimes, location, menuText);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 400,
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = (data.error && data.error.message) ? data.error.message : 'OpenAI API error';
      res.status(response.status).json({ error: errMsg });
      return;
    }

    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    res.status(200).json({ reply: content ? content.trim() : '' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
