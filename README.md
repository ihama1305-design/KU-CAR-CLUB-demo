# KU Car Club

Static Astro + TypeScript website with supplied KU photography, an autoplay video opening, a filterable gallery, and direct WhatsApp joining. Home, About, Events, Gallery, Join QR, and 404 routes are included.

## Run locally

Use Node.js 22.23.4+ (this checkout was verified with Node.js 24.18.0), with npm 9.6.5+.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4321/. Production commands:

```powershell
npm run check
npm run build
npm run preview
```

The static output is `dist/`. Keep originals and reference images outside `public/`.

## Content and joining

- `src/data/club.json` is the shared source for club name, tagline, Instagram, and the exact WhatsApp invitation. Primary join anchors work without JavaScript and go directly to WhatsApp.
- `src/data/media.json` is the asset manifest: stable IDs, original filenames, SHA-256 hashes, dimensions, available derivative widths, alt text, and gallery tags. The 23 inputs match the supplied Desktop folder by hash. `local-17` is the initial blue Mustang selection; `local-23` remains an alternate.
- `src/data/club.ts` defines the event data boundary. No event dates have been supplied; Events deliberately directs visitors to Instagram. Before adding events, confirm title, date/time, location and a public source, then render records from this typed data. Never infer dates or ownership from photographs.
- Photograph marks stay embedded in the supplied images. Preserve them when selecting crops. Credit text supplied later should accompany each asset and its lightbox caption.

## Rebuild media

The checked-in derivatives are sufficient to run the website. Regenerate only when changing media or the invitation:

```powershell
npm run media -- 'C:\Users\hp\Desktop\KU CAR CLUB'
```

With originals already in `originals/`, use `npm run media`. The script validates filenames and hashes before writing derivatives, preserves original photos/video, normalizes orientation, removes metadata from image derivatives, and generates WebP/JPEG without enlargement. New or changed photographs require a deliberate manifest update with reviewed descriptions and tags; adding a random file to the folder does not relabel the gallery.

V01 uses `WhatsApp Video 2026-11-19 at 2.39.22 AM.mp4`. The hero uses 00:00–00:10, silent H.264/yuv420p/faststart at 1280×720 and 854×480. The poster is from 00:00.4. The full source is loaded only after deliberate play. QR outputs use the shared WhatsApp value, Q correction and four-module white margins; rerun browser verification after regeneration.

## Preview and production configuration

Without `SITE_URL`, builds emit noindex and disallow crawling. For a future domain-root production build:

```powershell
$env:SITE_URL = 'https://your-real-club-domain.example'
$env:BASE_PATH = '/'
npm run build
```

For a GitHub project path, set `SITE_URL` to the actual HTTPS origin and `BASE_PATH` to the actual repository path, such as `/your-ku-repository/`. `url()` prefixes navigation, media and downloads. Do not use the unrelated food site's path. Remove these environment variables for a non-indexable review build. No external deployment or push is included in this work.

## Verification

Run a dev or preview server in another terminal, then:

```powershell
npm test
# To test the generated production build on a separate preview port:
node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322
# In another terminal:
$env:TEST_URL = 'http://127.0.0.1:4322'
npm test
```

Install missing test browsers with `npx playwright install chromium firefox webkit`. Tests never join the WhatsApp group. Reports and screenshots go into ignored `test-results/`; actual results and input gaps are in `VERIFICATION.md`.

## Inputs still needed

The supplied `KU_CAR_CLUB_CODEX_SCRIPT.md` was read in full. Its referenced `KU_CAR_CLUB_MASTER_IMPLEMENTATION.md`, embedded asset map, and A27 `image(6).png` logo poster were absent from the supplied media folder and the searched Downloads/Desktop locations. The current text wordmark is a temporary treatment, not the requested original KU logo. When A27 is supplied, preserve it privately and visually review a separate header crop retaining the complete lettering and gear. Its old QR must never replace the current invitation. Exact matching against the unavailable master asset map remains pending.

Instagram and the opening-video reference could not be retrieved publicly during this session. No profile facts or captions were invented. Supercar Driver and PistonHeads were inspected as layout references only; their content and media are not used.

## Future CMS boundary

Approved media, stories and events can later be loaded at build time from a CMS adapter returning typed records. Keep credentials in build-time server environment variables and validate required fields/source URLs before publication. This first release has no membership database, login, payments or forms; WhatsApp handles joining. Accounts or RSVPs require a separately specified backend and data policy.
