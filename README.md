# Ghosted Waitlist

Jednostavan waitlist site na hrvatskom: svijetla/tamna tema, video, objave i forma (Instagram ili Gmail) koja šalje podatke u Google Sheets.

## Pokretanje

Otvori `index.html` u pregledniku ili pokreni lokalni server:

```bash
# Python
python3 -m http.server 5173

# zatim otvori http://localhost:5173
```

## Što urediti

1. **Video** — stavi svoj file u `assets/demo.mp4` (ili zamijeni `<video>` YouTube embedom u `index.html`).
2. **Objave** — u sekciji `#objave` zamijeni `href="#"` i naslove svojim linkovima.
3. **Google Sheets** — slijedi korake ispod i zalijepi Web App URL u `config.js`.

## Spajanje na Google Sheets

1. Napravi novu Google tablicu (npr. *Ghosted Waitlist*).
2. Extensions → **Apps Script**.
3. Obriši defaultni kod i zalijepi sadržaj iz `google-apps-script.gs`.
4. Spremi projekt.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Kopiraj Web App URL.
7. U `config.js` zamijeni:

```js
googleScriptUrl: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
```

s tvojim URL-om.

Skripta automatski kreira list `Waitlist` sa stupcima:

| Timestamp | Contact Type | Instagram | Email | Source |

## Deploy

Možeš hostati bilo gdje kao statički site:

- [Netlify Drop](https://app.netlify.com/drop)
- Vercel / Cloudflare Pages
- GitHub Pages

Samo uploadaj cijeli folder (nakon što si postavio `config.js`).
