# Google Sheets Backend Setup

This keeps the current Beena Team Manager interface and swaps the sync layer to a shared Google Sheet.

## 1. Create the sheet

1. Create a new Google Sheet.
2. Name it something like `Beena Team Manager Sync`.

## 2. Open Apps Script

1. In the Google Sheet, click `Extensions` -> `Apps Script`.
2. Replace the default code with the contents of [Code.gs](./Code.gs).
3. Click `Save`.

## 3. Deploy the script

1. Click `Deploy` -> `New deployment`.
2. Choose `Web app`.
3. Set:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
4. Click `Deploy`.
5. Copy the `Web app URL`.

## 4. Paste the web app URL into the site

Open [config.js](../config.js) and set:

```js
window.FOOTY_BACKEND = {
  mode: "google-sheets",
  appsScriptUrl: "PASTE_WEB_APP_URL_HERE",
  teamId: "beena",
  sheetName: "Beena Team Manager"
};
```

## 5. Publish the site

Commit and push:

- `config.js`
- `index.html`
- `app.js`
- `google-sheets-backend/Code.gs`
- `google-sheets-backend/SETUP.md`

## 6. First sync

1. Open the live site.
2. Import your CSV export once.
3. Wait a few seconds.
4. Refresh the page.
5. Open the same live site on the phone and tap `Refresh Sync`.

After that, both devices should be reading and writing to the same shared Sheet snapshot.
