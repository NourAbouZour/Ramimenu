# Menu Chat & GitHub Pages

Chat runs in the browser. **OpenAI API key** and **prompt** are in **`script.js`**. No backend, no Vercel, no .env. Works on GitHub Pages.

## Quick start

1. In **`script.js`** set your key (search for `OPENAI_API_KEY`):
   ```js
   const OPENAI_API_KEY = 'sk-your-key-here';
   ```
2. Push to GitHub. Turn on **GitHub Pages**: repo **Settings → Pages →** Source: **Deploy from a branch** → Branch: **master** (or main) → Save.
3. Open your site at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

Chat calls OpenAI from the browser with the key above. Optional: users can type `/setkey THEIR_KEY` to use their own key (stored in browser only).

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
