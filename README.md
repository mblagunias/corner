# Vinyl Wall

Connect your Spotify account and see your nine most-listened albums from last month displayed in a 3×3 vinyl-on-the-wall grid.

## Setup

### 1. Create a Spotify app

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app and open its settings.
3. Add this redirect URI (Spotify does **not** allow `localhost` — use the loopback IP):
   ```
   http://127.0.0.1:3000/api/auth/callback
   ```
4. Copy the **Client ID** and **Client Secret**.

See [Spotify's redirect URI requirements](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri) for details.

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

### 3. Run the app

**Requires Node.js 20.9 or later.** Check with `node -v`.

If you use [nvm](https://github.com/nvm-sh/nvm), switch to Node 20 in this project:

```bash
nvm install
nvm use
```

Then start the dev server:

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (not `localhost`), click **Connect Spotify**, and authorize the app.

## How albums are ranked

The app pulls your Spotify listening history for the **previous calendar month** and ranks albums by play count. If there isn't enough recent history, it supplements with your top tracks from the last four weeks.

## Tech stack

- Next.js (App Router)
- Spotify Web API (OAuth + recently played / top tracks)
- Tailwind CSS
