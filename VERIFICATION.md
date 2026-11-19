# KU Car Club verification

Date: 2026-11-19. Windows, Node.js 24.18.0, local Playwright browsers. No external account was changed, no group was joined, and no site was deployed or pushed.

## Inputs and visual review

- Read `C:/Users/hp/Downloads/KU_CAR_CLUB_CODEX_SCRIPT.md` in full.
- Matched all 23 manifest photographs against `C:/Users/hp/Desktop/KU CAR CLUB` using SHA-256. Original photographs and full video are retained privately in ignored `originals/`.
- Reviewed the photograph contact sheet, video contact frames, and rendered desktop/mobile screenshots. Corrected the fifth photograph's mistaken Nissan description to Mercedes. Gallery images preserve natural ratios and original embedded marks. Featured photographs avoid cropping away the car subjects. The phone hero preserves the landscape video band above the copy.
- Fixed visibly corrupted menu/video symbols and footer punctuation. The current text wordmark is temporary: the supplied folder lacks the original A27 KU logo poster.
- `KU_CAR_CLUB_MASTER_IMPLEMENTATION.md`, its authoritative embedded asset map/QR, and `image(6).png` were not found in the supplied folder or searched Desktop/Downloads inputs. Exact master asset-ID mapping, logo crop/gear review and original-logo integration remain unverified. Existing local manifest IDs are preserved.
- The Instagram profile and opening-video reference could not be fetched publicly. No Instagram biography, post details, dates or statistics were inferred. Supercar Driver and PistonHeads were inspected for layout context only.

## Media pipeline

`npm run media -- 'C:\Users\hp\Desktop\KU CAR CLUB'` passed using all 23 source photographs and the exact supplied video filename. Regeneration now validates filenames/hashes before writing and retains descriptions/tags from the manifest instead of assigning them by directory order.

| Output | Details | Bytes |
| --- | --- | ---: |
| Desktop hero | 00:00–00:10, 1280×720, H.264/yuv420p, silent, faststart | 2,239,788 |
| Mobile hero | 00:00–00:10, 854×480, H.264/yuv420p, silent, faststart | 965,384 |
| Full source film | Deliberate playback only, preserved source | 7,686,837 |
| Early-frame poster | 00:00.4 JPEG | 44,640 |

The handheld excerpt uses a direct loop boundary; it is not a seamless edited camera movement. No source enlargement is used. JPEG/WebP derivatives strip image metadata and preserve visible photographer marks.

## Automated coverage

`npm run check`: 17 files, zero errors, warnings or hints. `npm run build`: all six static pages and robots/sitemap generated successfully.

The expanded `npm test` suite passed on the development server in Chromium, Firefox and WebKit. Normal muted autoplay played in all three headless browsers. Coverage includes:

- No horizontal overflow at 320×568, 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1366×768, 1440×900, 1920×1080, 844×390 and an intermediate 1100×800 viewport. Additional routes checked at 320, 768 and 1440 widths.
- Mobile menu expansion, Escape dismissal; gallery filtering to seven In focus photos; next/close actions, Escape and opener focus restoration; route headings; no JavaScript gallery and direct joining anchors.
- All tested primary joining and QR-card links match the shared WhatsApp invitation.
- Both shipped PNG and rasterized SVG decode independently at 225, 250, 270 and 530 pixels. A screenshot of the displayed QR also decodes correctly. This confirms the payload, not the invitation's current group status.
- Reduced-motion and simulated Save-Data prevent attaching an autoplay source. Manual play still attaches it. Rejected autoplay and genuinely missing media preserve the play control and hero joining action.
- Offscreen pause and return resume; simulated hidden-tab pause/resume; explicit pause persists after scrolling; full film has no source before deliberate play and pauses the hero; floating join stays clear of the film.
- 640×450 CSS-pixel viewport reflow representing 200% zoom on a 1280×900 window. This is reflow emulation, not an OS/browser zoom or physical-device test.

WebKit native media loading bypassed the initial request-abort simulation. The missing-media test now serves HTML pointing to genuinely nonexistent files and waits for an actual video error in every browser. An initial toolbar selector conflict was fixed by scoping menu tests and disabling Astro's development toolbar.

The final expanded suite also passed against the generated production build in all three browsers at the root path and at `/ku-review/`. The subdirectory build used a placeholder origin solely for local testing; canonical and robots/sitemap URLs included the expected base path. A root preview build was restored afterward, with noindex and `Disallow: /`. The final suite additionally checks a simulated `effectiveType: '2g'` signal and confirms that no autoplay source is attached.

## Local performance measurement

Production preview on loopback, cold Playwright Chromium context, 390×844 viewport, device scale 1, mobile emulation, no CPU or network throttling, sampled after 2.5 seconds:

| Measurement | Observed |
| --- | ---: |
| LCP | 324 ms |
| CLS | 0 |
| Resource transfer excluding MP4 and HTML document | 296,685 bytes |
| Autoplay mobile MP4 transfer including response overhead | 965,684 bytes |
| Generated JS total gzip | 1,665 bytes |

Fonts are locally hosted Latin subsets. These are local lab observations, not field Core Web Vitals or Lighthouse scores. INP, mobile Lighthouse performance/accessibility scores, physical iPhone/Android behavior, real slow-network playback, real browser zoom and screen-reader review have not been measured. Save-Data/connection and hidden-tab tests use simulated browser signals.

## Review boundaries

Use the README for local commands, asset updates and future production base-path configuration. Preview builds remain non-indexable when `SITE_URL` is unset. The site has no forms, accounts, membership database or payment service. Events remain an honest Instagram update state until confirmed records are supplied. The shareable `/join/` page is the Show join QR destination; no separate QR dialog is implemented or claimed.
