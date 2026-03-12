# Menu Chat & GitHub Pages

Chat runs in the browser. **OpenAI API key** and **prompt** are in **`script.js`**. No backend, no Vercel, no .env. Works on GitHub Pages.

## Quick start

1. In **`script.js`** set your key (search for `OPENAI_API_KEY`):
   ```js
   const OPENAI_API_KEY = 'sk-your-key-here';
   ```
2. Push to GitHub. Turn on **GitHub Pages**: repo **Settings → Pages →** Source: **Deploy from a branch** → Branch: **master** → Save. (Only master branch is used; main was removed.)
3. Open your site at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

The app tries public CORS proxies so the chat works on GitHub Pages. If you see "Proxies could not reach OpenAI", use a backend (one-time, free):

### Option A: Cloudflare Worker (recommended, ~2 min)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker**.
2. Replace the default code with the contents of **`worker/chat.js`** in this repo. Click **Save and Deploy**.
3. In the worker: **Settings** → **Variables** → **Add** → Name: `OPENAI_API_KEY`, Value: your key → Save.
4. Copy your worker URL (e.g. `https://your-worker.your-subdomain.workers.dev`). In **script.js** set:
   ```js
   const CHAT_BACKEND_URL = 'https://your-worker.your-subdomain.workers.dev';
   ```
5. Push to GitHub. Chat will use your worker and work on https://nourabouzour.github.io/Ramimenu/

### Option B: Free PHP host (000webhost, etc.)
1. Upload this repo (or at least **api/chat.php** and **.env** with `OPENAI_API_KEY=sk-...`) to a free PHP host.
2. In **script.js** set `CHAT_BACKEND_URL = 'https://your-site.000webhostapp.com/api/chat.php'` (use your real URL).
3. Push. Chat will use your PHP backend.

Optional: users can type `/setkey THEIR_KEY` to use their own key (stored in browser only).

---

## So the bot can answer "send me the location"

In **script.js** at the top, set your real address:

```js
const LOCATION = 'Location: Your full address or "Corner of X and Y"';
```

Then the chatbot will use this when anyone asks for the location.

---

## "Click here for location" link

In **index.html**, find the link with class `tagline-location` and set the `href` to your Google Maps place URL (Google Maps -> Share -> Copy link).
