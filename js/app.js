/* Wiring, gestures and animations */
(function () {
  const D = window.DEMO;
  const R = window.RENDER;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  const phone = $('#phone');
  const home = $('#homeScreen');
  const heroBody = $('#heroBody');
  const detail = $('#detailScreen');
  const detailScroll = $('#detailScroll');
  const detailSearch = $('#detailSearch');
  const backdrop = $('#backdrop');
  const toastEl = $('#toast');

  let detailOpen = false;
  let activeSheet = null;
  let scrollRaf = null;
  let promoIndex = 0;
  let promoPausedUntil = 0;
  let toastTimer = null;
  let dragX = null;
  let addValue = 100;

  /* ============ toast ============ */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1900);
  }

  /* ============ sheets ============ */
  function openSheet(el) {
    if (!el) return;
    if (activeSheet && activeSheet !== el) activeSheet.classList.remove('show');
    activeSheet = el;
    backdrop.classList.add('show');
    el.classList.add('show');
  }
  function closeSheets() {
    backdrop.classList.remove('show');
    if (activeSheet) activeSheet.classList.remove('show');
    activeSheet = null;
  }

  /* ============ detail screen ============ */
  function openDetail(focusSearch) {
    if (activeSheet) closeSheets();
    detailOpen = true;
    phone.classList.add('detail-open');
    detail.classList.add('open');
    detail.setAttribute('aria-hidden', 'false');
    detailScroll.scrollTop = 0;
    R.renderDetail();
    if (focusSearch) setTimeout(() => detailSearch.focus({ preventScroll: true }), 470);
  }
  function closeDetail() {
    detailOpen = false;
    phone.classList.remove('detail-open');
    detail.classList.remove('open');
    detail.setAttribute('aria-hidden', 'true');
    if (detailSearch.value) {
      detailSearch.value = '';
      R.renderDetail();
    }
  }

  /* ============ scroll / hero collapse ============ */
  function onScroll() {
    const y = home.scrollTop;
    const bar = Math.min(1, y / 70);
    phone.style.setProperty('--sp', String(bar));
    const fade = Math.min(1, Math.max(0, (y - 105) / 135));
    heroBody.style.opacity = String(1 - fade);
    heroBody.style.transform = `translate3d(0,${(-y * 0.12).toFixed(1)}px,0) scale(${(1 - Math.min(1, y / 2600)).toFixed(3)})`;
  }
  home.addEventListener('scroll', () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = null; onScroll(); });
  }, { passive: true });

  /* ============ promos ============ */
  function promoCards() { return $$('#promoTrack .promo'); }

  function buildDots() {
    const dots = $('#promoDots');
    const cards = promoCards();
    if (promoIndex >= cards.length) promoIndex = 0;
    dots.innerHTML = cards.map((_, i) => `<button class="dot${i === promoIndex ? ' on' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join('');
    dots.classList.toggle('gone', cards.length < 2);
    $('#promoWrap').classList.toggle('gone', cards.length === 0);
  }

  function syncDots() {
    const track = $('#promoTrack');
    const cards = promoCards();
    if (!cards.length) return;
    const x = track.scrollLeft;
    let best = 0;
    let bd = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs((c.offsetLeft - 16) - x);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== promoIndex) {
      promoIndex = best;
      $$('#promoDots .dot').forEach((d, i) => d.classList.toggle('on', i === best));
    }
  }

  function scrollToPromo(i) {
    const track = $('#promoTrack');
    const cards = promoCards();
    if (!cards[i]) return;
    promoIndex = i;
    track.scrollTo({ left: Math.max(0, cards[i].offsetLeft - 16), behavior: 'smooth' });
    $$('#promoDots .dot').forEach((d, k) => d.classList.toggle('on', k === i));
  }

  /* ============ add money ============ */
  function setAddValue(v) {
    addValue = Math.max(0, Number(v) || 0);
    const input = $('#addAmount');
    if (input && document.activeElement !== input) input.value = addValue;
    $$('#addChips button').forEach((b) => b.classList.toggle('on', Number(b.dataset.amt) === addValue));
  }
  function openAddSheet() {
    setAddValue(100);
    openSheet($('#addSheet'));
    const input = $('#addAmount');
    setTimeout(() => { input.focus({ preventScroll: true }); input.select(); }, 380);
  }

  /* ============ transaction sheet ============ */
  function openTx(id) {
    let t;
    if (id === 'upcoming') {
      const u = D.state.upcoming;
      t = { name: u.name, amount: u.amount, time: u.detail, cat: 'Subscription', icon: u.icon || 'apple' };
    } else {
      t = D.state.transactions.find((x) => x.id === id);
    }
    if (!t) return;
    $('#txSheetBody').innerHTML = `
      <button class="sheet-close" data-close style="position:absolute;top:12px;right:16px" aria-label="Close">×</button>
      <div class="txs-icon">${R.txIcon(t)}</div>
      <div class="txs-amt">${D.fmt(t.amount)}</div>
      <div class="txs-name">${D.esc(t.name)}</div>
      <div class="txs-time">${D.esc(t.time || '')} · Completed</div>
      <div class="txs-rows">
        <div><span>Category</span><b>${D.esc(t.cat || 'Payment')}</b></div>
        <div><span>Account</span><b>Personal · ${D.esc(D.CUR[D.state.currency] || D.state.currency)}</b></div>
        <div><span>Status</span><b class="ok">Completed</b></div>
      </div>
      <div class="txs-actions">
        <button data-act="Split">Split</button>
        <button data-act="Repeat">Repeat</button>
        <button data-act="Receipt">Receipt</button>
      </div>`;
    openSheet($('#txSheet'));
  }

  /* ============ editor ============ */
  function openEditor(focus) {
    R.renderEditor();
    openSheet($('#sheet'));
    if (focus === 'balance') {
      setTimeout(() => {
        const el = $('#fBalance');
        el.focus({ preventScroll: true });
        el.select();
      }, 400);
    }
  }

  /* ============ events: chrome ============ */
  $('#avatarBtn').addEventListener('click', () => openEditor());
  $('#heroBalance').addEventListener('click', () => openEditor('balance'));
  $('#heroBalance').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditor('balance'); }
  });
  $('#ibanBtn').addEventListener('click', () => {
    const iban = D.state.iban;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(iban).then(() => toast('IBAN copied')).catch(() => toast(iban));
    } else {
      toast(iban);
    }
  });
  $('#accountsBtn').addEventListener('click', () => openDetail());
  $('#searchHome').addEventListener('click', () => openDetail(true));
  $('#statsBtn').addEventListener('click', () => openDetail());
  $('#cardBtn').addEventListener('click', () => toast('Cards — demo only'));
  $('#seeAll').addEventListener('click', () => openDetail());
  $('#backBtn').addEventListener('click', closeDetail);

  $$('.action').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'add') openAddSheet();
      else if (a === 'details') openDetail();
      else if (a === 'move') toast('Move money — demo only');
      else openEditor();
    });
  });

  /* ============ events: promo ============ */
  const track = $('#promoTrack');
  track.addEventListener('pointerdown', () => { promoPausedUntil = Date.now() + 12000; });
  track.addEventListener('scroll', () => requestAnimationFrame(syncDots), { passive: true });
  $('#promoDots').addEventListener('click', (e) => {
    const b = e.target.closest('.dot');
    if (!b) return;
    promoPausedUntil = Date.now() + 10000;
    scrollToPromo(Number(b.dataset.i));
  });
  track.addEventListener('click', (e) => {
    const x = e.target.closest('[data-close-promo]');
    if (!x) return;
    const card = x.closest('.promo');
    card.style.transition = 'opacity .24s ease, transform .24s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(.94)';
    setTimeout(() => {
      card.remove();
      promoIndex = 0;
      buildDots();
      track.scrollTo({ left: 0, behavior: 'auto' });
    }, 240);
  });

  /* ============ events: tabs ============ */
  $('#tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b) return;
    $$('.tab').forEach((t) => t.classList.toggle('active', t === b));
    const name = b.dataset.tab;
    if (name === 'Home') {
      home.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast(name + ' — not part of this demo');
    }
  });

  /* ============ events: detail ============ */
  detailSearch.addEventListener('input', R.renderDetail);
  $('#filterBtn').addEventListener('click', () => toast('Filters — demo only'));

  /* edge-swipe back */
  detail.addEventListener('pointerdown', (e) => {
    if (!detailOpen || e.clientX > 36) return;
    dragX = e.clientX;
    detail.style.transition = 'none';
  });
  detail.addEventListener('pointermove', (e) => {
    if (dragX == null) return;
    const dx = Math.max(0, e.clientX - dragX);
    detail.style.transform = `translateX(${dx}px)`;
  });
  function endDrag(e) {
    if (dragX == null) return;
    const dx = Math.max(0, (e.clientX || 0) - dragX);
    dragX = null;
    if (dx > 90) {
      detail.style.transition = 'transform .3s cubic-bezier(.32,.72,0,1)';
      detail.style.transform = 'translateX(102%)';
      setTimeout(() => {
        closeDetail();
        detail.style.transition = '';
        detail.style.transform = '';
      }, 300);
    } else {
      detail.style.transition = '';
      detail.style.transform = '';
    }
  }
  detail.addEventListener('pointerup', endDrag);
  detail.addEventListener('pointercancel', endDrag);

  /* ============ events: delegated taps ============ */
  document.addEventListener('click', (e) => {
    const tx = e.target.closest('[data-tx]');
    if (tx) { openTx(tx.dataset.tx); return; }
    if (e.target.closest('#schedLink')) { toast('Scheduled payments — demo only'); return; }
    if (e.target.closest('[data-act]')) { toast(e.target.closest('[data-act]').dataset.act + ' — demo only'); return; }
    if (e.target.closest('[data-close]')) { closeSheets(); return; }
  });
  backdrop.addEventListener('click', closeSheets);

  /* ============ events: editor fields ============ */
  const saveAndPaint = () => { D.save(); R.renderHome(); R.renderDetail(); };

  $('#fInitials').addEventListener('input', (e) => {
    D.state.initials = (e.target.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2);
    D.save();
    const av = $('#avatarTxt');
    if (av) av.textContent = D.state.initials || 'AL';
  });

  $('#fCurrency').addEventListener('change', (e) => {
    D.state.currency = e.target.value;
    saveAndPaint();
  });

  $('#fBalance').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    if (!isFinite(v)) return;
    R.stopBalance();
    D.state.balance = Math.round(v * 100) / 100;
    D.save();
    R.paintBalance(D.state.balance);
  });

  $('#fIban').addEventListener('input', (e) => {
    D.state.iban = e.target.value;
    saveAndPaint();
  });

  $('#fUpName').addEventListener('input', (e) => {
    D.state.upcoming.name = e.target.value || 'Payment';
    saveAndPaint();
  });

  $('#fUpAmount').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    if (!isFinite(v)) return;
    D.state.upcoming.amount = Math.round(v * 100) / 100;
    saveAndPaint();
  });

  $('#txEditor').addEventListener('input', (e) => {
    const row = e.target.closest('.edit-row');
    if (!row) return;
    const t = D.state.transactions.find((x) => x.id === row.dataset.id);
    if (!t) return;
    if (e.target.classList.contains('e-name')) t.name = e.target.value || 'Payment';
    if (e.target.classList.contains('e-amt')) t.amount = Math.round((parseFloat(e.target.value) || 0) * 100) / 100;
    D.save();
    R.renderHome();
    R.renderDetail();
  });

  $('#txEditor').addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    D.state.transactions = D.state.transactions.filter((t) => t.id !== del.dataset.del);
    D.save();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    toast('Transaction removed');
  });

  $('#addTx').addEventListener('click', () => {
    const t = {
      id: D.uid(), name: 'New payment', amount: -10,
      time: 'Today, just now', day: 'today', icon: 'initials', cat: 'Payment'
    };
    D.state.transactions.unshift(t);
    D.save();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    const input = document.querySelector(`.edit-row[data-id="${t.id}"] .e-name`);
    if (input) { input.focus(); input.select(); }
  });

  $('#resetBtn').addEventListener('click', () => {
    D.reset();
    R.stopBalance();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    R.paintBalance(D.state.balance);
    toast('Demo reset');
  });

  /* ============ events: add money ============ */
  $('#addChips').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-amt]');
    if (!b) return;
    setAddValue(Number(b.dataset.amt));
    const input = $('#addAmount');
    input.value = addValue;
  });
  $('#addAmount').addEventListener('input', (e) => {
    addValue = Math.max(0, parseFloat(e.target.value) || 0);
    $$('#addChips button').forEach((b) => b.classList.toggle('on', Number(b.dataset.amt) === addValue));
  });
  $('#addSubmit').addEventListener('click', () => {
    if (addValue <= 0) { toast('Enter an amount'); return; }
    D.state.balance = Math.round((D.state.balance + addValue) * 100) / 100;
    D.save();
    R.animateBalance(D.state.balance, 750);
    const added = D.fmt(addValue).replace('-', '');
    closeSheets();
    toast('Added ' + added);
  });

  /* ============ offer ============ */
  $('#offerX').addEventListener('click', () => {
    const c = $('#offerCard');
    c.style.transition = 'opacity .24s ease, transform .24s ease';
    c.style.opacity = '0';
    c.style.transform = 'scale(.96)';
    setTimeout(() => c.remove(), 240);
  });
  $('#offerCta').addEventListener('click', () => toast('Loans — demo only'));

  /* ============ keyboard ============ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (activeSheet) closeSheets();
      else if (detailOpen) closeDetail();
      return;
    }
    const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if (!typing && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      openEditor();
    }
  });

  /* ============ fit the device frame to the window ============ */
  const stage = document.querySelector('.stage');
  function fitStage() {
    if (window.innerWidth <= 760) {
      stage.style.width = '';
      stage.style.height = '';
      phone.style.removeProperty('--s');
      return;
    }
    const availH = window.innerHeight - 150;
    const availW = window.innerWidth - 56;
    const s = Math.max(0.42, Math.min(1, availH / 852, availW / 393));
    stage.style.width = (393 * s).toFixed(1) + 'px';
    stage.style.height = (852 * s).toFixed(1) + 'px';
    phone.style.setProperty('--s', s.toFixed(4));
  }
  window.addEventListener('resize', fitStage);
  fitStage();

  /* ============ init ============ */
  R.renderPromos();
  buildDots();
  R.renderHome();
  R.paintBalance(0);
  R.renderDetail();
  R.tickClock();
  setInterval(R.tickClock, 15000);
  onScroll();
  setTimeout(() => R.animateBalance(D.state.balance, 1100), 320);

  setInterval(() => {
    if (detailOpen || activeSheet || document.hidden) return;
    if (Date.now() < promoPausedUntil) return;
    const cards = promoCards();
    if (cards.length < 2) return;
    scrollToPromo((promoIndex + 1) % cards.length);
  }, 4800);

  /* ============ installable web app ============ */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
