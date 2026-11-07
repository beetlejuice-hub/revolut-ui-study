/* Data, persistence and formatting helpers */
(function () {
  const KEY = 'revolut-ui-study-v1';

  const DEFAULTS = {
    initials: 'AL',
    balance: 72.83,
    currency: 'lei',
    iban: 'RO09 REVO 0000 1112 7043 6279',
    upcoming: {
      name: 'Apple',
      amount: -4.99,
      due: 'Due in 3 days',
      detail: 'Monthly, next on Nov 10.',
      icon: 'apple'
    },
    transactions: [
      { id: 't1', name: 'Incze Hunor', amount: -50, time: 'Today, 20:51', day: 'today', icon: 'initials', badge: 'out', cat: 'Transfer' },
      { id: 't2', name: 'Hungaro Residence', amount: -87, time: 'Today, 17:47', day: 'today', icon: 'dining', cat: 'Dining' },
      { id: 't3', name: 'Málna by Lengyel László Levente', amount: -33, time: 'Today, 15:07', day: 'today', icon: 'malna', cat: 'Desserts' },
      { id: 't4', name: 'Profi', amount: -7.65, time: 'Today, 14:31', day: 'today', icon: 'profi', cat: 'Groceries' },
      { id: 't5', name: 'aircash.eu', amount: -16, time: 'Today, 13:20', day: 'today', icon: 'aircash', cat: 'Shopping' },
      { id: 't6', name: 'Netflix', amount: -34.99, time: 'Yesterday, 21:40', day: 'yesterday', icon: 'netflix', cat: 'Entertainment' },
      { id: 't7', name: 'Kaufland', amount: -112.4, time: 'Yesterday, 18:22', day: 'yesterday', icon: 'kaufland', cat: 'Groceries' },
      { id: 't8', name: 'Bolt', amount: -24.3, time: 'Yesterday, 11:08', day: 'yesterday', icon: 'bolt', cat: 'Transport' }
    ]
  };

  const CUR = { lei: 'RON', '€': 'EUR', $: 'USD', '£': 'GBP' };

  const PROMOS = [
    {
      id: 'referral',
      title: 'Earn your boosted reward',
      body: 'Get 250 RON for each friend you refer by 17 November. T&Cs apply',
      art: `<div class="art-cards">
        <div class="pcard pc-white"></div>
        <div class="pcard pc-dark"><span class="pc-brand">REVOLUT</span></div>
        <div class="pcard pc-front"></div>
      </div>`
    },
    {
      id: 'savings',
      title: 'Grow your savings',
      body: 'Earn 4.25% AER with a Flexible Account. Interest paid daily.',
      art: `<div class="art-coin"><b>4.25%</b><span>AER</span></div>`
    },
    {
      id: 'fees',
      title: 'Spend without fees',
      body: 'Pay in 150+ currencies at the real exchange rate, every day.',
      art: `<div class="art-phone"></div>`
    },
    {
      id: 'invite',
      title: 'Give 250, get 250',
      body: 'Invite a friend and you both earn a reward after their first payment.',
      art: `<div class="art-gift"><span class="gbox"></span><span class="glid"></span><span class="gribbon"></span></div>`
    },
    {
      id: 'safe',
      title: 'Your money is protected',
      body: 'Deposits up to €100,000 are safeguarded by Lithuanian deposit insurance.',
      art: `<svg class="art-shield" viewBox="0 0 94 106" aria-hidden="true">
        <defs><linearGradient id="shg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#9aabff"/><stop offset="1" stop-color="#3b4bd8"/>
        </linearGradient></defs>
        <path d="M47 2 90 18v30c0 27-18 47-43 56C22 95 4 75 4 48V18z" fill="url(#shg)"/>
        <path d="M47 8 84 22v26c0 23-15 41-37 49-22-8-37-26-37-49V22z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
        <path d="m31 53 11 11 22-24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    }
  ];

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      const base = clone(DEFAULTS);
      if (!parsed || typeof parsed !== 'object') return base;
      const merged = Object.assign(base, parsed);
      if (typeof merged.balance !== 'number' || !isFinite(merged.balance)) merged.balance = base.balance;
      if (!Array.isArray(merged.transactions)) merged.transactions = base.transactions;
      if (!merged.upcoming || typeof merged.upcoming !== 'object') merged.upcoming = base.upcoming;
      merged.transactions = merged.transactions.filter((t) => t && typeof t === 'object').map((t) => ({
        id: t.id || ('t' + Math.random().toString(36).slice(2, 8)),
        name: String(t.name || 'Payment'),
        amount: Number(t.amount) || 0,
        time: String(t.time || 'Today, 12:00'),
        day: t.day === 'yesterday' ? 'yesterday' : 'today',
        icon: t.icon || 'initials',
        badge: t.badge || '',
        cat: t.cat || 'Payment'
      }));
      return merged;
    } catch (e) {
      return clone(DEFAULTS);
    }
  }

  const state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function reset() {
    const fresh = clone(DEFAULTS);
    Object.keys(state).forEach((k) => { delete state[k]; });
    Object.assign(state, fresh);
    save();
  }

  function moneyParts(n) {
    const num = Number(n) || 0;
    const neg = num < 0;
    const [i, d] = Math.abs(num).toFixed(2).split('.');
    return {
      neg,
      int: i.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      dec: d
    };
  }

  function fmt(n) {
    const p = moneyParts(n);
    return (p.neg ? '-' : '') + p.int + ',' + p.dec + ' ' + state.currency;
  }

  function initialsOf(name) {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '··';
  }

  function uid() {
    return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  function shortTime(time) {
    const parts = String(time || '').split(', ');
    return parts.length > 1 ? parts.slice(1).join(', ') : time;
  }

  function sum(items) {
    return (items || []).reduce((a, t) => a + (Number(t.amount) || 0), 0);
  }

  window.DEMO = {
    KEY, DEFAULTS, PROMOS, CUR, state, save, reset,
    moneyParts, fmt, initialsOf, uid, shortTime, sum, esc, clone
  };
})();
