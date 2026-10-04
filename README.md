# Ticker

The public website and combined support/privacy page for Ticker, a tactile timer for iPhone and iPad.

This repository is intentionally separate from the private application source. It is intended to be published with GitHub Pages.

## Pages

- `index.html` — product landing page
- `support.html` — combined support, contact, and privacy-policy page
- `privacy.html` — compatibility redirect to the privacy section of `support.html`

## Device artwork

`assets/device-light.png` and `assets/device-dark.png` are transparent native
exports of Ticker's current Base device at 30 seconds, with fixed lighting.
Both are 1440 × 2760 pixels. The page follows their natural aspect ratio and
switches between them using the system light/dark preference.

Regenerate them from the app repository using `scripts/export-website-assets.sh`.
The exporter shares the app's actual device view, so its proportions, typography,
cutouts, and bevels stay consistent with the app. When dimensions change, update
the image's `width` and `height` attributes in `index.html` along with the PNGs.
