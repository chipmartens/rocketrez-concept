// RocketRez spec rebuild: all interaction and motion. Vanilla, no libraries. Transform and opacity only.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const money = v => '$' + v.toFixed(2);
  document.documentElement.classList.add('js');
  const seen = (els, fn, opts = { threshold: .35 }) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), opts);
    els.forEach(el => io.observe(el));
  };

  /* Concept note */
  $$('.spec-bar button').forEach(b => b.addEventListener('click', () => { b.parentElement.hidden = true; }));

  /* Mega menus */
  const closers = [];
  $$('[data-drop]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const li = btn.parentElement;
    const set = open => {
      if (open) $$('[data-drop][aria-expanded=true]').forEach(o => { if (o !== btn) { o.setAttribute('aria-expanded', false); document.getElementById(o.getAttribute('aria-controls')).classList.remove('open'); } });
      btn.setAttribute('aria-expanded', open); panel.classList.toggle('open', open);
    };
    // hover opens; a click while the pointer is already over it keeps it open (it used to close it)
    btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; if (open && li.matches(':hover')) return; set(!open); });
    // CSS :hover opens the panel too (styles.css), so a pointer already resting on the item when the page loads still opens it;
    // Escape adds .shut to hold it closed until the pointer leaves.
    closers.push(() => { set(false); if (li.matches(':hover')) li.classList.add('shut'); });
    li.addEventListener('mouseenter', () => set(true));
    li.addEventListener('mouseleave', () => { li.classList.remove('shut'); set(false); });
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) set(false); });
  });

  /* Menu overlay */
  const ov = $('.overlay'), mb = $('.menu-btn');
  const setMenu = open => {
    if (!ov) return;
    ov.classList.toggle('open', open); mb.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? $('.close', ov) : mb).focus();
  };
  mb && mb.addEventListener('click', () => setMenu(true));
  ov && $('.close', ov).addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (ov && ov.classList.contains('open')) setMenu(false);
    closers.forEach(f => f());
  });

  /* One-off reveals: charts draw, about paragraphs brighten */
  seen($$('.ichart'), el => el.classList.add('in'));
  seen($$('.bright'), el => el.classList.add('lit'), { rootMargin: '0px 0px -35% 0px' });

  /* Home hero: the guest's day, driven by scroll. The device shows each moment as it fires. */
  const hero = $('.hero-day');
  let heroUpdate = () => {};
  if (hero) {
    const evs = $$('.ev', hero), lis = $$('.day-list li', hero);
    const prog = $('.prog', hero), guest = $('.guest', hero);
    const val = $('.percap .val', hero), cmp = $('.percap .cap-note', hero);
    const segs = $$('.mix .seg', hero);
    const x0 = +prog.getAttribute('x1'), x1 = +hero.dataset.end;
    const dev = $('.gdev', hero), gs = dev ? $$('.gs', dev) : [], dots = dev ? $$('.gd-dots button', dev) : [];
    let last = -1, lastI = -2, forced = -1;  // forced: a dot was clicked, so the day is scrubbed to that moment until the reader scrolls
    const showDev = i => {
      if (!dev) return;
      dev.dataset.i = i; dev.dataset.f = i >= 3 ? 'pos' : 'phone';
      gs.forEach(g => g.classList.toggle('on', +g.dataset.i === i));
      dots.forEach((d, k) => d.setAttribute('aria-pressed', k === i));
    };
    dots.forEach((d, k) => {
      d.addEventListener('mousedown', e => e.preventDefault());
      d.addEventListener('click', () => { forced = k; heroUpdate(); });
    });
    const unforce = () => { if (forced >= 0) { forced = -1; heroUpdate(); } };
    addEventListener('wheel', unforce, { passive: true }); addEventListener('touchmove', unforce, { passive: true });
    addEventListener('keydown', e => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && !e.target.closest('input,textarea,select')) unforce(); });
    heroUpdate = () => {
      const mobile = innerWidth <= 900;
      const r = hero.getBoundingClientRect();
      // the day completes in about 600 px of scroll (CSS gives the pin 640 px of travel)
      const p = reduce || mobile ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight) * 1.1);
      const xs = +hero.dataset.start || x0, x = forced >= 0 ? +evs[forced].dataset.x : xs + (x1 - xs) * p;
      prog.setAttribute('x2', x); guest.setAttribute('cx', x);
      let sum = 0, li = 0;
      evs.forEach((ev, i) => {
        const on = +ev.dataset.x <= x + 1;
        ev.classList.toggle('on', on);
        if (on) { sum += +ev.dataset.amt; li = i; }
        lis[i] && lis[i].classList.toggle('on', on);
        segs[i] && segs[i].classList.toggle('on', on);
      });
      if (li !== lastI) { lastI = li; showDev(li); }  // phones and reduced motion show the end of the day: final device beside the final total
      if (sum !== last) {
        last = sum; val.textContent = money(sum);
        const t = +hero.dataset.ticket;
        cmp.textContent = sum > t ? `The ticket was ${money(t)} of it.` : '';
      }
    };
  }

  /* Five systems collapse into one guest record when the section comes into view */
  $$('.stack').forEach(st => {
    const b = $('.ring-go', st);
    // opens on the chaos; the reader puts it on one system
    const set = m => { st.classList.toggle('merged', m); b.setAttribute('aria-pressed', m); b.textContent = m ? 'Show the five systems' : 'Put it on one system'; };
    set(false);
    b.addEventListener('click', () => set(!st.classList.contains('merged')));
  });

  /* Photo accordion: one panel open at a time. Hover (fine pointers) or the first click expands; the link inside navigates. */
  $$('.acc').forEach(a => {
    const ps = $$('.acc-p', a);
    const open = p => ps.forEach(x => { x.classList.toggle('on', x === p); $('.acc-b', x).setAttribute('aria-expanded', x === p); });
    const hover = matchMedia('(hover: hover)').matches;
    ps.forEach(p => {
      $('.acc-b', p).addEventListener('click', () => open(p));
      if (hover) p.addEventListener('mouseenter', () => open(p));
      $('.acc-l', p).addEventListener('focus', () => open(p));
    });
  });

  /* Horizontal scrollers with arrow buttons */
  $$('.reelsec').forEach(s => {
    const tr = $('.reel-track', s), pv = $('.rb.prev', s), nx = $('.rb.next', s);
    if (!tr || !pv) return;
    const step = () => (tr.firstElementChild ? tr.firstElementChild.getBoundingClientRect().width + 32 : 400);
    const pos = $('.reel-pos', s), n = tr.children.length;
    const upd = () => {
      const end = tr.scrollLeft + tr.clientWidth > tr.scrollWidth - 8;
      pv.disabled = tr.scrollLeft < 8; nx.disabled = end;
      if (pos) pos.textContent = `${end ? n : Math.min(n, Math.round(tr.scrollLeft / step()) + 1)} of ${n}`;
    };
    pv.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    nx.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    tr.addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* Tab bars that run off the side get an edge fade on the side with more tabs */
  $$('.tabrow').forEach(t => {
    const f = () => { const m = t.scrollWidth - t.clientWidth; t.classList.toggle('fl', t.scrollLeft > 4); t.classList.toggle('fr', m - t.scrollLeft > 4); };
    t.addEventListener('scroll', f, { passive: true }); addEventListener('resize', f); f();
  });

  /* The amber per-cap counter: counts up when it scrolls into view. On the hub hero it ticks as each line of the guest record lands. */
  const countTo = (el, to, ms = 900) => {
    const from = +(el.dataset.v || 0); el.dataset.v = to;
    if (reduce) { el.textContent = money(to); return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - (1 - k) ** 3; el.textContent = money(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  $$('.hfield[data-play]').forEach(f => {
    const rows = $$('.gr-l', f), b = $('.pcc b', f);
    if (!rows.length || !b) return;
    const amt = r => { const m = r.textContent.match(/\$([\d,]+\.\d\d)(?!.*\$)/); return m ? +m[1].replace(/,/g, '') : 0; };
    if (reduce) return;  // the finished record and total, no animation
    rows.forEach(r => r.classList.add('wait')); b.textContent = money(0); b.dataset.v = 0;
    seen([f], () => {
      let i = 0, sum = 0;
      const step = () => { if (i >= rows.length) return; rows[i].classList.remove('wait'); sum += amt(rows[i]); countTo(b, sum, 500); i++; setTimeout(step, 650); };
      setTimeout(step, 300);
    });
  });
  $$('.pcc[data-count]').forEach(c => {
    if (c.closest('.hfield[data-play]')) return;
    const b = $('b', c);
    if (!reduce) { b.textContent = money(0); seen([c], () => countTo(b, +c.dataset.count, 1400)); }
  });

  /* Sticky tab bars and tables of contents: scroll-spy */
  $$('.tabbar, .toc').forEach(bar => {
    const links = $$('a[href^="#"]', bar), targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    if (!targets.length) return;
    // the active tab is the last section whose top has passed 35% of the viewport; above the first section, the first tab
    // (an IntersectionObserver band lit whichever short section crossed last, so the wrong tab showed at the top)
    let raf = 0;
    const pick = () => {
      raf = 0;
      const line = innerHeight * .35;
      let k = 0;
      targets.forEach((t, j) => { if (t.getBoundingClientRect().top <= line) k = j; });
      const id = targets[k].id;
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(pick); }, { passive: true });
    pick();
  });

  /* Relay: three moments, auto-advancing every 6 s with a pause button */
  $$('.auto').forEach(a => {
    const rows = $$('.am', a), threads = $$('.phone .thread', a), pb = $('.apause', a);
    let i = 0, timer, paused = reduce;
    const show = n => {
      i = n;
      rows.forEach((r, j) => { r.classList.toggle('on', j === n); r.setAttribute('aria-selected', j === n); });
      threads.forEach((t, j) => {
        t.hidden = j !== n;
        $$('.bub', t).forEach((b, k) => { b.classList.remove('show'); if (j === n) setTimeout(() => b.classList.add('show'), reduce ? 0 : 200 + k * 600); });
      });
      // restart the progress rule
      rows.forEach(r => { const p = $('.pr i', r); p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
    };
    const tick = () => { clearTimeout(timer); if (!paused) timer = setTimeout(() => { show((i + 1) % rows.length); tick(); }, 6000); };
    const setPaused = v => { paused = v; a.classList.toggle('paused', v); pb.setAttribute('aria-pressed', v); pb.lastChild.textContent = v ? 'Play' : 'Pause'; tick(); };
    rows.forEach((r, j) => r.addEventListener('click', () => { show(j); setPaused(true); }));
    pb.addEventListener('click', () => setPaused(!paused));
    show(0);
    if (reduce) setPaused(true);
    seen([a], () => tick());
  });

  /* Customer name rail pause */
  $$('.rail .pause').forEach(b => b.addEventListener('click', () => {
    const r = b.closest('.rail'), p = r.classList.toggle('paused');
    b.textContent = p ? 'Play' : 'Pause'; b.setAttribute('aria-pressed', p);
  }));

  /* Integrations filter */
  $$('.filters').forEach(f => {
    const btns = $$('button', f), items = $$('.int');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      items.forEach(it => it.hidden = b.dataset.f !== 'all' && it.dataset.cat !== b.dataset.f);
    }));
  });

  /* Learn: filter cards by type, learning path or category (filters in one section combine) */
  $$('.lfilter').forEach(f => {
    const sec = f.closest('.sec'), groups = $$('.lfilter', sec), cards = $$('.rcard, .pcard2', sec);
    const n = $('[data-ln]', sec), none = $('.lnone', sec);
    const apply = () => {
      const want = groups.map(g => [g.dataset.attr, $('[aria-pressed=true]', g).dataset.v]);
      let k = 0;
      cards.forEach(c => {
        const ok = want.every(([a, v]) => !v || (a === 'obj' ? (c.dataset.obj || '').split(' ').includes(v) : c.dataset[a] === v));
        c.hidden = !ok; if (ok) k++;
      });
      if (n) n.textContent = k;
      if (none) none.hidden = k > 0;
    };
    $$('button', f).forEach(b => b.addEventListener('click', () => { $$('button', f).forEach(x => x.setAttribute('aria-pressed', x === b)); apply(); }));
  });

  /* All features: type to filter */
  // searches every card and every RFP sub-feature (an RFP line also matches on its module's name), then brings the first match into view
  $$('[data-ff]').forEach(inp => {
    const cards = $$('[data-fc]'), grps = $$('.fgrp'), mods = $$('.rfp-m'), n = $('[data-ffn]'), none = $('.ffnone');
    const mod = c => { const m = c.closest('.rfp-m'); return m ? $('.ttl', m).textContent.toLowerCase() : ''; };
    let t;
    n.textContent = cards.length;
    inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      let k = 0, first = null;
      cards.forEach(c => { const ok = !q || c.textContent.toLowerCase().includes(q) || mod(c).includes(q); c.hidden = !ok; if (ok) { k++; first = first || c; } });
      grps.forEach(g => g.hidden = !$$('[data-fc]', g).some(c => !c.hidden));
      mods.forEach(m => m.hidden = !$$('[data-fc]', m).some(c => !c.hidden));
      n.textContent = k; none.hidden = k > 0;
      clearTimeout(t);
      if (q && first) t = setTimeout(() => (first.closest('.fgrp, .rfp-m') || first).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 700);
    });
  });

  /* Pricing: what would RocketRez replace */
  $$('.checker').forEach(ch => {
    const boxes = $$('input', ch), count = $('.count', ch), list = $('.out ul', ch), line = $('.out .say', ch);
    const upd = () => {
      const on = boxes.filter(b => b.checked), lines = [...new Set(on.map(b => b.dataset.to))];
      count.textContent = on.length;
      list.innerHTML = lines.map(t => `<li><span>${t}</span><span class="slot">To confirm with RocketRez</span></li>`).join('');
      line.textContent = on.length ? `${on.length === 1 ? 'system' : 'systems'} replaced. Your quote would list ${lines.length === 1 ? 'this line' : 'these ' + lines.length + ' lines'}, plus the three below.` : 'systems ticked. Tick what you run today to build the preview.';
    };
    boxes.forEach(b => b.addEventListener('change', upd)); upd();
  });

  /* Forms (demo, guides): validate on blur and submit, then a real success state. Nothing is sent. */
  $$('form[data-demo], form[data-guide], form[data-ref]').forEach(form => {
    const check = f => {
      const i = $('input,select', f), m = $('.msg', f);
      let msg = '';
      if (i.required && !i.value.trim()) msg = i.dataset.req || 'Please fill this in.';
      else if (i.type === 'email' && i.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)) msg = 'Use an email like name@yourattraction.com.';
      f.classList.toggle('err', !!msg); m.textContent = msg; i.setAttribute('aria-invalid', !!msg);
      return !msg;
    };
    $$('.field', form).forEach(f => $('input,select', f).addEventListener('blur', () => check(f)));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = $$('.field', form).filter(f => !check(f));
      if (bad.length) return $('input,select', bad[0]).focus();
      form.hidden = true;
      const s = form.nextElementSibling; const nm = $('[data-gname]', s); if (nm) nm.textContent = $('input', form).value.trim();
      s.classList.add('on'); s.setAttribute('tabindex', '-1'); s.focus();
    });
  });
  /* Go-live: opening day minus the published 8 to 12 weeks, math shown */
  $$('.golive').forEach(g => {
    const inp = $('[data-golive]', g), o = Object.fromEntries($$('[data-g]', g).map(n => [n.dataset.g, n]));
    const fmt = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const back = (d, w) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - w * 7);
    const upd = () => {
      if (!inp.value) return;
      const [y, m, d] = inp.value.split('-').map(Number), open = new Date(y, m - 1, d), s12 = back(open, 12), s8 = back(open, 8);
      o.s12.textContent = fmt(s12); o.s8.textContent = fmt(s8);
      const late = s12 < new Date();
      o.m.textContent = `${fmt(open)} minus 12 weeks (84 days) is ${fmt(s12)}. Minus 8 weeks (56 days) is ${fmt(s8)}.` + (late ? ' The 12-week start has already passed, so book a call to plan around your date.' : '');
    };
    inp.addEventListener('input', upd); inp.addEventListener('change', upd); upd();
  });

  const typ = new URLSearchParams(location.search).get('type');
  const sel = $('#f-type');
  if (typ && sel) sel.value = typ;

  /* ===== rr and sc: interactive product UI (sample data) ===== */
  const outs = el => Object.fromEntries($$('[data-o]', el).map(n => [n.dataset.o, n]));
  const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const usd0 = v => '$' + Math.round(v).toLocaleString('en-US');
  const press = (all, b) => all.forEach(x => x.setAttribute('aria-pressed', x === b));
  const flip = b => { const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v); return v; };
  const isOn = b => b.getAttribute('aria-pressed') === 'true';
  const toast = (el, msg) => { const t = $('.rr-toast', el); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800); };
  const fx = n => { if (!n || reduce) return; n.classList.remove('fx'); void n.offsetWidth; n.classList.add('fx'); };
  const SVG = p => `<svg class="ic" viewBox="0 0 16 16" aria-hidden="true">${p}</svg>`;
  const IC = {
    check: '<path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    user: '<circle cx="8" cy="5.5" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 14c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    alert: '<path d="M8 2l6.5 11.5h-13z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.5v3M8 11.6v.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    minus: '<path d="M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    clock: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const steppers = el => $$('.rr-stp', el).forEach(s => {
    const out = $('output', s), mn = +s.dataset.min, mx = +s.dataset.max, of = s.dataset.of === '1';
    const [m, p] = $$('button', s);
    const set = n => {
      n = Math.max(mn, Math.min(mx, n)); out.dataset.n = n; out.textContent = of ? `${n} / ${mx}` : n;
      m.disabled = n <= mn; p.disabled = n >= mx; s.dispatchEvent(new Event('change', { bubbles: true }));
    };
    m.addEventListener('click', () => set(+out.dataset.n - 1)); p.addEventListener('click', () => set(+out.dataset.n + 1));
    set(+out.dataset.n);
  });
  const RR = {
    timed(el, o) {
      const b = $$('.rr-slot', el);
      b.forEach(s => s.addEventListener('click', () => {
        press(b, s); o.t.textContent = s.dataset.t; o.p.textContent = usd(+s.dataset.p); o.q.hidden = +s.dataset.p >= 32; fx(o.p);
      }));
    },
    calendar(el, o, d) {
      const b = $$('.rr-cal button', el);
      b.forEach(c => c.addEventListener('click', () => {
        press(b, c); const p = +c.dataset.p;
        o.p.textContent = usd(p); o.day.textContent = c.dataset.day + ' · Adult'; o.left.textContent = c.dataset.left;
        o.save.textContent = p < d.gate ? `Save ${Math.round((d.gate - p) / d.gate * 100)}%` : 'Peak day'; fx(o.p);
      }));
    },
    rules(el, o, d) {
      const sw = $$('.rr-rule', el);
      const calc = () => {
        const [r1, r2, r3] = sw.map(s => s.getAttribute('aria-checked') === 'true');
        const after = r1 ? 40 : d.base, ps = [r1 ? 30 : d.base, after, after + (r2 ? 5 : 0)];
        ps.push(r3 ? 25 : ps[2]);
        ps.forEach((p, i) => { o['p' + i].textContent = '$' + p; o['b' + i].style.transform = `scaleY(${p / 50})`; });
      };
      sw.forEach(s => s.addEventListener('click', () => { s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true'); calc(); }));
    },
    ota(el, o) {
      const rows = $$('.rr-ch', el), segs = $$('i', o.bar);
      let left = +o.left.textContent;
      rows.forEach((r, i) => r.addEventListener('click', () => {
        if (left < 2) return;
        left -= 2;
        const s = $('[data-s]', r); s.textContent = +s.textContent + 2;
        segs[i].style.flexGrow = s.textContent; segs[segs.length - 1].style.flexGrow = left;
        o.left.textContent = left; $$('[data-left]', el).forEach(n => n.textContent = left);
        if (!left) { rows.forEach(x => x.disabled = true); toast(el, 'Sold out on every channel at once. Nothing oversold.'); }
        else toast(el, `2 seats sold on ${$('span', r).firstChild.textContent}. Every channel now shows ${left} left.`);
      }));
    },
    event(el, o, d) {
      const adds = $$('.rr-add', el), inp = $('.rr-sign input', el), go = $('.rr-sign .rr-btn', el);
      const calc = () => {
        const t = d.base + adds.filter(isOn).reduce((s, a) => s + +a.dataset.p, 0);
        o.tot.textContent = usd(t); o.dep.textContent = usd(t * .25); return t;
      };
      adds.forEach(a => a.addEventListener('click', () => { flip(a); calc(); fx(o.dep); }));
      inp.addEventListener('input', () => go.disabled = inp.value.trim().length < 2);
      go.addEventListener('click', () => toast(el, `Signed by ${inp.value.trim()}. Deposit of ${usd(calc() * .25)} paid.`));
    },
    checkout(el) {
      const b = $$('.rr-seg button', el), co = $('.rr-co', el);
      b.forEach(x => x.addEventListener('click', () => { press(b, x); co.dataset.v = x.dataset.i; fx(co); }));
    },
    pos(el, o, d) {
      const basket = new Map(Object.entries(d.b).map(([k, v]) => [+k, v]));
      const render = () => {
        let sub = 0, disc = 0;
        o.lines.innerHTML = [...basket].map(([i, q]) => {
          const [n, p, k, lab] = d.p[i]; sub += p * q; if (k === 'fb' || k === 'rt') disc += p * q * .1;
          return `<div class="rr-li"><span class="qty">${q}</span><span class="n">${n}<small>${lab}</small></span><span class="v">${usd(p * q)}</span><button class="rr-rm" data-i="${i}" aria-label="Remove one ${n}">${SVG(IC.minus)}</button></div>`;
        }).join('');
        disc = Math.round(disc * 100) / 100;
        const tot = sub - disc;
        o.sub.textContent = usd(sub); o.disc.textContent = '-' + usd(disc); o.tot.textContent = usd(tot);
        o.charge.textContent = 'Charge ' + usd(tot); o.charge.disabled = !basket.size; o.charge.dataset.t = tot;
      };
      o.lines.addEventListener('click', e => {
        const r = e.target.closest('.rr-rm'); if (!r) return;
        const i = +r.dataset.i, q = basket.get(i) - 1; q ? basket.set(i, q) : basket.delete(i); render();
      });
      $$('.rr-prod', el).forEach(t => t.addEventListener('click', () => { const i = +t.dataset.i; basket.set(i, (basket.get(i) || 0) + 1); render(); fx(o.tot); }));
      o.charge.addEventListener('click', () => { toast(el, `Payment approved · ${usd(+o.charge.dataset.t)}`); basket.clear(); render(); });
      render();
    },
    pay(el, o) {
      const b = $$('.rr-tend', el); let m = b[0].textContent;
      b.forEach(x => x.addEventListener('click', () => { press(b, x); m = x.textContent; o.m.textContent = x.dataset.m; fx(o.m); }));
      $('.rr-btn', el).addEventListener('click', () => toast(el, `Payment approved · $64.00 by ${m}`));
    },
    photo(el, o) {
      const b = $$('.rr-ph', el);
      const calc = () => { const n = b.filter(isOn).length, p = Math.min(n * 18, 45); o.n.textContent = n; o.p.textContent = usd(p); o.go.disabled = !n; return p; };
      b.forEach(x => x.addEventListener('click', () => { flip(x); calc(); fx(o.p); }));
      o.go.addEventListener('click', () => toast(el, `Added to ticket A7-2291 · ${usd(calc())}`));
    },
    stock(el, o, d) {
      const sel = $('select', el), out = $('.rr-stp output', el), rows = $$('tbody tr', el);
      $('.rr-xfer > .rr-btn', el).addEventListener('click', () => {
        const i = +sel.value, q = +out.dataset.n, it = d[i], r = rows[i];
        if (q > it[1]) return toast(el, `Only ${it[1]} in the gift shop.`);
        it[1] -= q; it[2] += q;
        $('[data-a]', r).textContent = it[1]; $('[data-b]', r).textContent = it[2];
        const st = $('[data-st]', r); st.textContent = it[2] < 10 ? 'Low' : 'OK'; st.className = 'rr-badge ' + (it[2] < 10 ? 'am' : 'ok');
        rows.forEach(x => x.classList.toggle('hit', x === r)); setTimeout(() => r.classList.remove('hit'), 1600);
        toast(el, `Moved ${q} ${it[0]} to the café kiosk.`);
      });
    },
    season(el, o) {
      const os = $$('.rr-stp output', el), n = () => os.reduce((s, x) => s + +x.dataset.n, 0);
      el.addEventListener('change', () => { const k = n(); o.go.textContent = k ? `Check in ${k}` : 'Nothing to redeem'; o.go.disabled = !k; });
      o.go.addEventListener('click', () => { o.v.textContent = +o.v.textContent + 1; toast(el, `${plural(n(), 'guest')} checked in. Visit ${o.v.textContent} this season.`); });
    },
    percap(el, o, d) {
      const b = $$('.rr-seg button', el), rows = $$('.rr-pc', el);
      b.forEach(x => x.addEventListener('click', () => {
        press(b, x); const j = +x.dataset.i + 1; let t = 0;
        rows.forEach((r, i) => { const v = d[i][j]; t += v; $('i', r).style.transform = `scaleX(${v / 34})`; $('b', r).textContent = usd(v); });
        o.tot.textContent = usd(t); o.dl.hidden = j === 1; fx(o.tot);
      }));
    },
    member(el, o, d) {
      const inp = $('input', el), b = $$('.rr-mem', el), none = $('.rr-none', el), card = $('.rr-mcard', el);
      const show = i => {
        const [n, t, no, ren, v, perks] = d[i];
        o.n.textContent = n; o.t.textContent = t + ' member'; o.no.textContent = no; o.ren.textContent = ren; o.v.textContent = v;
        o.perks.innerHTML = perks.map(p => `<span>${p}</span>`).join(''); press(b, b[i]); fx(card);
      };
      b.forEach((x, i) => x.addEventListener('click', () => show(i)));
      inp.addEventListener('input', () => {
        const q = inp.value.trim().toLowerCase(); let first = -1;
        b.forEach((x, i) => { const hit = d[i][0].toLowerCase().includes(q); x.hidden = !hit; if (hit && first < 0) first = i; });
        none.hidden = first >= 0; card.hidden = first < 0; if (first >= 0 && q) show(first);
      });
    },
    scan(el, o, d) {
      let i = 0, n = +o.n.textContent;
      const icon = { ok: IC.check, mem: IC.user, dup: IC.alert };
      $('.rr-body > .rr-btn', el).addEventListener('click', () => {
        i = (i + 1) % d.length;
        const [s, st, nm, ty, tm, sn, add] = d[i];
        n = Math.min(600, n + add); o.n.textContent = n; o.bar.style.transform = `scaleX(${n / 600})`;
        o.res.className = 'rr-res ' + s; $('.ri', o.res).innerHTML = SVG(icon[s]);
        o.st.textContent = st; o.nm.textContent = nm; o.ty.textContent = ty; o.tm.innerHTML = SVG(IC.clock) + tm; o.sn.textContent = sn; fx(o.res);
      });
    },
    flow(el, o) {
      const b = $$('.rr-step', el);
      b.forEach(x => x.addEventListener('click', () => { press(b, x); o.w.textContent = x.dataset.w; o.m.textContent = x.dataset.m; fx(o.m); }));
    },
    broadcast(el, o) {
      const b = $$('.rr-aud button', el), ta = $('textarea', el); let n = +b[0].dataset.n;
      b.forEach(x => x.addEventListener('click', () => { press(b, x); n = +x.dataset.n; o.n.textContent = n.toLocaleString('en-US'); o.a.textContent = x.dataset.a; fx(o.n); }));
      ta.addEventListener('input', () => o.c.textContent = ta.value.length);
      $('.rr-row .rr-btn', el).addEventListener('click', () => toast(el, ta.value.trim() ? `Sent to ${n.toLocaleString('en-US')} guests.` : 'Write a message first.'));
    },
    insights(el, o, d) {
      const b = $$('.rr-seg button', el), cols = $$('.rr-dcol', el); let t = d.tabs[0], day = 5;
      const sum = a => a.reduce((x, y) => x + y, 0);
      const tip = () => { const v = t.vals[day]; o.tip.innerHTML = `<b>${d.days[day]}</b> ` + t.ser.map((s, k) => `${s} ${usd0(v[k])}`).join(' · ') + ` · <b>${usd0(sum(v))}</b>`; };
      const pick = i => { day = i; press(cols, cols[i]); tip(); };
      b.forEach(x => x.addEventListener('click', () => {
        press(b, x); t = d.tabs[+x.dataset.i];
        cols.forEach((c, i) => $$('i', c).forEach((bar, k) => bar.style.transform = `scaleY(${t.vals[i][k] / t.top})`));
        t.ser.forEach((s, k) => o['l' + k].textContent = s); o.top.textContent = '$' + t.top / 1000 + 'k';
        o.tot.textContent = usd0(sum(t.vals.flat())); tip(); fx(o.tot);
      }));
      cols.forEach((c, i) => ['click', 'mouseenter', 'focus'].forEach(ev => c.addEventListener(ev, () => pick(i))));
    },
    donut(el, o, d) {
      const ring = $('.rr-ring', el), segs = $$('.sg', el), rows = $$('button.rr-dr', el);
      const pick = i => {
        ring.classList.toggle('hl', i >= 0); segs.forEach((s, k) => s.classList.toggle('on', k === i)); rows.forEach((r, k) => r.setAttribute('aria-pressed', k === i));
        o.n.textContent = i >= 0 ? rows[i].dataset.n : 'Total'; o.v.textContent = usd0(i >= 0 ? +rows[i].dataset.v : d.tot);
      };
      rows.forEach((r, i) => ['click', 'mouseenter', 'focus'].forEach(ev => r.addEventListener(ev, () => pick(i))));
      $('.rr-drs', el).addEventListener('mouseleave', () => pick(-1));
    },
    shift(el, o) {
      $$('.rr-sh .rr-btn', el).forEach(b => b.addEventListener('click', () => {
        const s = document.createElement('span'); s.className = 'rr-badge ok fx'; s.textContent = 'In 8:31 am'; b.replaceWith(s);
        o.n.textContent = +o.n.textContent + 1; toast(el, `${b.getAttribute('aria-label').replace('Clock in ', '')} clocked in at 8:31 am.`);
      }));
    },
    quote(el, o) {
      const sb = $$('.rr-seg button', el), mods = $$('.rr-mod', el);
      const fee = ['One fee for the modules you use, monthly or annual', 'Per ticket or a percentage of sales, so cost follows your season'];
      sb.forEach(x => x.addEventListener('click', () => { press(sb, x); o.fee.textContent = fee[+x.dataset.i]; fx(o.fee); }));
      mods.forEach(m => m.addEventListener('click', () => {
        flip(m); const list = mods.filter(isOn).map(x => x.textContent);
        o.mods.textContent = list.length ? list.join(', ') : 'Pick at least one module'; fx(o.mods);
      }));
    },
    plan(el, o) {
      const b = $$('.rr-gr', el);
      b.forEach(x => x.addEventListener('click', () => { press(b, x); o.d.textContent = x.dataset.d; o.w.textContent = x.dataset.w; fx(o.d.parentElement); }));
    }
    ,
    roundup(el, o, d) {
      let up = false, day = d.day;
      const tot = () => d.sub + (up ? d.up : 0);
      const upd = () => { o.tot.textContent = usd(tot()); o.go.textContent = 'Charge ' + usd(tot()); fx(o.tot); };
      o.sw.addEventListener('click', () => { up = !up; o.sw.setAttribute('aria-checked', up); upd(); });
      o.go.addEventListener('click', () => {
        if (up) { day += d.up; o.day.textContent = usd(day); }
        toast(el, `Payment approved · ${usd(tot())}${up ? ` · ${usd(d.up)} to conservation` : ''}`);
      });
    },
    scpos(el, o, d) {
      let cart = JSON.parse(JSON.stringify(d.cart)), sel = 0;
      const counts = d.rates.map(() => 0), tiles = $$('.rt', el), evs = $$('.evs .ev', el);
      const lineSum = c => c.lines.reduce((s, l) => s + l[1] * l[2], 0), qty = c => c.lines.reduce((s, l) => s + l[1], 0);
      const SVGM = SVG(IC.minus), EDIT = SVG('<path d="M3 13l1-3.5L11 2.5 13.5 5 6.5 12zM9.5 4l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>');
      const render = () => {
        o.cart.innerHTML = cart.length ? cart.map((c, i) => `<div class="pc" data-i="${i}"><div class="pc-h"><b>${c.ev}</b><button class="mi" data-rm="${i}" aria-label="Remove ${c.ev}">${SVGM}</button><span class="amt">${EDIT}${usd(lineSum(c))}</span></div>`
          + c.lines.map(l => `<span class="pln"><span class="q">${l[1]}</span>${l[0]}<b>${usd(l[1] * l[2])}</b></span>`).join('')
          + `<div class="sched"><span>Schedule</span></div><div class="pc-s"><span>Sat, Jul 11, 2026<small>Location: Main Office · ${c.when}</small></span><span class="ckd">Checked in: <b>${c.chk} of ${qty(c)}</b><button class="mc" data-ci="${i}" aria-pressed="${c.chk === qty(c)}">Manual Check-in</button></span></div></div>`).join('')
          : '<p class="muted-s">Cart is empty. Tap a rate to add guests.</p>';
        const sub = cart.reduce((s, c) => s + lineSum(c), 0), tax = Math.round(sub * d.tax * 100) / 100, tot = sub + tax;
        o.sub.textContent = usd(sub); o.tax.textContent = usd(tax); o.tot.textContent = usd(tot); o.due2.textContent = usd(tot); o.due.dataset.t = tot;
        o.pamt.textContent = usd(tot); o.pst.textContent = 'Card reader, Till 2'; o.pmsg.textContent = tot ? 'Tap, insert or swipe' : 'Nothing to charge'; o.pay.classList.remove('ok');
      };
      const setCounts = () => { tiles.forEach((t, i) => $('b', t).textContent = counts[i]); o.save.disabled = !counts.some(Boolean); };
      tiles.forEach((t, i) => t.addEventListener('click', () => { counts[i]++; setCounts(); fx($('b', t)); }));
      evs.forEach((b, i) => b.addEventListener('click', () => { press(evs, b); sel = i; }));
      o.clr.addEventListener('click', () => { counts.fill(0); setCounts(); });
      o.save.addEventListener('click', () => {
        const [when, name] = d.evs[sel];
        cart.push({ ev: name, when, lines: d.rates.map((r, i) => [r[0], counts[i], r[1]]).filter(l => l[1]), chk: 0 });
        counts.fill(0); setCounts(); render(); toast(el, `${name} at ${when} added to the cart.`);
      });
      o.cart.addEventListener('click', e => {
        const rm = e.target.closest('[data-rm]'), ci = e.target.closest('[data-ci]');
        if (rm) { cart.splice(+rm.dataset.rm, 1); render(); }
        if (ci) { const c = cart[+ci.dataset.ci]; c.chk = c.chk === qty(c) ? 0 : qty(c); render(); }
      });
      o.new.addEventListener('click', () => { cart = []; render(); });
      o.due.addEventListener('click', () => {
        const t = +o.due.dataset.t; if (!t) return toast(el, 'Add a guest first.');
        o.pay.classList.add('ok'); o.pst.textContent = 'Approved'; o.pmsg.textContent = 'Card · receipt sent by email'; fx(o.pay);
        toast(el, `Payment approved · ${usd(t)}`);
      });
      setCounts(); render();
    },
    scscan(el, o, d) {
      let i = 0, n = +o.n.textContent;
      const tabs = $$('.rr-seg button', el), ph = ['QR code, serial, or barcode', 'Name, email or order number', 'Ticket serial to manage'];
      tabs.forEach((t, k) => t.addEventListener('click', () => { press(tabs, t); o.in.placeholder = ph[k]; $('.sr', o.in.parentElement).textContent = ph[k]; }));
      const show = k => {
        i = k; const [s, st, nm, pr, ty, tm, ct, sn, add] = d[k];
        n = Math.min(600, n + add); o.n.textContent = n; o.bar.style.transform = `scaleX(${n / 600})`;
        o.res.className = 'scn-r ' + s; o.ri.innerHTML = SVG(s === 'dup' ? IC.alert : IC.check);
        o.st.textContent = st; o.nm.textContent = nm; o.pr.textContent = pr; o.ty.textContent = ty; o.tm.innerHTML = SVG(IC.clock) + tm; o.ct.textContent = ct;
        o.in.value = sn; fx(o.res);
      };
      o.go.addEventListener('click', () => show((i + 1) % d.length));
      o.in.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const k = d.findIndex(t => t[7].toLowerCase() === o.in.value.trim().toLowerCase());
        show(k >= 0 ? k : (i + 1) % d.length);
      });
    },
    sccal(el, o) {
      const b = $$('button.cd', el);
      b.forEach(c => c.addEventListener('click', () => {
        press(b, c); const p = +c.dataset.p;
        o.day.firstChild.textContent = c.dataset.day + ' · Adult '; o.ad.textContent = '$' + p;
        o.sp.textContent = usd(p * .6); o.mp.textContent = usd(p * .72); o.l1.textContent = c.dataset.left; o.l2.textContent = Math.max(1, c.dataset.left - 1); fx(o.sp.closest('.ov-price'));
      }));
    },
    scrules(el, o, d) {
      const tabs = $$('[role=tab]', el), panes = $$('.po-p', el);
      tabs.forEach((t, k) => t.addEventListener('click', () => { tabs.forEach(x => x.setAttribute('aria-selected', x === t)); panes.forEach((p, j) => p.hidden = j !== k); }));
      $$('.po-p .rr-rule', el).forEach(s => s.addEventListener('click', () => s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true')));
      const pills = $$('.rp', el);
      const hl = () => $$('.pband', el).forEach((t, j) => {
        t.addEventListener('mouseenter', () => pills.forEach((p, k) => p.style.opacity = k === j || (j === 0 && k === 0) ? 1 : .45));
        t.addEventListener('mouseleave', () => pills.forEach(p => p.style.opacity = 1));
      });
      hl();
      o.add.addEventListener('click', () => {
        if ($('.pband[data-b="2"]', el)) return toast(el, 'Rule 3 is already on.');
        o.bands.insertAdjacentHTML('beforeend', d.band3); fx($('.pband[data-b="2"]', el)); pills[2].hidden = false; fx(pills[2]); hl();
        o.add.disabled = true; toast(el, 'Rule 3 added: prices drop 1 hour before it starts.');
      });
    },
    scflow(el, o) {
      const steps = () => $$('.fn.s', el);
      const pick = x => { press(steps(), x); o.w.textContent = x.dataset.w; o.m.textContent = x.dataset.m; fx(o.m); };
      $('.flw', el).addEventListener('click', e => { const x = e.target.closest('.fn.s'); if (x) pick(x); });
      o.add.addEventListener('click', () => {
        if (o.add.classList.contains('done')) return;
        o.add.classList.add('done', 's'); $('.w', o.add).textContent = o.add.dataset.w; $('.t', o.add).textContent = 'Send Membership Upsell';
        pick(o.add); toast(el, 'Step added. Every guest gets it 2 hours after they arrive.');
      });
    },
    scins(el, o, d) {
      let m = d.m['Net Revenue'], name = 'Net Revenue';
      const off = new Set(), cols1 = $$('[data-o=b1] .bcol', el), cols2 = $$('[data-o=b2] .bcol', el);
      const fmt = v => (m.unit ? '$' : '') + Math.round(v).toLocaleString('en-US');
      const donut = (svg, vals) => { const tot = vals.reduce((a, b) => a + b, 0) || 1; let cum = 0; $$('.sg', svg).forEach((s, k) => { const pct = vals[k] / tot * 100; s.setAttribute('stroke-dasharray', `${pct} ${100 - pct}`); s.setAttribute('stroke-dashoffset', 25 - cum); cum += pct; }); };
      const draw = () => {
        const top1 = Math.max(...m.ch.map(x => Math.max(...x))) * 1.1, top2 = Math.max(...m.of.map(x => Math.max(...x))) * 1.1;
        cols1.forEach((c, i) => $$('i', c).forEach((b, k) => b.style.transform = `scaleY(${off.has(k) ? 0 : m.ch[i][k] / top1})`));
        cols2.forEach((c, i) => $$('i', c).forEach((b, k) => b.style.transform = `scaleY(${m.of[i][k] / top2})`));
        const t1 = [0, 1].map(k => off.has(k) ? 0 : m.ch.reduce((s, x) => s + x[k], 0)), t2 = [0, 1, 2, 3].map(k => m.of.reduce((s, x) => s + x[k], 0));
        donut($('[data-o=d1]', el), t1); donut($('[data-o=d2]', el), t2);
        $$('[data-l1]', el).forEach((b, k) => b.textContent = fmt(t1[k])); $$('[data-l2]', el).forEach((b, k) => b.textContent = fmt(t2[k]));
        const days = m.ch.map(x => x.reduce((s, v, k) => s + (off.has(k) ? 0 : v), 0)), mx = Math.max(...days) || 1;
        o.ml.textContent = (name === 'Net Revenue' ? 'Net revenue' : 'Tickets sold') + ', Jul 6 to 12'; o.mv.textContent = fmt(days.reduce((a, b) => a + b, 0)); fx(o.mv);
        $$('i', o.mb).forEach((b, k) => b.style.transform = `scaleY(${days[k] / mx})`);
      };
      o.sel.addEventListener('change', () => { name = o.sel.value; m = d.m[name]; draw(); });
      cols1.forEach((c, i) => ['mouseenter', 'click'].forEach(ev => c.addEventListener(ev, () => {
        cols1.forEach(x => x.classList.toggle('on', x === c));
        o.tip.textContent = `${d.days[i]}: ` + d.ch.map((n, k) => `${n} ${off.has(k) ? 'filtered out' : fmt(m.ch[i][k])}`).join(' · ');
      })));
      o.ft.addEventListener('click', () => { const v = o.ft.getAttribute('aria-expanded') !== 'true'; o.ft.setAttribute('aria-expanded', v); o.fd.hidden = !v; });
      $$('[data-f]', o.fd).forEach(c => c.addEventListener('change', () => { c.checked ? off.delete(+c.dataset.f) : off.add(+c.dataset.f); draw(); }));
    },
    scinv(el, o) {
      const ins = $$('.dkt input', el);
      const calc = () => {
        let n = 0, v = 0;
        ins.forEach(i => { const q = Math.max(0, Math.min(+i.max, Math.round(+i.value || 0))); n += q; v += q * +i.dataset.u; });
        o.cnt.textContent = n; o.cbar.style.transform = `scaleX(${n / 25})`; o.dval.textContent = usd(v); return n;
      };
      ins.forEach(i => i.addEventListener('input', calc));
      o.fin.addEventListener('click', () => {
        const n = calc(); if (!n) return toast(el, 'Count what arrived first.');
        const st = n >= 25 ? 'Complete' : 'Partially Complete', row = $('tr[data-po="37"]', el);
        $('[data-st]', row).innerHTML = `<span class="pst pst-${st.split(' ')[0].toLowerCase()}">${st}</span>`;
        row.classList.add('hit'); setTimeout(() => row.classList.remove('hit'), 1600);
        o.dst.textContent = 'Received'; toast(el, `Docket #7 received: ${n} of 25. Order #37 is ${st.toLowerCase()}.`);
      });
      o.new.addEventListener('click', () => {
        o.rows.insertAdjacentHTML('afterbegin', '<tr data-po="38" class="hit"><td data-st><span class="pst pst-draft">Draft</span></td><td>38</td><td>Plush and Co.</td><td>0</td><td>USD $0.00</td><td>Maya R.</td><td>Today</td></tr>');
        o.new.disabled = true; toast(el, 'Purchase order #38 started as a draft.');
      });
    },
    scbi(el, o, d) {
      $$('.ex', el).forEach(b => b.addEventListener('click', () => {
        const open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open); $('.sr', b).textContent = open ? 'Collapse' : 'Expand';
        b.firstElementChild.outerHTML = SVG(open ? IC.minus : '<path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>');
        $$(`tr.chl[data-g="${b.dataset.g}"]`, el).forEach(r => r.hidden = !open);
      }));
      const mh = $$('.mh', el);
      mh.forEach(b => b.addEventListener('click', () => {
        press(mh, b); const m = b.dataset.m, rows = d[m];
        $$('td[data-m]', el).forEach(td => td.classList.toggle('on', td.dataset.m === m));
        o.mo.textContent = m; o.ord.textContent = rows.reduce((s, r) => s + r[0], 0).toLocaleString('en-US'); o.net.textContent = usd(rows.reduce((s, r) => s + r[1], 0)); fx(o.ord);
      }));
    },
    scmem(el, o, d) {
      const fs = $$('.mf', el), ins = fs.map(f => $('input', f));
      o.find.addEventListener('click', () => {
        const q = o.q.value.trim().toLowerCase();
        const c = q && d.find(x => (x[0] + ' ' + x[1]).toLowerCase().includes(q));
        if (!c) return toast(el, q ? 'No contact by that name. Fill in the details below.' : 'Type a name to search.');
        c.forEach((v, k) => ins[k].value = v); fs.forEach(f => f.classList.remove('err'));
        toast(el, `Found ${c[0]} ${c[1]}. Details filled in.`);
      });
      const photo = () => { const ini = ((ins[0].value[0] || '') + (ins[1].value[0] || '')).toUpperCase(); o.av.hidden = false; o.av.textContent = ini || 'New'; fx(o.av); };
      o.snap.addEventListener('click', photo); o.upl.addEventListener('click', photo);
      o.save.addEventListener('click', () => {
        let bad = null;
        fs.forEach((f, k) => {
          const i = ins[k], m = $('.msg', f); let msg = '';
          if (!i.value.trim()) msg = 'Required.';
          else if (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value)) msg = 'Use an email like name@example.com.';
          f.classList.toggle('err', !!msg); m.textContent = msg; i.setAttribute('aria-invalid', !!msg); if (msg && !bad) bad = i;
        });
        if (bad) return bad.focus();
        toast(el, `Member saved. Digital card sent to ${ins[2].value.trim()}.`);
      });
      const outs_ = $$('.rr-stp output', el), n = () => outs_.reduce((s, x) => s + +x.dataset.n, 0);
      el.addEventListener('change', e => { if (e.target.closest('.rr-stp')) { const k = n(); o.cont.disabled = !k; } });
      o.cont.addEventListener('click', () => toast(el, `${plural(n(), 'guest')} checked in on the season pass.`));
      o.cancel.addEventListener('click', () => toast(el, 'Scan cancelled. Nothing was redeemed.'));
    },
    scmt(el, o) {
      let v = 6;
      o.go.addEventListener('click', () => { v++; o.ok.hidden = false; o.ln.textContent = `5 guests in · visit ${v} this season`; fx(o.ok); });
    },
    scrp(el, o, d) {
      const bot = SVG('<path d="M9.2 1L3 9.2h4.3L6.6 15 13 6.8H8.6z" fill="currentColor"/>');
      const add = (cls, av, txt) => { o.th.insertAdjacentHTML('beforeend', `<div class="m ${cls}"><span class="av">${av}</span><p>${txt}</p></div>`); return o.th.lastElementChild; };
      $$('.rp-q button', el).forEach(b => b.addEventListener('click', () => {
        const [q, a] = d[+b.dataset.r]; b.disabled = true;
        add('g', 'SR', q);
        const t = add('a typing', bot, 'Relay is typing');
        setTimeout(() => { t.classList.remove('typing'); $('p', t).textContent = a; }, reduce ? 0 : 900);
      }));
    }
  };
  $$('.rr[data-rr]').forEach(el => { steppers(el); const f = RR[el.dataset.rr]; f && f(el, outs(el), el.dataset.d ? JSON.parse(el.dataset.d) : null); });

  /* Scroll loop for the one pinned scene */
  let ticking = false;
  const frame = () => { ticking = false; heroUpdate(); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
})();

