# Menu Chat & API Key Setup

**Important:** The `.env` file (with your API key) is **not** pushed to GitHub on purpose — that would expose your key. Use the steps below for each environment.

## WAMP (local)

1. Copy the folder into your WAMP web root, e.g. `C:\wamp64\www\menurami`.

2. Create a **`.env`** file in the project root with your OpenAI key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
   (`.env` is in `.gitignore` and is never pushed.)

3. Start WAMP and open: `http://localhost/menurami/`

The app uses `api/chat.php` on localhost and reads `OPENAI_API_KEY` from `.env`. No code change needed.

## Production (Vercel / GitHub deploy)

No server or dashboard setup needed. After you deploy (e.g. [Vercel](https://vercel.com) - import from GitHub):

1. Open your live site.
2. Open the chat (bottom right).
3. Type: **/setkey YOUR_OPENAI_KEY** (replace with your key from platform.openai.com).
4. The key is stored only in that browser. Chat works from then on.

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
