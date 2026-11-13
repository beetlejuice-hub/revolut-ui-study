# Revolut-style UI study

A high-fidelity, front-end recreation of the Revolut home screen and transaction list, built for an educational presentation. It is a static HTML/CSS/JS demo — no build step, no dependencies, no real banking.

> Not affiliated with Revolut. Revolut and its marks belong to Revolut Ltd. This is a non-commercial design study. Merchant logos are used only to identify the merchants shown in the reference screenshots; all trademarks belong to their owners.

## Run it

Open `index.html` directly in a browser, or serve the folder (recommended so changes persist):

```bash
cd revolut-demo
python3 -m http.server 8000
# open http://localhost:8000
```

The font is Inter, self-hosted in `fonts/` so the demo works offline.

## Install on your phone

Live app: **https://beetlejuice-hub.github.io/revolut-ui-study/**

- **iPhone / iPad (Safari):** open the link → Share → **Add to Home Screen**.
- **Android (Chrome):** open the link → ⋮ → **Add to Home screen** / **Install app**.

It opens full-screen with no browser chrome, works offline after the first load, and remembers your edits. To update it after changing files, bump `CACHE` in `sw.js` and redeploy.

## What is included

**Home**
- Blue gradient hero with `Personal · RON`, balance, IBAN and Accounts pill.
- Add money / Move / Details / More quick actions.
- Swipeable promo carousel with dots and dismissible cards.
- The three latest payments and a dismissible "Competitive loans." offer.
- Floating blurred tab bar (Home, Credit, Invest, Payments, Crypto, RevPoints).
- Scroll animation: the hero fades and collapses as the top bar becomes solid, then the list scrolls underneath.

**Transactions screen** (tap `See all`, `Search`, `Accounts`, `Details`, or the analytics icon)
- Black "Current balance" layout from the second reference image.
- Today / Yesterday groups with computed totals, merged with the home payments by date.
- Day totals are always neutral grey; individual incoming amounts stay green.
- Date labels are computed from each group's date, so "Today" / "Yesterday" stay correct.
- Tap the **+** button in the header to add a transaction on any custom date and pick its icon. A new day group is created automatically. History-only entries never appear on the home card and don't change the current balance.
- Tap any row for a transaction detail sheet (category, account, status, actions).

**Customisable numbers** (tap the avatar, the balance, or `More`; or press `E`)
- Initials, currency (lei / € / $ / £), balance, IBAN.
- Every transaction name and amount, with add/delete.
- Changes update the home and transaction screens live and persist in `localStorage`.
- `Reset demo` restores the reference data.

**Add money** (quick action)
- Quick amount chips and a custom amount; animates the balance and shows a toast.

## Demo flow for the presentation

1. Start on the home screen; let the balance count up and the promo carousel turn.
2. Scroll a little: the hero collapses, the top bar darkens, the transaction card comes up.
3. Tap `See all` for the black transaction list; search `profi`; tap a row.
4. Go back, tap the avatar (or the balance) and change the balance / a transaction amount live.
5. Tap `Add money`, add 250, and watch the hero animate.
6. `Reset demo` before the next run.

Keyboard: `E` opens the editor, `Esc` closes sheets/screens.

## Files

```
index.html
manifest.webmanifest  PWA metadata for home-screen install
sw.js                 offline cache / service worker
css/fonts.css         self-hosted Inter @font-face rules
css/base.css          shell, device frame, status bar, hero, quick actions
css/home.css          promo carousel, transaction card, offer, tab bar, icons
css/detail.css        black transaction screen + transaction sheet
css/sheets.css        editor / add-money sheets, toasts, responsive rules
js/icons.js           small inline SVGs (Apple, fork, badge, Málna mark)
js/data.js            default data, localStorage, money formatting
js/render.js          DOM rendering, balance animation
js/app.js             gestures, scroll animation, carousel, wiring
fonts/                Inter variable font (latin + latin-ext)
icons/                app icons (192, 512, maskable, Apple touch)
```

## Notes

- The Revolut "R" mark in the tab bar uses the Simple Icons path (CC0). Inter is licensed under the SIL Open Font License.
- Merchant icons are cropped from the supplied reference screenshots and used only to identify the merchants in this non-commercial study; all trademarks belong to their owners.
- The layout is designed at 393 × 852 and scales down as one piece on desktop; below 760 px it goes full-bleed like a real phone.
- When installed, the fake status bar is hidden and the layout respects the phone's safe areas (notch and home indicator).
- Everything is local and works offline after the first load.
