# Murrumbeena Lions Team Manager Deployment

## 1. Create Supabase project

1. Create a free Supabase project.
2. Open the SQL Editor.
3. Paste and run `supabase_schema.sql`.
4. Go to Project Settings > API.
5. Copy the Project URL and anon public key.

## 2. Add app settings

Edit `config.js`:

```js
window.FOOTY_SUPABASE = {
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-public-key"
};
```

## 3. Auth redirect URLs

In Supabase Authentication URL settings, add your hosted site URL once you have it.
For local testing, add the local file URL or use a small local web server.

## 4. Host the webpage

Upload this folder to a static host such as Netlify, Vercel, or GitHub Pages.

## 5. Use on devices

Open the hosted URL on your laptop and phone, sign in with the same email address, and the roster plus attendance will sync.

## Shared access and lineups

Run `shared_access_upgrade.sql` after changes that add shared users or lineup syncing. Then add approved emails to `public.team_members`.
