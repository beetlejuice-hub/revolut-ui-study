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
  const detailHead = $('#detailHead');
  const monthPills = $('#monthPills');
  const backdrop = $('#backdrop');
  const toastEl = $('#toast');
  const lock = $('#lockScreen');
  const themeMeta = $('meta[name="theme-color"]');
  const setTheme = (color) => { if (themeMeta) themeMeta.setAttribute('content', color); };

  let detailOpen = false;
  let activeSheet = null;
  let scrollRaf = null;
  let detailRaf = null;
  let activeGroupKey = '';
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

  /* ============ launch / Face ID ============ */
  function initLock() {
    if (!lock) return;
    const nameEl = $('#lockName');
    if (nameEl) nameEl.textContent = D.state.name || 'there';
    const avatarEl = $('#lockAvatar');
    if (avatarEl) avatarEl.textContent = D.state.initials || 'AL';
    if (new URLSearchParams(location.search).has('nolock')) {
      lock.style.display = 'none';
      return;
    }
    let done = false;
    const unlock = () => {
      if (done) return;
      done = true;
      lock.classList.add('gone');
      lock.setAttribute('aria-hidden', 'true');
      setTimeout(() => { lock.style.display = 'none'; }, 620);
    };
    lock.addEventListener('click', unlock);
    const face = $('#lockFace');
    if (face) face.addEventListener('click', (e) => { e.stopPropagation(); unlock(); });
    setTimeout(unlock, 2200);
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
  function collapsedHeadHeight() {
    const wasCompact = detailHead.classList.contains('compact');
    const prev = detailHead.style.transition;
    detailHead.style.transition = 'none';
    detailHead.classList.add('compact');
    const h = detailHead.offsetHeight;
    if (!wasCompact) detailHead.classList.remove('compact');
    detailHead.style.transition = prev;
    return h;
  }

  function updateDetailHeader() {
    if (!detailOpen) return;
    const compact = detailScroll.scrollTop > 26;
    detailHead.classList.toggle('compact', compact);
    const groups = $$('#detailBody .dgroup');
    if (!groups.length) return;
    const scrollTop = detailScroll.getBoundingClientRect().top;
    const cutoff = scrollTop + detailHead.offsetHeight + 24;
    let active = groups[0];
    for (const g of groups) {
      if (g.getBoundingClientRect().top <= cutoff) active = g;
      else break;
    }
    const key = active.dataset.key;
    if (key === activeGroupKey) return;
    activeGroupKey = key;
    R.paintDetailBalance(Number(active.dataset.balance) || 0);
    const date = $('#detailDate');
    if (date) date.textContent = active.dataset.label || '';
    $$('#monthPills .mpill').forEach((p) => {
      p.classList.toggle('on', p.dataset.month === active.dataset.month);
    });
  }

  function openDetail() {
    if (activeSheet) closeSheets();
    detailOpen = true;
    phone.classList.add('detail-open');
    detail.classList.add('open');
    detail.setAttribute('aria-hidden', 'false');
    detailScroll.scrollTop = 0;
    detailHead.classList.remove('compact');
    activeGroupKey = '';
    setTheme('#0a0a0b');
    R.renderDetail();
    R.renderMonthPills();
    updateDetailHeader();
  }
  function closeDetail() {
    detailOpen = false;
    phone.classList.remove('detail-open');
    detail.classList.remove('open');
    detail.setAttribute('aria-hidden', 'true');
    setTheme('#2b45ff');
  }

  detailScroll.addEventListener('scroll', () => {
    if (!detailRaf) detailRaf = requestAnimationFrame(() => { detailRaf = null; updateDetailHeader(); });
  }, { passive: true });

  monthPills.addEventListener('click', (e) => {
    const b = e.target.closest('.mpill');
    if (!b) return;
    const group = document.querySelector(`#detailBody .dgroup[data-month="${b.dataset.month}"]`);
    if (!group) { toast('No transactions this month'); return; }
    detailHead.classList.add('compact');
    const h = collapsedHeadHeight();
    const top = group.offsetTop - h - 8;
    detailScroll.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });

  /* ============ home scroll / hero collapse ============ */
  function onScroll() {
    const y = home.scrollTop;
    const bar = Math.min(1, y / 70);
    phone.style.setProperty('--sp', String(bar));
    const fade = Math.min(1, Math.max(0, (y - 90) / 120));
    heroBody.style.opacity = String(1 - fade);
    heroBody.style.transform = `translate3d(0,${(-y * 0.12).toFixed(1)}px,0) scale(${(1 - Math.min(1, y / 2400)).toFixed(3)})`;
  }
  home.addEventListener('scroll', () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = null; onScroll(); });
  }, { passive: true });

  function scrollHomeTo(sel) {
    const el = $(sel);
    if (!el) return;
    home.scrollTo({ top: Math.max(0, el.offsetTop - 108), behavior: 'smooth' });
  }

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
      const d = Math.abs((c.offsetLeft - 14) - x);
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
    track.scrollTo({ left: Math.max(0, cards[i].offsetLeft - 14), behavior: 'smooth' });
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
      t = D.findTx(id);
    }
    if (!t) return;
    const amt = t.hideAmount ? '—' : D.fmtSigned(t.amount);
    const whenTxt = t.date ? D.txWhen(t) : (t.time || t.note || t.alt || '');
    $('#txSheetBody').innerHTML = `
      <button class="sheet-close" data-close style="position:absolute;top:12px;right:16px" aria-label="Close">×</button>
      <div class="txs-icon">${R.txIcon(t)}</div>
      <div class="txs-amt${t.amount > 0 ? ' positive' : ''}">${amt}</div>
      <div class="txs-name">${D.esc(t.name)}</div>
      <div class="txs-time">${D.esc(whenTxt)} · Completed</div>
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
  $('#searchHome').addEventListener('click', () => openDetail());
  $('#statsBtn').addEventListener('click', () => scrollHomeTo('#spentSec'));
  $('#cardBtn').addEventListener('click', () => scrollHomeTo('#cardsSec'));
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

  /* ============ events: edge-swipe back ============ */
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
    const card = e.target.closest('[data-card]');
    if (card) { toast('Card — demo only'); return; }
    const wealth = e.target.closest('[data-wealth]');
    if (wealth) { toast('Wealth — demo only'); return; }
    if (e.target.closest('#schedLink')) { toast('Scheduled payments — demo only'); return; }
    if (e.target.closest('[data-act]')) { toast(e.target.closest('[data-act]').dataset.act + ' — demo only'); return; }
    if (e.target.closest('[data-close]')) { closeSheets(); return; }
  });
  backdrop.addEventListener('click', closeSheets);

  /* ============ events: home sections ============ */
  $('#loansCta').addEventListener('click', () => toast('Loans — demo only'));
  $('#loansClose').addEventListener('click', () => {
    const card = $('#loansCard');
    if (!card) return;
    card.style.transition = 'opacity .22s ease, transform .22s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(.97)';
    setTimeout(() => { card.remove(); }, 240);
  });
  $('#cardsSeeAll').addEventListener('click', () => toast('All cards — demo only'));
  $('#wealthHead').addEventListener('click', () => toast('Total wealth — demo only'));
  $('#spentSeeAll').addEventListener('click', () => toast('Spending analytics — demo only'));

  /* ============ events: editor fields ============ */
  const saveAndPaint = () => {
    D.save();
    R.renderHome();
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
  };

  $('#fName').addEventListener('input', (e) => {
    D.state.name = e.target.value || 'Arnold';
    D.save();
    const lockName = $('#lockName');
    if (lockName) lockName.textContent = D.state.name;
  });

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
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
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
    if (detailOpen) updateDetailHeader();
  });

  $('#txEditor').addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    D.state.transactions = D.state.transactions.filter((t) => t.id !== del.dataset.del);
    D.save();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
    toast('Transaction removed');
  });

  $('#addTx').addEventListener('click', () => {
    const t = {
      id: D.uid(), name: 'New payment', amount: -10,
      date: D.isoDate(new Date()), at: D.nowTime(), icon: 'initials', cat: 'Payment'
    };
    D.state.transactions.unshift(t);
    D.save();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
    const input = document.querySelector(`.edit-row[data-id="${t.id}"] .e-name`);
    if (input) { input.focus(); input.select(); }
  });

  $('#resetBtn').addEventListener('click', () => {
    D.reset();
    R.stopBalance();
    R.renderEditor();
    R.renderHome();
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
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
    R.renderDetail();
    if (detailOpen) updateDetailHeader();
    const added = D.fmt(addValue).replace('-', '');
    closeSheets();
    toast('Added ' + added);
  });

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
    const availH = window.innerHeight - 140;
    const availW = window.innerWidth - 48;
    const s = Math.max(0.4, Math.min(1, availH / 844, availW / 390));
    stage.style.width = (390 * s).toFixed(1) + 'px';
    stage.style.height = (844 * s).toFixed(1) + 'px';
    phone.style.setProperty('--s', s.toFixed(4));
  }
  window.addEventListener('resize', fitStage);
  fitStage();

  /* ============ init ============ */
  R.renderPromos();
  buildDots();
  R.renderHome();
  R.renderMonthPills();
  R.paintBalance(0);
  R.renderDetail();
  R.tickClock();
  setInterval(R.tickClock, 15000);
  onScroll();
  setTimeout(() => R.animateBalance(D.state.balance, 1100), 320);
  initLock();

  /* The promo carousel is user-driven; it should not auto-advance. */

  /* ============ installable web app ============ */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    const registerSW = () => navigator.serviceWorker.register('./sw.js').catch(() => {});
    if (document.readyState === 'complete') registerSW();
    else window.addEventListener('load', registerSW, { once: true });
  }
})();
