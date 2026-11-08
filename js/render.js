/* Rendering */
(function () {
  const D = window.DEMO;
  const S = window.SVGI;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = D.esc;

  let shownBalance = 0;
  let balanceRaf = null;

  /* Real brand marks. Files live in img/logos and are only used for this
     educational UI study — all trademarks belong to their owners. */
  const LOGOS = {
    lidl: { src: 'img/logos/lidl-google.png', cls: 'lg-lidl' },
    kaufland: { src: 'img/logos/kaufland-google.png', cls: 'lg-kaufland' },
    claude: { src: 'img/logos/claude-symbol.svg', cls: 'lg-claude' },
    anthropic: { src: 'img/logos/anthropic-google.png', cls: 'lg-anthropic' },
    netflix: { src: 'img/logos/netflix-google.png', cls: 'lg-netflix' },
    bolt: { src: 'img/logos/bolt-google.png', cls: 'lg-bolt' },
    petrom: { src: 'img/logos/petrom-google.png', cls: 'lg-petrom' },
    profi: { src: 'img/logos/profi-512.png', cls: 'lg-profi' },
    eventum: { src: 'img/logos/eventum.webp', cls: 'lg-eventum' },
    hamm: { src: 'img/logos/hamm-512.png', cls: 'lg-hamm' },
    aircash: { src: 'img/logos/aircash-google.png', cls: 'lg-aircash' }
  };

  /* ---------- icons ---------- */
  function txIcon(tx) {
    const key = (tx && tx.icon) || 'initials';
    if (key === 'initials') {
      return `<span class="ic ic-initials">${esc(D.initialsOf(tx.name))}${tx.badge === 'out' ? `<span class="badge-out">${S.arrow}</span>` : ''}</span>`;
    }
    if (key === 'ler') {
      return `<span class="ic ic-ler"><span class="ler-txt">Ler</span></span>`;
    }
    if (key === 'mag') {
      return `<span class="ic ic-mag">${S.basket}</span>`;
    }
    if (key === 'dining') {
      return `<span class="ic ic-dining">${S.fork}</span>`;
    }
    if (key === 'malna') {
      return `<span class="ic ic-malna">${S.malna}</span>`;
    }
    if (key === 'apple') {
      return `<span class="ic ic-apple">${S.apple}</span>`;
    }
    const logo = LOGOS[key];
    if (logo) {
      return `<span class="ic ic-logo ${logo.cls}"><img src="${logo.src}" alt="" loading="lazy" decoding="async"></span>`;
    }
    return `<span class="ic ic-initials">${esc(D.initialsOf(tx.name))}</span>`;
  }

  /* ---------- balance ---------- */
  function balanceHTML(n) {
    const p = D.moneyParts(n);
    return `<span class="int">${p.neg ? '-' : ''}${p.int}</span><span class="dec">,${p.dec}</span><span class="cur">${D.state.currency}</span>`;
  }

  function paintDetailBalance(n) {
    const html = balanceHTML(n);
    const det = $('#detailBalance');
    if (det) det.innerHTML = html;
    const mini = $('#detailMiniBalance');
    if (mini) mini.textContent = D.fmt(n);
  }

  function paintBalance(n) {
    shownBalance = Number(n) || 0;
    const hero = $('#heroBalance');
    if (hero) hero.innerHTML = balanceHTML(shownBalance);
    paintDetailBalance(shownBalance);
    const addCur = $('#addCur');
    if (addCur) addCur.textContent = D.state.currency;
  }

  function animateBalance(to, dur) {
    if (balanceRaf) cancelAnimationFrame(balanceRaf);
    const from = shownBalance;
    const target = Number(to) || 0;
    const t0 = performance.now();
    const length = dur == null ? 900 : dur;
    if (length <= 0 || from === target) { paintBalance(target); return; }
    const step = (t) => {
      const k = Math.min(1, (t - t0) / length);
      const e = 1 - Math.pow(1 - k, 3);
      paintBalance(from + (target - from) * e);
      if (k < 1) balanceRaf = requestAnimationFrame(step);
      else { balanceRaf = null; paintBalance(target); }
    };
    balanceRaf = requestAnimationFrame(step);
  }

  function stopBalance() {
    if (balanceRaf) cancelAnimationFrame(balanceRaf);
    balanceRaf = null;
  }

  /* ---------- home ---------- */
  function upcomingRow() {
    const u = D.state.upcoming;
    return `<button class="upcoming" data-tx="upcoming">
      ${txIcon({ name: u.name, icon: u.icon || 'apple' })}
      <span class="tmain">
        <span class="tname">1 upcoming payment</span>
        <span class="tsub">${esc(u.due)}</span>
      </span>
      <span class="tamt">${D.fmt(u.amount)}</span>
    </button>`;
  }

  function homeRow(t) {
    return `<button class="trow" data-tx="${t.id}">
      ${txIcon(t)}
      <span class="tmain">
        <span class="tname">${esc(t.name)}</span>
        <span class="tsub">${esc(D.txWhen(t))}</span>
      </span>
      <span class="tamt">${D.fmt(t.amount)}</span>
    </button>`;
  }

  function renderHome() {
    const s = D.state;
    const av = $('#avatarTxt');
    if (av) av.textContent = s.initials || 'AL';
    const lockAv = $('#lockAvatar');
    if (lockAv) lockAv.textContent = s.initials || 'AL';
    const kicker = $('#heroKicker');
    if (kicker) kicker.textContent = 'Personal · ' + (D.CUR[s.currency] || s.currency);
    const iban = $('#ibanText');
    if (iban) iban.textContent = s.iban;

    const up = $('#upcomingSlot');
    if (up) up.innerHTML = upcomingRow();

    const list = $('#txList');
    if (list) list.innerHTML = s.transactions.slice(0, 3).map(homeRow).join('');

    renderCards();
    renderWealth();
    renderSpent();
    paintBalance(shownBalance);
  }

  /* ---------- cards ---------- */
  function cardArt(c) {
    if (c.kind === 'original') {
      return `<div class="mini-card original"><span class="mc-brand">R</span><span class="mc-chip"></span><span class="mc-num">··8109</span></div>`;
    }
    if (c.kind === 'disposable') {
      return `<div class="mini-card disposable"><span class="mc-brand">R</span><span class="mc-num">····</span></div>`;
    }
    return `<div class="mini-card get"><span class="mc-plus">${S.plus}</span></div>`;
  }

  function renderCards() {
    const row = $('#cardsRow');
    if (!row) return;
    row.innerHTML = D.CARDS.map((c) => `<button class="card-tile" data-card="${esc(c.key)}">
      ${cardArt(c)}
      <span class="card-name">${esc(c.name)}</span>
      ${c.sub ? `<span class="card-sub">${esc(c.sub)}</span>` : ''}
    </button>`).join('');
  }

  /* ---------- wealth ---------- */
  function renderWealth() {
    const box = $('#wealthRows');
    if (!box) return;
    const total = $('#wealthTotal');
    if (total) total.textContent = D.WEALTH.total + ' ' + D.state.currency;
    box.innerHTML = D.WEALTH.rows.map((r) => `<button class="wrow" data-wealth="${esc(r.key)}">
      <span class="wic wic-${esc(r.key)}">${S[r.icon] || ''}</span>
      <span class="wmain">
        <span class="wname">${esc(r.name)}</span>
        ${r.sub ? `<span class="wsub">${esc(r.sub)}</span>` : ''}
      </span>
      ${r.value ? `<span class="wval">${esc(r.value)}</span>` : `<span class="wchev">${S.chevron}</span>`}
    </button>`).join('');
  }

  /* ---------- spent this month ---------- */
  function renderSpent() {
    const total = $('#spentTotal');
    if (total) total.textContent = D.SPENT.total + ' ' + D.state.currency;
    const delta = $('#spentDelta');
    if (delta) delta.innerHTML = `${S.arrowDown}<span>${D.SPENT.delta} ${esc(D.state.currency)}</span>`;
    const limit = $('#spentLimit');
    if (limit) limit.textContent = D.SPENT.limit;

    const chart = $('#spentChart');
    if (!chart) return;
    const bars = [20, 31, 17, 38, 26, 22, 42, 30, 25, 47, 35, 28, 52, 39, 33, 57, 44, 37, 61, 48, 41, 66, 53, 46, 72, 84];
    const W = 340;
    const H = 96;
    const gap = 5.4;
    const bw = (W - gap * (bars.length - 1)) / bars.length;
    const rects = bars.map((v, i) => {
      const h = (v / 100) * H;
      const x = i * (bw + gap);
      const y = H - h;
      const cls = i === bars.length - 1 ? 'sbar hot' : 'sbar';
      return `<rect class="${cls}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${h.toFixed(2)}" rx="${(bw / 2).toFixed(2)}"/>`;
    }).join('');
    chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8fa6ff"/>
          <stop offset="1" stop-color="#3b56ff"/>
        </linearGradient>
      </defs>
      ${rects}
    </svg>`;
  }

  /* ---------- promos ---------- */
  function renderPromos() {
    const track = $('#promoTrack');
    if (!track) return;
    track.innerHTML = D.PROMOS.map((p) => `<article class="promo" data-promo="${p.id}">
      <button class="promo-x" data-close-promo aria-label="Dismiss">×</button>
      <div class="promo-copy"><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>
      <div class="promo-art">${p.art}</div>
    </article>`).join('');
  }

  /* ---------- history ---------- */
  function detailRow(t) {
    const sub = t.note
      ? t.note + (t.time ? ' · ' + t.time : '')
      : D.shortTime(t.time);
    const alt = t.alt ? `<span class="amt-alt">${esc(t.alt)}</span>` : '';
    const amt = t.hideAmount
      ? '<span class="damt muted">—</span>'
      : `<span class="damt${t.amount > 0 ? ' positive' : ''}">${D.fmtSigned(t.amount)}${alt}</span>`;
    return `<button class="drow" data-tx="${t.id}">
      ${txIcon(t)}
      <span class="dmain">
        <span class="dname">${esc(t.name)}</span>
        <span class="dsub">${esc(sub)}</span>
      </span>
      ${amt}
    </button>`;
  }

  function groupHTML(g) {
    const total = D.sum(g.rows);
    const totalHTML = g.rows.length
      ? `<span class="dgroup-total${total > 0 ? ' positive' : ''}">${D.fmtSigned(total)}</span>`
      : '';
    const rows = g.rows.length
      ? g.rows.map(detailRow).join('')
      : `<div class="dempty">No transactions in ${esc(g.label)}.</div>`;
    return `<section class="dgroup" data-key="${esc(g.key)}" data-month="${esc(g.month)}" data-label="${esc(g.label)}" data-balance="${Number(g.balance) || 0}">
      <div class="dgroup-head"><h2>${esc(g.label)}</h2>${totalHTML}</div>
      <div class="dcard">${rows}</div>
    </section>`;
  }

  function renderDetail() {
    const body = $('#detailBody');
    if (!body) return;
    const groups = D.historyGroups();

    /* Walk backwards from the current balance: the header shows the balance
       at the start of the visible group, before its transactions. */
    let running = Number(D.state.balance) || 0;
    const enriched = groups.map((g) => {
      running -= D.sum(g.rows);
      return Object.assign({}, g, { balance: running });
    });

    const withData = {};
    groups.forEach((g) => { withData[g.month] = true; });
    const empties = D.MONTHS
      .filter((m) => !withData[m.key])
      .slice()
      .reverse()
      .map((m) => ({ key: 'empty-' + m.key, label: m.label, month: m.key, rows: [], empty: true, balance: running }));

    body.innerHTML = enriched.concat(empties).map(groupHTML).join('');
  }

  function renderMonthPills() {
    const el = $('#monthPills');
    if (!el) return;
    el.innerHTML = D.MONTHS.map((m) => `<button class="mpill" data-month="${m.key}">${esc(m.label)}</button>`).join('');
  }

  /* ---------- editor ---------- */
  function renderEditor() {
    const s = D.state;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('fName', s.name);
    set('fInitials', s.initials);
    set('fBalance', s.balance);
    set('fCurrency', s.currency);
    set('fIban', s.iban);
    set('fUpName', s.upcoming.name);
    set('fUpAmount', s.upcoming.amount);
    const count = $('#txCount');
    if (count) count.textContent = s.transactions.length + (s.transactions.length === 1 ? ' item' : ' items');
    const box = $('#txEditor');
    if (!box) return;
    box.innerHTML = s.transactions.map((t) => `<div class="edit-row" data-id="${t.id}">
      <input class="e-name" value="${esc(t.name)}" placeholder="Name" aria-label="Transaction name">
      <input class="e-amt" type="number" step="0.01" inputmode="decimal" value="${t.amount}" aria-label="Amount">
      <button class="e-del" data-del="${t.id}" aria-label="Delete transaction">×</button>
    </div>`).join('');
  }

  /* ---------- clock ---------- */
  function tickClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    $$('.js-time').forEach((el) => { el.textContent = hh + ':' + mm; });
  }

  window.RENDER = {
    txIcon, balanceHTML, paintBalance, paintDetailBalance, animateBalance, stopBalance,
    renderHome, renderCards, renderWealth, renderSpent, renderDetail, renderPromos,
    renderMonthPills, renderEditor, tickClock, detailRow, groupHTML
  };
})();
