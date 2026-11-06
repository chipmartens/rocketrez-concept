/* Company and conversion pages (company.py). Loaded on every page: each block returns early when its element is absent.
   Nothing here sends data anywhere; query params are read as plain text and whitelisted before they reach the page. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const usd = v => '$' + v.toFixed(2);
  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.8 8.2l2.1 2.1 4.3-4.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Pricing: build your quote. Pay toggle + systems ticked -> quote lines, per-guest sample, demo link carrying the ticks. */
  const qb = $('.co-qb');
  if (qb) {
    const q = Object.fromEntries($$('[data-q]', qb).map(n => [n.dataset.q, n]));
    const base = q.go.getAttribute('href');
    const upd = () => {
      const pay = $('input[name=co-plan]:checked', qb), on = $$('.co-sys input:checked', qb);
      q.pay.textContent = pay.dataset.say;
      q.n.textContent = q.bn.textContent = on.length;
      q.nl.textContent = on.length ? (on.length === 1 ? 'system replaced. Its module is on the quote.' : 'systems replaced, on one platform and one guest record.') : 'systems ticked. Tick what you run today and its module lands here.';
      q.mods.replaceChildren(...on.map(b => { const li = document.createElement('li'); li.innerHTML = '<span></span><span>In your quote</span>'; li.firstChild.textContent = b.dataset.mod; return li; }));
      const extra = on.filter(b => +b.dataset.spend), pc = 32 + extra.reduce((s, b) => s + +b.dataset.spend, 0);
      q.pc.textContent = q.bpc.textContent = usd(pc);
      q.pcl.textContent = extra.length ? 'The $32.00 ticket, plus ' + extra.map(b => b.dataset.line.charAt(0).toLowerCase() + b.dataset.line.slice(1) + ' (' + usd(+b.dataset.spend) + ')').join(', ') + '. Sample prices.'
        : 'The $32.00 ticket. Tick the café, shop, photo or texting to see what else lands on the same record. Sample prices.';
      const qs = new URLSearchParams({ pay: pay.value });
      if (on.length) qs.set('sys', on.map(b => b.value).join(','));
      q.go.href = q.go2.href = base + '?' + qs.toString().replace(/%2C/g, ',');
    };
    qb.addEventListener('change', upd); upd();
  }

  /* Switching: the go-live date can travel to the demo form */
  const go = $('[data-golive-go]');
  if (go) {
    const inp = $('[data-golive]'), base = go.getAttribute('href');
    const upd = () => { const ok = /^\d{4}-\d{2}-\d{2}$/.test(inp.value); go.hidden = !ok; if (ok) go.href = base + '?open=' + inp.value; };
    inp.addEventListener('input', upd); inp.addEventListener('change', upd); upd();
  }

  /* Print buttons print only their own outline (company.css @media print) */
  $$('[data-print]').forEach(b => b.addEventListener('click', () => print()));

  /* RFP: copy every question as plain text */
  const cp = $('[data-copyq]');
  if (cp) {
    const say = $('[data-copied]');
    cp.addEventListener('click', async () => {
      let n = 0;
      const text = $$('.rfq-h').map(h => {
        const rows = $$('th[scope=row]', h.nextElementSibling).map(th => `${++n}. ${th.textContent.trim()}`);
        return h.textContent.trim() + '\n' + rows.join('\n');
      }).join('\n\n').replace(/\u00a0/g, ' ');
      try { await navigator.clipboard.writeText(text); }
      catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
      say.textContent = `Copied ${n} questions. Paste them into your RFP.`;
    });
  }

  /* Demo: show what the visitor brought from pricing, the Relay calculator or the go-live calculator */
  const ctx = $('[data-ctx]');
  if (ctx) {
    const map = JSON.parse(ctx.dataset.ctx), p = new URLSearchParams(location.search), items = [];
    const sys = (p.get('sys') || '').split(',').filter(k => k in map.sys);
    const pay = map.pay[p.get('pay')];
    if (sys.length) items.push(['Your quote covers ', sys.map(k => map.sys[k]).join(', ') + (pay ? ', on a ' + pay.toLowerCase() + ' plan' : '') + '.']);
    else if (pay) items.push(['Your quote: ', pay.toLowerCase() + ' plan.']);
    const relay = (p.get('relay') || '').replace(/\D/g, '').slice(0, 9);
    if (relay && +relay > 0) items.push(['', `You worked out about $${(+relay).toLocaleString('en-US')} a year from Relay texts.`]);
    const open = p.get('open') || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(open)) {
      const [y, m, d] = open.split('-').map(Number), dt = new Date(y, m - 1, d);
      if (!isNaN(dt)) items.push(['Opening ', dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '. We plan back from it.']);
    }
    if (items.length) {
      $('ul', ctx).replaceChildren(...items.map(([b, t]) => {
        const li = document.createElement('li'); li.innerHTML = TICK + '<span><b></b></span>';
        li.querySelector('b').textContent = b; li.querySelector('span').append(t); return li;
      }));
      ctx.hidden = false;
      const now = $('#f-now');
      if (now && !now.value && sys.length > 1) now.value = 'Two or more separate systems';
    }
  }
})();
