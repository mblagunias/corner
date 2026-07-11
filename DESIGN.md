# Corner — Design

Corner shows your nine top Spotify albums for the previous month, arranged like records on three shelves above a small listening console. This document describes the visual and interaction design of the app.

## Design philosophy

The interface is inspired by **Dieter Rams' functionalist design** — "as little design as possible." Every element earns its place, ornament is avoided, and the album artwork is the hero. The supporting UI (shelves, console, controls) recedes into a calm, neutral environment so the music does the talking.

Guiding principles:

- **Minimal and honest** — flat surfaces, thin borders, no faux textures or heavy shadows.
- **Content first** — album covers are the brightest, highest-contrast objects on the page.
- **Quiet neutrality** — a warm off-white palette instead of stark white or dark chrome.
- **Restraint in type** — a single sans-serif family, small sizes, generous letter-spacing for labels.
- **Physical metaphor, abstracted** — shelves and a console (turntable, plant, lamp) evoke a room without being skeuomorphic.

## Color

Colors are defined as CSS custom properties in `app/globals.css` (`:root`).

| Token | Value | Role |
|---|---|---|
| `--bg` | `#ebe8e3` | Page background (warm off-white) |
| `--surface` | `#f7f5f2` | Wall scene / recessed surfaces |
| `--surface-raised` | `#ffffff` | Album art, console objects |
| `--border` | `#d8d4cc` | Default hairline borders |
| `--border-strong` | `#b8b4ac` | Stronger borders (buttons, console objects) |
| `--text` | `#1c1c1c` | Primary text, primary button fill |
| `--text-muted` | `#6e6e6e` | Secondary text, labels |
| `--accent` | `#ff6600` | Reserved accent (Braun-style orange) |
| `--shelf-face` | `#c9c5bd` | Shelf board face |
| `--shelf-edge` | `#a8a49c` | Shelf board edge/underside |
| `--console` | `#e2ded8` | Console tone |
| `--console-top` | `#f0ece6` | Console surface top |

Notes:

- The palette is intentionally low-contrast except for text and album art, keeping focus on the covers.
- `--accent` is defined for optional emphasis but used sparingly (or not at all) to preserve calm.
- Error states borrow a muted red (`red-50` background, `red-200` border, `red-800` text) from Tailwind for legibility without alarm.

## Typography

- **Family:** [Inter](https://rsms.me/inter/) loaded via `next/font/google`, exposed through the `--font-sans` variable, with a system sans-serif fallback stack.
- **Scale (compact and understated):**
  - Section/period heading: `1.125rem`–`1.25rem` (`text-lg`/`sm:text-xl`), medium weight, tight tracking.
  - Body copy: `0.875rem`, `160%` line-height.
  - Brand + labels: `0.625rem`–`0.875rem`, uppercase, letter-spacing `0.18em`–`0.2em`.
  - Album title: `0.6875rem`, weight 500, single-line with ellipsis.
  - Album artist: `0.625rem`, muted, single-line with ellipsis.
- **Case & spacing:** Labels and buttons use uppercase with wide tracking to read as quiet system text rather than headlines.

## Layout

- **Container:** a single centered column, `max-w-2xl`, with responsive padding (`px-5 py-10` → `sm:px-8 sm:py-14`).
- **Page header:** brand "Corner" plus the subtitle "Top albums · previous month," separated from content by a bottom hairline. When connected, a `Disconnect` control sits at the top-right.
- **Primary view:** either the `ConnectSpotify` prompt (logged out) or the `VinylWall` (logged in).

### The wall scene

The core artifact is the **wall scene** (`.wall-scene`) — a bordered `--surface` card that is also the export target for sharing. Top to bottom:

1. **Period header** — centered "TOP ALBUMS" label and the previous month name (e.g. "June").
2. **Three shelves**, stacked with generous vertical spacing.
3. **Listening console** — a horizontal surface holding a turntable, plant, and lamp, divided from the shelves by a top hairline.

### Shelves

- Each shelf is a **3-column grid** of albums aligned to the bottom (`align-items: end`), so covers appear to rest on the board.
- Below the row sits the **shelf board** (`.album-shelf-board`): a thin bar with a stacked box-shadow that fakes a subtle edge/underside and a soft cast shadow — just enough depth to read as a shelf.
- Empty slots render a **dashed placeholder** so the 3×3 structure holds even with fewer than nine albums.

### Album cover

- Square artwork (`aspect-ratio: 1`) capped at `7.5rem` (mobile) / `9rem` (≥640px), on a white ground with a hairline border.
- **Hover:** lifts `-2px` with a soft shadow (`transform` + `box-shadow`, 0.2s ease) — the primary interactive affordance.
- Metadata (title, artist) is centered beneath the cover, each truncated to one line.
- Each cover is a link to the album on Spotify (`target="_blank"`, descriptive `aria-label`), with a graceful "No cover" fallback.

### Listening console

A purely decorative scene built from CSS primitives (no images), reinforcing the "room" metaphor while staying flat and minimal:

- **Turntable** — rounded base with a circular platter (radial-gradient grooves) and an angled tonearm.
- **Plant** — a pot with a stem and three leaves at varied angles.
- **Lamp** — a shade (with a faint warm glow via radial-gradient), stem, and base.

All console pieces use `--surface-raised` fills with `--border-strong` outlines to match the album-art treatment.

## Interaction & states

- **Period label:** the wall shows the previous calendar month name (e.g. June when the current month is July), backed by Spotify’s short-term top tracks.
- **Loading:** a small spinner (`.loading-indicator`) centered in a min-height area; the console still renders to keep the frame stable.
- **Empty:** a bordered notice when the period has no album-level top tracks.
- **Error:** a muted-red banner surfacing the API message when available.
- **Auth prompt (`ConnectSpotify`):** heading, one-line explanation, a solid black primary button ("CONNECT SPOTIFY", inverts on hover), and a small contextual hint (local loopback vs. Vercel redirect URI). Inline error copy maps known error codes to friendly messages.

## Sharing / export

- The wall scene is captured to an image via `html-to-image` for **Save image**, **Instagram**, and **Twitter** actions (`ShareWallActions`).
- Share buttons live **below** the exported frame so they never appear in the output.
- `.share-export { overflow: hidden }` keeps hover lifts and shadows from bleeding past the frame during capture.
- Album art is requested with `crossOrigin="anonymous"` so covers render in the exported canvas.

## Responsive behavior

- Mobile-first; a single breakpoint at **640px** (`sm`) increases cover size, shelf gaps, console padding, and outer spacing.
- The column stays centered and readable at all widths (`max-w-2xl`).

## Accessibility

- Decorative scene elements (shelves, console pieces, placeholders) are marked `aria-hidden`.
- Album links carry descriptive `aria-label`s ("Open {album} by {artist} on Spotify").
- Color is never the sole signal — states are reinforced by text, borders, and layout.

## File map

| Concern | Location |
|---|---|
| Design tokens & component CSS | `app/globals.css` |
| Fonts, metadata, root shell | `app/layout.tsx` |
| Page composition & auth branch | `app/page.tsx` |
| Wall, period label, data loading | `components/VinylWall.tsx` |
| Shelf grid + placeholders | `components/AlbumShelf.tsx` |
| Album cover + fallback | `components/AlbumCover.tsx` |
| Decorative console | `components/ListeningConsole.tsx` |
| Period header | `components/TimeRangeNavigator.tsx` |
| Share/export actions | `components/ShareWallActions.tsx` |
| Connect prompt | `components/ConnectSpotify.tsx` |
| Disconnect control | `components/LogoutButton.tsx` |
