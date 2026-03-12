# Menu Chat & API Key Setup

The chatbot uses the **OpenAI API key in `script.js`** (visible in the repo). No Vercel, no .env, no backend required. Works on GitHub Pages or any static host.

## Quick start

1. Open **`script.js`** and set your key at the top (search for `OPENAI_API_KEY`):
   ```js
   const OPENAI_API_KEY = 'sk-your-key-here';
   ```
2. Push to GitHub. Enable GitHub Pages (Settings → Pages → source: main branch) if you want it online.
3. Or run locally: open `index.html` in a browser, or put the folder in WAMP and open `http://localhost/menurami/`

Chat runs entirely in the browser and calls OpenAI with the key above. Optional: users can type `/setkey THEIR_KEY` to override with a key stored only in their browser.

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
