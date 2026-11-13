/* Data, persistence and formatting helpers */
(function () {
  const KEY = 'revolut-ui-study-v2';

  /* The reference screenshots were taken on 8 November 2026, so the three
     editable home payments are anchored to 7 November 2026. Their labels are
     computed against the real current date: "Yesterday" on the 8th, and
     "Nov 7" from the 9th onwards. */
  const RECENT_DATE = '2026-11-07';
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const DEFAULTS = {
    name: 'Arnold',
    initials: 'AL',
    balance: 72.83,
    currency: 'lei',
    iban: 'RO09 REVO 0000 1112 7043 6279',
    upcoming: {
      name: 'Apple',
      amount: -4.99,
      due: 'Due in 2 days',
      detail: 'Monthly, next on Nov 10.',
      icon: 'apple'
    },
    /* The three most recent payments — shown on the home card and at the
       top of the history. Editable in the demo sheet. */
    transactions: [
      { id: 't1', name: 'Incze Hunor', amount: -50, date: RECENT_DATE, at: '20:51', icon: 'initials', badge: 'out', cat: 'Transfer' },
      { id: 't2', name: 'Hungaro Residence', amount: -87, date: RECENT_DATE, at: '17:47', icon: 'dining', cat: 'Dining' },
      { id: 't3', name: 'Málna by Lengyel László Levente', amount: -33, date: RECENT_DATE, at: '15:07', icon: 'malna', cat: 'Desserts' }
    ],
    /* Extra rows that belong only to the older spending-history days.
       They never appear on the home card. */
    historyExtra: []
  };

  /* Full spending history from the reference screenshots. The most recent
     group is merged in from state.transactions at render time. Every group
     carries an ISO date so the "Today" / "Yesterday" labels stay correct. */
  const HISTORY = [
    {
      key: 'nov13', label: 'November 13.', date: '2026-11-13', month: '2026-11',
      rows: [
        { id: 'h-csenge-3', name: 'Kedves Csenge 💕', amount: -20, time: '11:24', icon: 'initials', badge: 'out', cat: 'Transfer' }
      ]
    },
    {
      key: 'nov12', label: 'November 12.', date: '2026-11-12', month: '2026-11',
      rows: [
        { id: 'h-ler-2', name: 'Ler Potato Bar', amount: -29, time: '20:34', icon: 'ler', cat: 'Dining' },
        { id: 'h-petrom-2', name: 'Petrom', amount: -201.27, time: '17:22', icon: 'petrom', cat: 'Fuel' },
        { id: 'h-lidl-3', name: 'Lidl', amount: -68.64, time: '15:32', icon: 'lidl', cat: 'Groceries' },
        { id: 'h-sazy', name: 'Sazy', amount: -40, time: '15:14', icon: 'initials', cat: 'Dining' },
        { id: 'h-anyu-2', name: 'Anyu', amount: 500, time: '14:52', note: 'Tankolás+ vasarlas', icon: 'initials', badge: 'in', cat: 'Transfer' }
      ]
    },
    {
      key: 'nov11', label: 'November 11.', date: '2026-11-11', month: '2026-11',
      rows: [
        { id: 'h-claude-2', name: 'Claude', amount: -117.22, time: '15:26', alt: '-21,78 €', icon: 'claude', cat: 'AI subscription' },
        { id: 'h-csenge-4', name: 'Kedves Csenge 💕', amount: -10, time: '07:54', icon: 'initials', badge: 'out', cat: 'Transfer' },
        { id: 'h-apple-2', name: 'Apple', amount: -4.99, time: '00:34', icon: 'apple', cat: 'Subscription' }
      ]
    },
    {
      key: 'nov10', label: 'November 10.', date: '2026-11-10', month: '2026-11',
      rows: [
        { id: 'h-profi-2', name: 'Profi', amount: -8.73, time: '20:08', icon: 'profi', cat: 'Groceries' },
        { id: 'h-woodland', name: 'Woodland', amount: -107, time: '19:31', icon: 'initials', cat: 'Dining' },
        { id: 'h-tabac', name: 'M. Tabac', amount: -25, time: '18:03', icon: 'initials', cat: 'Shopping' },
        { id: 'h-anyu-3', name: 'Anyu', amount: 200, time: '15:35', note: 'Kaja', icon: 'initials', badge: 'in', cat: 'Transfer' }
      ]
    },
    {
      key: 'nov6', label: 'November 6.', date: '2026-11-06', month: '2026-11',
      rows: [
        { id: 'h-claude', name: 'Claude', amount: -58.26, time: '20:42', alt: '-12,10 $', icon: 'claude', cat: 'AI subscription' },
        { id: 'h-anthropic', name: 'Anthropic', amount: 0, time: '20:42', note: 'Card verification', icon: 'anthropic', cat: 'Card verification', hideAmount: true },
        { id: 'h-lidl-1', name: 'Lidl', amount: -5.07, time: '18:47', icon: 'lidl', cat: 'Groceries' },
        { id: 'h-anyu', name: 'Anyu', amount: 300, time: '18:31', note: 'Al vásárlásra', icon: 'initials', badge: 'in', cat: 'Transfer' }
      ]
    },
    {
      key: 'nov5', label: 'November 5.', date: '2026-11-05', month: '2026-11',
      rows: [
        { id: 'h-csenge-1', name: 'Kedves Csenge 💕', amount: -12, time: '12:52', icon: 'initials', badge: 'out', cat: 'Transfer' }
      ]
    },
    {
      key: 'nov4', label: 'November 4.', date: '2026-11-04', month: '2026-11',
      rows: [
        { id: 'h-kaufland-1', name: 'Kaufland', amount: -7.69, time: '22:02', icon: 'kaufland', cat: 'Groceries' },
        { id: 'h-hamm-1', name: 'Hamm', amount: -75.49, time: '21:16', icon: 'hamm', cat: 'Shopping' }
      ]
    },
    {
      key: 'oct31', label: 'October 31.', date: '2026-10-31', month: '2026-10',
      rows: [
        { id: 'h-petrom', name: 'Petrom', amount: -63.88, time: '23:20', icon: 'petrom', cat: 'Fuel' },
        { id: 'h-ler', name: 'Ler Potato Bar', amount: -41, time: '20:52', icon: 'ler', cat: 'Dining' },
        { id: 'h-csenge-2', name: 'Kedves Csenge 💕', amount: -12, time: '19:47', icon: 'initials', badge: 'out', cat: 'Transfer' },
        { id: 'h-lidl-2', name: 'Lidl', amount: -12.94, time: '15:56', icon: 'lidl', cat: 'Groceries' }
      ]
    },
    {
      key: 'oct30', label: 'October 30.', date: '2026-10-30', month: '2026-10',
      rows: [
        { id: 'h-eventum-1', name: 'Eventum Box', amount: -30, time: '23:09', icon: 'eventum', cat: 'Entertainment' },
        { id: 'h-eventum-2', name: 'Eventum Box', amount: -59, time: '21:12', icon: 'eventum', cat: 'Entertainment' },
        { id: 'h-mag', name: 'Mag 3983', amount: -15.98, time: '12:26', icon: 'mag', cat: 'Groceries' },
        { id: 'h-profi-1', name: 'Profi', amount: -7.94, time: '12:22', icon: 'profi', cat: 'Groceries' }
      ]
    },
    {
      key: 'oct29', label: 'October 29.', date: '2026-10-29', month: '2026-10',
      rows: [
        { id: 'h-kaufland-2', name: 'Kaufland', amount: -24, time: '18:10', icon: 'kaufland', cat: 'Groceries' },
        { id: 'h-hamm-2', name: 'Hamm', amount: -100, time: '12:05', icon: 'hamm', cat: 'Shopping' }
      ]
    }
  ];

  const MONTHS = [
    { key: '2026-08', label: 'August' },
    { key: '2026-09', label: 'September' },
    { key: '2026-10', label: 'October' },
    { key: '2026-11', label: 'November' }
  ];

  const CARDS = [
    { key: 'original', name: 'Original', sub: '··8109', kind: 'original' },
    { key: 'disposable', name: 'Disposable', sub: 'Generate', kind: 'disposable' },
    { key: 'get', name: 'Get card', sub: '', kind: 'get' }
  ];

  const WEALTH = {
    total: 73,
    rows: [
      { key: 'cash', name: 'Cash', value: '73 lei', icon: 'cash' },
      { key: 'savings', name: 'Savings & Funds', sub: 'Earn up to 4,25% p.a. with savings or invest in low-risk funds', icon: 'savings', chevron: true },
      { key: 'loan', name: 'Loan', sub: 'Get a low-rate loan up to 200 000 lei', icon: 'loan', chevron: true },
      { key: 'invest', name: 'Invest', sub: 'Manage and track investments', icon: 'invest', chevron: true },
      { key: 'crypto', name: 'Crypto', value: '0 lei', icon: 'crypto' },
      { key: 'linked', name: 'Linked', sub: 'Link external accounts', icon: 'linked', chevron: true }
    ]
  };

  const SPENT = { total: 336, delta: 395, limit: '2,17k lei' };

  const CUR = { lei: 'RON', '€': 'EUR', $: 'USD', '£': 'GBP' };

  const PROMOS = [
    {
      id: 'referral',
      title: 'Earn your boosted reward',
      body: 'Get 250 RON for each friend you refer by 17 November. T&Cs apply',
      art: `<div class="art-envelope">
        <div class="env-card"><span>REVOLUT</span></div>
        <div class="env-back"></div>
        <div class="env-front"></div>
        <div class="env-flap"></div>
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

  const HISTORY_KEYS = HISTORY.map((g) => g.key);

  function normalizeHistoryExtra(t) {
    if (!t || typeof t !== 'object') return null;
    const group = HISTORY_KEYS.indexOf(String(t.group || '')) !== -1 ? String(t.group) : '';
    if (!group) return null;
    const amount = Number(t.amount);
    return {
      id: String(t.id || ('hx' + Math.random().toString(36).slice(2, 9))),
      group,
      name: String(t.name || 'Payment').slice(0, 80),
      amount: isFinite(amount) ? Math.round(amount * 100) / 100 : 0,
      time: /^\d{2}:\d{2}$/.test(String(t.time || '')) ? String(t.time) : '12:00',
      icon: t.icon || 'initials',
      badge: t.badge || (amount < 0 ? 'out' : 'in'),
      cat: t.cat || 'Payment',
      note: t.note ? String(t.note).slice(0, 80) : ''
    };
  }

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
      merged.name = String(merged.name || base.name);
      merged.transactions = merged.transactions.filter((t) => t && typeof t === 'object').map((t) => {
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(t.date || '')) ? String(t.date) : RECENT_DATE;
        const at = String(t.at || shortTime(t.time) || '12:00');
        return {
          id: t.id || ('t' + Math.random().toString(36).slice(2, 8)),
          name: String(t.name || 'Payment'),
          amount: Number(t.amount) || 0,
          date,
          at,
          icon: t.icon || 'initials',
          badge: t.badge || '',
          cat: t.cat || 'Payment'
        };
      });
      merged.historyExtra = Array.isArray(merged.historyExtra)
        ? merged.historyExtra.map(normalizeHistoryExtra).filter(Boolean)
        : [];
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

  function fmtSigned(n) {
    const p = moneyParts(n);
    const sign = p.neg ? '-' : (Number(n) > 0 ? '+' : '');
    return sign + p.int + ',' + p.dec + ' ' + state.currency;
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

  /* ---------- relative day labels ---------- */
  function isoDate(d) {
    const x = d instanceof Date ? d : new Date(d);
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }

  function dayDiff(aISO, bISO) {
    const a = new Date(aISO + 'T00:00:00');
    const b = new Date(bISO + 'T00:00:00');
    if (isNaN(a) || isNaN(b)) return null;
    return Math.round((a - b) / 86400000);
  }

  /* "Today, 20:53" / "Yesterday, 20:51" / "Nov 7, 20:51" */
  function whenLabel(dateISO, at) {
    const today = isoDate(new Date());
    const diff = dayDiff(today, dateISO);
    let day;
    if (diff === 0) day = 'Today';
    else if (diff === 1) day = 'Yesterday';
    else {
      const d = new Date(dateISO + 'T00:00:00');
      day = isNaN(d) ? String(dateISO) : MONTH_SHORT[d.getMonth()] + ' ' + d.getDate();
    }
    return at ? day + ', ' + at : day;
  }

  /* History group header: "Today" / "Yesterday" / "November 7." */
  function groupLabel(dateISO) {
    const today = isoDate(new Date());
    const diff = dayDiff(today, dateISO);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    const d = new Date(dateISO + 'T00:00:00');
    if (isNaN(d)) return String(dateISO);
    return MONTH_LONG[d.getMonth()] + ' ' + d.getDate() + '.';
  }

  function txWhen(t) {
    if (t && t.date) return whenLabel(t.date, t.at);
    return (t && t.time) || '';
  }

  function nowTime() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function sum(items) {
    return (items || []).reduce((a, t) => a + (Number(t.amount) || 0), 0);
  }

  /* All groups in display order. The top group mirrors the editable home rows. */
  function historyGroups() {
    const recent = state.transactions.map((t) => Object.assign({}, t, {
      time: t.at || shortTime(t.time)
    }));
    const recentDate = (state.transactions[0] && state.transactions[0].date) || RECENT_DATE;
    const extras = (state.historyExtra || []).filter((t) => t && HISTORY_KEYS.indexOf(t.group) !== -1);
    const all = [{
      key: 'recent',
      label: groupLabel(recentDate),
      date: recentDate,
      month: recentDate.slice(0, 7),
      rows: recent
    }].concat(HISTORY.map((g) => {
      const added = extras
        .filter((t) => t.group === g.key)
        .map((t) => Object.assign({}, t));
      return Object.assign({}, g, {
        label: groupLabel(g.date) || g.label,
        rows: g.rows.concat(added).sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
      });
    }));
    return all.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  }

  function findTx(id) {
    if (id === 'upcoming') return null;
    const own = state.transactions.find((x) => x.id === id);
    if (own) return own;
    const extra = (state.historyExtra || []).find((x) => x.id === id);
    if (extra) return extra;
    for (const g of HISTORY) {
      const hit = g.rows.find((x) => x.id === id);
      if (hit) return hit;
    }
    return null;
  }

  window.DEMO = {
    KEY, DEFAULTS, HISTORY, MONTHS, CARDS, WEALTH, SPENT, PROMOS, CUR, state, save, reset,
    RECENT_DATE, moneyParts, fmt, fmtSigned, initialsOf, uid, shortTime, sum, esc, clone,
    isoDate, whenLabel, groupLabel, txWhen, nowTime,
    historyGroups, findTx
  };
})();
