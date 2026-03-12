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

When you deploy from GitHub (e.g. to Vercel), the site runs on their servers — there is no `.env` file there. You **must** add the API key in the host’s dashboard:

1. Deploy this repo to [Vercel](https://vercel.com) (import from GitHub).
2. In the project: **Settings → Environment Variables**, add:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** your OpenAI key (same as in `.env` locally)
3. Redeploy once after saving the variable.

The app automatically uses `/api/chat` when not on localhost (no `script.js` change needed). If you see **API error 405**, it usually meant the app was still calling `api/chat.php` on a host that doesn’t run PHP; the code now switches to `/api/chat` when deployed.

---

## So the bot can answer “send me the location”

In **script.js** at the top, set your real address:

```js
const LOCATION = 'Location: Your full address or “Corner of X and Y”';
```

Then the chatbot will use this when anyone asks for the location.

---

## “Click here for location” link

In **index.html**, find the link with class `tagline-location` and set the `href` to your Google Maps place URL (Google Maps → Share → Copy link).
