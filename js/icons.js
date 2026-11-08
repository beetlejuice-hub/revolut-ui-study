/* Inline SVG + brand assets used by the renderer.
   Brand marks are the real logos (fetched from each brand / Wikimedia Commons)
   and are used here only for this educational UI study. */
window.SVGI = {
  /* ---------- generic UI ---------- */
  apple: `<svg viewBox="0 0 384 512" width="18" height="24" fill="#fff" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`,

  fork: `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.6v5.2a2.1 2.1 0 0 0 4.2 0V3.6"/><path d="M8.1 3.6v16.8"/><path d="M16.4 3.6c1.8 1.4 2.5 3.5 2.5 6.1 0 1.7-.8 2.7-2.5 2.7v8"/></svg>`,

  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>`,

  arrowLeft: `<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>`,

  chevron: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`,

  arrowDown: `<svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M6 10.4 1.2 4.8h9.6z"/></svg>`,

  plus: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,

  /* White rounded square with the black R (app icon / Home tab) */
  homeR: `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#fff"/><g transform="translate(3.75 3.75) scale(.69)" fill="#0a0a0b"><path d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z"/></g></svg>`,

  checkCircle: `<svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="24"/><path d="m21 32 8 8 15-16"/></svg>`,

  faceid: `<svg viewBox="0 0 64 64" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V13a7 7 0 0 1 7-7h8"/><path d="M43 6h8a7 7 0 0 1 7 7v8"/><path d="M58 43v8a7 7 0 0 1-7 7h-8"/><path d="M21 58h-8a7 7 0 0 1-7-7v-8"/><path d="M21 24v7"/><path d="M43 24v7"/><path d="M32 25v9a2 2 0 0 1-2 2"/><path d="M23 43c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5"/></svg>`,

  personCheck: `<svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" aria-hidden="true"><circle cx="9.5" cy="8" r="3.4"/><path d="M3.4 19c0-3.4 2.7-6.1 6.1-6.1 1 0 1.9.2 2.7.6l-1.6 1.6c-.35-.1-.72-.15-1.1-.15A4.05 4.05 0 0 0 5.4 19z"/><circle cx="17.4" cy="16.4" r="4.3"/><path d="m15.5 16.4 1.35 1.35 2.5-2.7" stroke="#111" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  bag: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M18 6h-2a4 4 0 0 0-8 0H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-6-2a2 2 0 0 1 2 2h-4a2 2 0 0 1 2-2z"/></svg>`,

  basket: `<svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true"><path d="M22 9h-4.8l-3.1-4.6a1 1 0 0 0-1.4-.3l-1.2.8 2.6 4.1H4a2 2 0 0 0-2 2l1 8a2 2 0 0 0 2 1.7h14a2 2 0 0 0 2-1.7l1-8a2 2 0 0 0-2-2zm-10 9.5a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8z"/></svg>`,

  /* ---------- merchant marks that are not brand assets ---------- */
  malna: `<svg viewBox="0 0 30 34" width="26" height="30" aria-hidden="true">
    <text x="15" y="6.2" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="4.4" font-style="italic" fill="#c2185b">MÁLNA</text>
    <path d="M15 9.5c4.2 0 7.4 3 7.4 6.8 0 4.1-3.2 6.7-7.4 6.7s-7.4-2.6-7.4-6.7c0-3.8 3.2-6.8 7.4-6.8z" fill="#f7a8c4"/>
    <path d="M15 9.5c-1.1-1.5-.4-2.8 1.5-3.2" stroke="#7a4a2a" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <path d="M8.9 22.6h12.2l-4.5 8.6h-3.2z" fill="#e8c89a" stroke="#c9a97a" stroke-width=".7"/>
    <path d="M10.4 25.2h9.2M11.5 27.8h7" stroke="#c9a97a" stroke-width=".5"/>
  </svg>`,

  /* ---------- wealth rows ---------- */
  cash: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="11" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.6v4.8M18 9.6v4.8"/></svg>`,
  savings: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13.4c0-3.6 3.6-6.4 8-6.4s8 2.8 8 6.4c0 2-1 3.7-2.6 4.9V21h-3v-1.3c-.8.2-1.6.3-2.4.3s-1.6-.1-2.4-.3V21h-3v-2.7C5 17.1 4 15.4 4 13.4z"/><path d="M7.2 11.4h.01M16.8 11.4h.01"/><path d="M10.2 7.4 12 4l1.8 3.4"/></svg>`,
  loan: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 8.2h3.8a2.6 2.6 0 0 1 0 5.2H9.5z"/><path d="M11.4 6.4v1.8M11.4 13.4v1.8"/><path d="M8 20.4c1.6-1.4 3.1-2 4.6-2s3 .6 4.6 2"/></svg>`,
  invest: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18 9 11l4 4 7-8"/><path d="M15 7h5v5"/></svg>`,
  crypto: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 7.5h4.3a2.9 2.9 0 0 1 0 5.8H9V7.5zM9 13.3h4.9a2.9 2.9 0 0 1 0 5.8H9v-5.8zM11 5.5v2M11 19v2M14 5.5v2M14 19v2"/></svg>`,
  linked: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.3 1.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg>`
};
