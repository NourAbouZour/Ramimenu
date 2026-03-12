/**
 * Serverless proxy for the menu chatbot.
 * Keeps your OpenAI API key off the frontend and out of GitHub.
 *
 * Deploy to Vercel:
 * 1. Push this repo to GitHub and import it in vercel.com.
 * 2. In Vercel project Settings → Environment Variables, add OPENAI_API_KEY.
 * 3. Your chat API will be: https://your-project.vercel.app/api/chat
 *
 * Then in script.js set: const CHAT_API_URL = 'https://your-project.vercel.app/api/chat';
 */

module.exports = async (req, res) => {
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
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  const { systemPrompt, messages } = body || {};
  if (!systemPrompt || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Missing systemPrompt or messages' });
    return;
  }

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
