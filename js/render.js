/* Rendering */
(function () {
  const D = window.DEMO;
  const S = window.SVGI;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = D.esc;

  let shownBalance = 0;
  let balanceRaf = null;

  /* ---------- icons ---------- */
  function txIcon(tx) {
    const key = (tx && tx.icon) || 'initials';
    if (key === 'initials') {
      return `<span class="ic ic-initials">${esc(D.initialsOf(tx.name))}${tx.badge === 'out' ? `<span class="badge-out">${S.arrow}</span>` : ''}</span>`;
    }
    const map = {
      apple: `<span class="ic ic-apple">${S.apple}</span>`,
      dining: `<span class="ic ic-dining">${S.fork}</span>`,
      malna: `<span class="ic ic-malna">${S.malna}</span>`,
      profi: `<span class="ic ic-profi"><span style="background:#e30613;color:#fff;font-size:6.5px;font-weight:800;letter-spacing:.02em;padding:2.5px 3px;border-radius:2px;transform:rotate(-3deg)">PROFI</span></span>`,
      aircash: `<span class="ic ic-aircash">aircash</span>`,
      bolt: `<span class="ic ic-bolt">Bolt</span>`,
      netflix: `<span class="ic ic-netflix">N</span>`,
      kaufland: `<span class="ic ic-kaufland">K</span>`
    };
    return map[key] || map.profi;
  }

  /* ---------- balance ---------- */
  function paintBalance(n) {
    shownBalance = Number(n) || 0;
    const p = D.moneyParts(shownBalance);
    const sign = p.neg ? '-' : '';
    const hero = $('#heroBalance');
    if (hero) {
      hero.querySelector('.int').textContent = sign + p.int;
      hero.querySelector('.dec').textContent = ',' + p.dec;
      hero.querySelector('.cur').textContent = D.state.currency;
    }
    const det = $('#detailBalance');
    if (det) {
      det.querySelector('.int').textContent = sign + p.int;
      det.querySelector('.dec').textContent = ',' + p.dec;
      det.querySelector('.cur').textContent = D.state.currency;
    }
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
        <span class="tsub">${esc(t.time)}</span>
      </span>
      <span class="tamt">${D.fmt(t.amount)}</span>
    </button>`;
  }

  function renderHome() {
    const s = D.state;
    const av = $('#avatarTxt');
    if (av) av.textContent = s.initials || 'AL';
    const kicker = $('#heroKicker');
    if (kicker) kicker.textContent = 'Personal · ' + (D.CUR[s.currency] || s.currency);
    const iban = $('#ibanText');
    if (iban) iban.textContent = s.iban;

    const up = $('#upcomingSlot');
    if (up) up.innerHTML = upcomingRow();

    const list = $('#txList');
    if (list) {
      const today = s.transactions.filter((t) => t.day === 'today').slice(0, 5);
      list.innerHTML = today.map(homeRow).join('');
    }
    paintBalance(shownBalance);
  }

  /* ---------- detail ---------- */
  function detailRow(t) {
    return `<button class="drow" data-tx="${t.id}">
      ${txIcon(t)}
      <span class="dmain">
        <span class="dname">${esc(t.name)}</span>
        <span class="dsub">${esc(D.shortTime(t.time))}</span>
      </span>
      <span class="damt">${D.fmt(t.amount)}</span>
    </button>`;
  }

  function section(title, total, rows, empty) {
    return `<section class="dsec">
      <div class="dsec-head"><h2>${esc(title)}</h2><span>${D.fmt(total)}</span></div>
      <div class="dcard">${rows || ''}${empty || ''}</div>
    </section>`;
  }

  function upcomingSection() {
    const u = D.state.upcoming;
    const row = `<button class="drow" data-tx="upcoming">
      ${txIcon({ name: u.name, icon: u.icon || 'apple' })}
      <span class="dmain">
        <span class="dname">${esc(u.name)}</span>
        <span class="dsub">${esc(u.detail)}</span>
      </span>
      <span class="damt">${D.fmt(u.amount)}</span>
    </button>`;
    const link = `<button class="dlink" id="schedLink"><span>Go to scheduled payments</span>${S.chevron}</button>`;
    return `<section class="dsec">
      <div class="dsec-head"><h2>Upcoming</h2><span>${D.fmt(u.amount)}</span></div>
      <div class="dcard">${row}${link}</div>
    </section>`;
  }

  function renderDetail() {
    const body = $('#detailBody');
    if (!body) return;
    const qEl = $('#detailSearch');
    const q = (qEl ? qEl.value : '').trim().toLowerCase();
    let html = '';

    if (q) {
      const hits = D.state.transactions.filter((t) => String(t.name).toLowerCase().includes(q));
      html = section('Results', D.sum(hits), hits.map(detailRow).join(''),
        hits.length ? '' : '<div class="dempty">No transactions found for “' + esc(qEl.value.trim()) + '”.</div>');
    } else {
      const today = D.state.transactions.filter((t) => t.day === 'today');
      const yest = D.state.transactions.filter((t) => t.day === 'yesterday');
      html += upcomingSection();
      html += section('Today', D.sum(today), today.map(detailRow).join(''),
        today.length ? '' : '<div class="dempty">No payments today.</div>');
      if (yest.length) html += section('Yesterday', D.sum(yest), yest.map(detailRow).join(''), '');
    }
    body.innerHTML = html;
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

  /* ---------- editor ---------- */
  function renderEditor() {
    const s = D.state;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
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
    txIcon, paintBalance, animateBalance, stopBalance,
    renderHome, renderDetail, renderPromos, renderEditor,
    tickClock, detailRow, section
  };
})();
