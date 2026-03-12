# Menu Chat & API Key Setup

## WAMP (recommended if you use WAMP)

1. Copy the folder into your WAMP web root, for example:
   - `C:\wamp64\www\menurami`

2. Put your OpenAI key in **`.env`** in the project root:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
   (`.env` is in `.gitignore` — it is not pushed to GitHub.)

3. In `script.js`, set the chat URL to the PHP endpoint:
   ```js
   const CHAT_API_URL = '/menurami/api/chat.php';
   ```
   If your folder name is different, change `/menurami/` to match.

4. Start WAMP (make sure it is green).

5. Open in your browser:
   - `http://localhost/menurami/`

The chatbot will call the PHP endpoint and read `OPENAI_API_KEY` from `.env`. The `.htaccess` blocks downloading `.env` from the web.

## Production (Vercel)

1. Deploy this project to [Vercel](https://vercel.com) (connect your GitHub repo).
2. In the project: **Settings → Environment Variables** add:
   - Name: `OPENAI_API_KEY`
   - Value: your key
3. `CHAT_API_URL` in `script.js` is already `'/api/chat'` — it works on Vercel as-is.

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
