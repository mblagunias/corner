# Vinyl Wall

Connect your Spotify account and see your nine most-listened albums from last month displayed in a 3×3 vinyl-on-the-wall grid.

## Setup

### 1. Create a Spotify app

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app and open its settings.
3. Add **both** redirect URIs you will use:

   **Local development** (Spotify does not allow `localhost` — use the loopback IP):
   ```
   http://127.0.0.1:3000/api/auth/callback
   ```

   **Production on Vercel** (HTTPS required):
   ```
   https://YOUR_VERCEL_DOMAIN/api/auth/callback
   ```

   Example: `https://corner-mu.vercel.app/api/auth/callback`

4. Copy the **Client ID** and **Client Secret**.
5. If the app is in Development Mode, add your Spotify account under **Users and Access**.

See [Spotify's redirect URI requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri) for details.

### 2. Configure environment variables

**Local** — create `.env.local` in the project root:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

**Vercel** — in your project go to **Settings → Environment Variables** and add:

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `SPOTIFY_CLIENT_ID` | your client ID | same | same |
| `SPOTIFY_CLIENT_SECRET` | your client secret | same | same |
| `NEXT_PUBLIC_APP_URL` | only if using a custom domain | optional | optional |

Do **not** set `NEXT_PUBLIC_APP_URL` to `http://127.0.0.1:3000` in Vercel production — remove it or set it to `https://corner-mu.vercel.app` instead.

After adding variables, **redeploy** the production deployment.

### 3. Run locally

**Requires Node.js 20.9 or later.** Check with `node -v`.

```bash
nvm install
nvm use
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (not `localhost`), click **Connect Spotify**, and authorize the app.

### 4. Deploy to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add the environment variables above.
3. Add your production callback URL to the Spotify app settings (must match exactly).
4. Deploy, then open your production URL and connect Spotify.

**Preview deployments:** each preview URL is different. Spotify OAuth on previews only works if you add that preview URL as a redirect URI in the Spotify dashboard. For easiest testing, use the production deployment.

## How albums are ranked

The app pulls your Spotify listening history for the **previous calendar month** (UTC, from the 1st through the last day) and ranks albums by how many times you played tracks from each album during that window.

## Tech stack

- Next.js (App Router)
- Spotify Web API (OAuth + recently played)
- Tailwind CSS
