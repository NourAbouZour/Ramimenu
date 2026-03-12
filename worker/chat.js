// Deploy to Cloudflare Workers (free). Dashboard: Workers & Pages → Create → Edit code → paste this.
// Add secret: Settings → Variables → OPENAI_API_KEY (your key). Then set CHAT_BACKEND_URL in script.js to your worker URL.

function buildPrompt(openingTimes, location, menuText) {
  const ot = (openingTimes && String(openingTimes).trim()) || 'Opening times: (not provided)';
  const loc = (location && String(location).trim()) || 'Location: (not provided)';
  const menu = (menuText && String(menuText).trim()) || 'Menu: (not provided)';
  return `You are the assistant for a cafe & restaurant. Only answer about menu items, opening hours, and location. Be concise. Respond in the same language as the user (English or Arabic). Use ONLY this info:\n${ot}\n${loc}\n${menu}`;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const key = env.OPENAI_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not set' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const messages = body.messages;
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const systemPrompt = buildPrompt(body.openingTimes, body.location, body.menuText);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, ...messages], max_tokens: 400, temperature: 0.3 })
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = (data.error && data.error.message) ? data.error.message : 'OpenAI error';
      return new Response(JSON.stringify({ error: errMsg }), { status: res.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return new Response(JSON.stringify({ reply: content ? content.trim() : '' }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
};