/* Relay revenue calculator (rc-). Every number on the page comes from the inputs; nothing is stored or sent.
   The same card runs as a teaser on the Relay page (no text cards there: it uses the four default texts). */
(() => {
  const card = document.querySelector('.rc-card');
  if (!card) return;
  const root = document;
  const $ = (s, el = root) => el.querySelector(s), $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const full = !!$('.rc-grid');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const usd = (v, c = 0) => '$' + v.toLocaleString('en-US', {minimumFractionDigits: c, maximumFractionDigits: c});
  const pct = v => (v % 1 ? v.toFixed(1) : v) + '%';
  const shown = new Map();
  function tween(el, to, fmt) {  // count from the last shown value to the new one
    const from = shown.get(el) ?? 0; shown.set(el, to);
    if (still || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 450), e = 1 - (1 - k) ** 3; el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const ins = $$('.rc-sentence input', card), hint = $('.rc-hint', card);
  const lim = i => (card.getAttribute('data-' + i.id) || '0,1e12').split(',').map(Number);
  const digits = el => parseFloat(el.value.replace(/[^0-9.]/g, '')) || 0;
  const num = el => { const [lo, hi] = lim(el), v = digits(el); return Math.min(hi, Math.max(lo, v || lo)); };  // the maths never sees "abc" or a 12-digit number
  // a shared scenario link carries the two numbers, digits only
  const q = new URLSearchParams(location.search);
  ins.forEach(i => { const v = (q.get(i.id === 'rc-t' ? 't' : 's') || '').replace(/\D/g, ''); if (full && v) i.value = (+v).toLocaleString('en-US'); });
  const start = { ins: ins.map(i => i.value), m: $$('.rc-m').map(m => [m.dataset.rate, m.dataset.val, $('.rc-tog', m).getAttribute('aria-pressed')]) };

  function calc() {
    const tix = num($('#rc-t')), spend = num($('#rc-s'));
    let perGuest = full ? 0 : +card.dataset.pg, yes = 0;
    const lit = [];
    $$('.rc-m').forEach(m => {
      const k = m.dataset.m, on = $('.rc-tog', m).getAttribute('aria-pressed') === 'true';
      const rate = +m.dataset.rate, val = +m.dataset.val, pg = on ? rate / 100 * val : 0;
      m.classList.toggle('on', on);
      $(`[data-b="${k}"]`).classList.toggle('on', on);
      if (val) {
        $('.rc-add', m).textContent = on ? '+' + usd(tix * pg) : '';
        const say = $('[data-say]', m); if (say) say.textContent = `${pct(rate)} of guests say yes, $${val} each`;
        const row = $(`[data-r="${k}"]`);
        $('[data-c="rate"]', row).textContent = pct(rate); $('[data-c="val"]', row).textContent = usd(val);
        $('[data-c="add"]', row).textContent = on ? usd(tix * pg) : 'Off';
        row.classList.toggle('off', !on);
        if (on) { perGuest += pg; yes += rate; lit.push([getComputedStyle(m).getPropertyValue('--c'), Math.round(rate)]); }
        $(`[data-seg="${k}"]`).style.flexGrow = pg;
      }
    });
    const total = tix * perGuest;
    $$('[data-out="add"]').forEach(el => tween(el, total, v => usd(v)));
    $$('[data-out="pc0"],[data-co="pc0"]').forEach(el => el.textContent = usd(spend, 2));
    $$('[data-out="pc1"],[data-co="pc1"]').forEach(el => tween(el, spend + perGuest, v => usd(v, 2)));
    $$('a[href*="relay="]').forEach(a => a.href = a.href.replace(/relay=\d+/, 'relay=' + Math.round(total)));  // the demo ask carries the number
    if (!full) return;
    $('[data-out="yes"]').textContent = Math.round(yes);
    const dots = $$('.rc-dots i'); let i = 0;
    lit.forEach(([c, n]) => { for (let j = 0; j < n && i < 100; j++, i++) dots[i].style.background = c; });
    for (; i < 100; i++) dots[i].style.background = '';
    $('.rc-bar').classList.toggle('empty', !perGuest);
  }

  $$('.rc-tog').forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); calc(); }));
  $$('.rc-tune input').forEach(r => r.addEventListener('input', () => {
    const m = r.closest('.rc-m'); m.dataset[r.dataset.k] = r.value;
    $(`[data-o="${r.dataset.k}"]`, m).textContent = r.dataset.k === 'rate' ? pct(+r.value) : '$' + r.value;
    calc();
  }));
  const open = $('[data-rc-open]', card);
  ins.forEach(i => {
    const fit = () => { i.style.width = Math.max(2, i.value.length) * .62 + 'em'; };  // the input grows with what's typed
    i.addEventListener('input', () => {
      const clean = i.value.replace(/[^\d,]/g, ''); if (clean !== i.value) i.value = clean;  // digits only, so "abc" never reaches the maths
      fit(); calc();
      if (open) open.href = open.href.split('?')[0] + `?t=${num($('#rc-t'))}&s=${num($('#rc-s'))}`;
    });
    i.addEventListener('blur', () => {  // accept "120000", "120,000" or "$38", show it tidy; clamp to a sane range and say so
      const [lo, hi] = lim(i), raw = digits(i), v = num(i);
      i.value = v.toLocaleString('en-US'); fit();
      if (hint) hint.textContent = raw !== v ? (i.id === 'rc-t' ? `We kept tickets between ${lo.toLocaleString('en-US')} and ${hi.toLocaleString('en-US')} a year.` : `We kept spend per guest between $${lo} and $${hi}.`) : '';
      calc();
    });
    fit();
  });
  const reset = $('.rc-reset');
  reset && reset.addEventListener('click', () => {
    ins.forEach((i, k) => { i.value = start.ins[k]; i.dispatchEvent(new Event('input')); });
    $$('.rc-m').forEach((m, k) => {
      const [r, v, on] = start.m[k]; m.dataset.rate = r; m.dataset.val = v; $('.rc-tog', m).setAttribute('aria-pressed', on);
      $$('.rc-tune input', m).forEach(x => { x.value = x.dataset.k === 'rate' ? r : v; $(`[data-o="${x.dataset.k}"]`, m).textContent = x.dataset.k === 'rate' ? pct(+r) : '$' + v; });
    });
    if (hint) hint.textContent = '';
    calc();
  });
  if (full) {  // on phones the result sits below the cards: a dock carries the total while the cards are on screen and the result is not
    const dock = $('.rc-dock'), vis = {};
    const io = new IntersectionObserver(es => {
      es.forEach(e => vis[e.target === $('.rc-out') ? 'out' : 'list'] = e.isIntersecting);
      dock.classList.toggle('show', vis.list && !vis.out && innerWidth < 900);
    });
    io.observe($('.rc-out')); io.observe($('.rc-list'));
  }
  calc();
})();
