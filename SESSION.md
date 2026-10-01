# Session — Microbit Animation Library (2026-09-20)

## What this is
Dotmatrix-style gallery site for BBC micro:bit 5x5 LED animations.
Preview → copy MakeCode JS `function Name() { ... basic.showLeds(...) }` → paste into MakeCode.

## Files (in C:\Users\Rushabh\Downloads\AI\Microbit Animation)
- `index.html` — gallery + detail modal + builder modal + #contribute section
- `styles.css` — dark neon theme + builder styles
- `animations.js` — 76 animations, 335 frames, 8 cats + `generateMicrobitFunction()`, `funcNameFromId()`, `framesToShowLeds()`
- `app.js` — gallery render, live previews, search/cats/speed/loop-mode, modal, ★ My Creations support
- `builder.js` — Create flow: 5x5 painter, MakeCode parser, localStorage customs, copy entry/JSON/GitHub issue. Set `GITHUB_REPO` const to enable one-click issues (currently "").
- `CONTRIBUTING.md` — submission rules + schemas

## Verified
- `node --check` OK for animations.js, app.js, builder.js
- All frames 5x5 `#/.` only
- Roundtrip generate→parse = YES (4/4 blocks, boom anim)
- index.html includes builder.js, #builder modal, #contribute

## Pending / next ideas (not started)
- Deploy to GitHub Pages
- Python `display.show()` export
- Delete/edit My Creations items in UI
- Set real `GITHUB_REPO` value
- More animations on request

## How to run
Double-click `index.html` (offline, no build). Or `npx serve .`
