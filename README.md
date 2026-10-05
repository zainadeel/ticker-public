# Ticker

The public website and combined support/privacy page for Ticker, a tactile timer for iPhone and iPad.

This repository is intentionally separate from the private application source. It is intended to be published with GitHub Pages.

## Pages

- `index.html` — product landing page
- `support.html` — combined support, contact, and privacy-policy page
- `privacy.html` — compatibility redirect to the privacy section of `support.html`

## Interactive device

The landing page retains its original layout and includes a draggable Base dial.
`dial.js` uses the app's shipped detents: seconds in one-second steps, then
1/5/10/…/55 minutes, then 1–6 hours. The ring rotates clockwise while the native
number plane rotates the other way, and it snaps to a detent on release. Arrow
keys, Page Up/Down and Home/End work when the ring has keyboard focus. The center
button is decorative. The small support dot links to the support page.

Appearance follows the system. There are no extra controls or instruction text.
For inspecting the two appearances directly, use `?appearance=light` or
`?appearance=dark`. Lighting stays fixed; no device sensors or parallax are used.

`assets/dial-labels-light.png` and `dial-labels-dark.png` reuse the app's native
number and unit shapes at 1200 × 1200 pixels. `device-frame-light.png` and
`device-frame-dark.png` reuse the actual case, cuts, speaker, button and support
dot at 1440 × 2760 pixels. The annular windows remain transparent right up to
the cut line. Browser bevels use the same smooth fade and Overlay 50%, Screen /
Multiply 10% layering as the app, so they blend above the paint without clipping
its rounded ends. The 5% Overlay glass tint and angular coating stay stationary.
The cast shadow uses the app's fixed maximum offset, blur and opacity.

`device-light.png` and `device-dark.png` are complete native 30-second exports
used as a fallback when JavaScript or an interactive image cannot load.

Regenerate them from the app repository using `scripts/export-website-assets.sh`.
The exporter shares the app's actual device view and drawing components; it is
opt-in test code and does not change the shipped app. Copy all six exported PNGs
when refreshing the artwork. Keep the SVG geometry and CSS ratios consistent
with the app's `LayoutConstants` when its proportions change.
