/* Learn: search, drawer, on-this-page rail, filters kept in the URL, guide form. Nothing is sent anywhere. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement.dataset.root || './';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hdr = $('.lh');
  const setH = () => document.documentElement.style.setProperty('--lh', hdr.offsetHeight + 'px');
  setH(); addEventListener('resize', setH);

  /* Remote in-body images that fail: drop the figure rather than show a broken image */
  const drop = i => (i.closest('figure') || i).remove();
  document.addEventListener('error', e => { if (e.target.tagName === 'IMG') drop(e.target); }, true);
  $$('main img').forEach(i => { if (i.complete && i.getAttribute('src') && !i.naturalWidth) drop(i); });

  /* Drawer (sidebar under 900px) */
  const menu = $('.lh-menu'), scrim = $('.lscrim'), side = $('#lside');
  const nav = open => {
    document.body.classList.toggle('nav-open', open); menu.setAttribute('aria-expanded', open); scrim.hidden = !open;
    open ? $('a', side).focus() : menu.focus();
  };
  menu.addEventListener('click', () => nav(!document.body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => nav(false));

  /* Search across every Learn item (window.LEARN_INDEX from assets/learn/index.js) */
  const IX = window.LEARN_INDEX || [], q = $('#lq'), box = $('#lqr'), sb = $('.lh-sb');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  IX.forEach(x => { x._t = norm(x.t); x._a = norm(`${x.k} ${x.m} ${x.d}`); });
  let res = [], sel = -1;
  const find = s => {
    const ws = norm(s).split(/\s+/).filter(Boolean), out = [];
    if (!ws.length) return out;
    for (const x of IX) {
      let sc = 0;
      for (const w of ws) {
        const i = x._t.indexOf(w);
        if (i >= 0) sc += (i === 0 || x._t[i - 1] === ' ') ? 4 : 2;
        else if (x._a.includes(w)) sc += 1;
        else { sc = -1; break; }
      }
      if (sc > 0) out.push([sc, x]);
    }
    return out.sort((a, b) => b[0] - a[0]).slice(0, 8).map(a => a[1]);
  };
  const url = x => /^https?:/.test(x.u) ? x.u : root + x.u;
  const mark = () => {
    $$('[role=option]', box).forEach((o, i) => o.setAttribute('aria-selected', i === sel));
    if (sel >= 0) { q.setAttribute('aria-activedescendant', 'lqo' + sel); $('#lqo' + sel).scrollIntoView({ block: 'nearest' }); }
    else q.removeAttribute('aria-activedescendant');
  };
  const shut = () => { box.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); };
  const render = () => {
    const v = q.value.trim();
    if (!v) return shut();
    res = find(v); sel = res.length ? 0 : -1;
    box.innerHTML = res.length
      ? res.map((x, i) => `<li role="option" id="lqo${i}"><a href="${esc(url(x))}" tabindex="-1"><b>${esc(x.t)}</b><span>${esc(x.k)}${x.m ? ' · ' + esc(x.m) : ''}</span></a></li>`).join('')
      : `<li class="lq0" role="option" aria-disabled="true">Nothing in Learn matches “${esc(v)}”. Try one word, like pricing or OTA.</li>`;
    box.hidden = false; q.setAttribute('aria-expanded', 'true'); mark();
  };
  const openS = () => { hdr.classList.add('so'); sb.setAttribute('aria-expanded', 'true'); q.focus(); };
  const closeS = () => { hdr.classList.remove('so'); sb.setAttribute('aria-expanded', 'false'); };
  q.addEventListener('input', render);
  q.addEventListener('focus', () => { if (q.value.trim()) render(); });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && res.length) { sel = (sel + 1) % res.length; mark(); e.preventDefault(); }
    else if (e.key === 'ArrowUp' && res.length) { sel = (sel - 1 + res.length) % res.length; mark(); e.preventDefault(); }
    else if (e.key === 'Enter' && sel >= 0 && !box.hidden) { e.preventDefault(); location.href = url(res[sel]); }
    else if (e.key === 'Escape') { if (q.value) { q.value = ''; shut(); } else { q.blur(); closeS(); sb.offsetParent && sb.focus(); } }
  });
  sb.addEventListener('click', () => hdr.classList.contains('so') ? closeS() : openS());
  document.addEventListener('click', e => { if (!e.target.closest('.srch, .lh-sb')) { shut(); closeS(); } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); getComputedStyle(sb).display === 'none' ? q.focus() : openS(); }
    else if (e.key === 'Escape' && document.body.classList.contains('nav-open')) nav(false);
  });

  /* On this page: highlight the section in view; the mobile list closes after a jump */
  const tl = $$('.otp a'), secs = tl.map(a => [a, document.getElementById(decodeURIComponent(a.hash.slice(1)))]).filter(x => x[1]);
  if (secs.length) {
    const spy = () => { let cur = secs[0]; for (const s of secs) if (s[1].getBoundingClientRect().top < innerHeight * .3) cur = s; tl.forEach(a => a.classList.toggle('on', a === cur[0])); };
    addEventListener('scroll', spy, { passive: true }); spy();
  }
  $$('.mtoc a').forEach(a => a.addEventListener('click', () => { a.closest('details').open = false; }));

  /* Filters: groups combine; state lives in the URL query so reload and Back keep it */
  $$('[data-list]').forEach(L => {
    const groups = $$('.lfg', L), items = $$('[data-items]>li', L), n = $('[data-n]', L), none = $('.lzero', L), more = $('[data-more]', L), page = +L.dataset.page || 0;
    let shown = page;
    const press = (g, b) => $$('button', g).forEach(x => x.setAttribute('aria-pressed', x === b));
    const val = g => $('[aria-pressed=true]', g).dataset.v;
    const params = new URLSearchParams(location.search);
    groups.forEach(g => press(g, $$('button', g).find(b => b.dataset.v === (params.get(g.dataset.key) || '')) || $('button', g)));
    const apply = save => {
      const want = groups.map(g => [g.dataset.key, val(g)]);
      let k = 0;
      items.forEach(it => {
        const ok = want.every(([key, v]) => !v || (key === 'obj' ? (it.dataset.obj || '').split(' ').includes(v) : it.dataset[key] === v));
        if (ok) k++;
        it.hidden = !ok || (page > 0 && k > shown);
      });
      n.textContent = k; none.hidden = k > 0;
      if (more) more.parentNode.hidden = !page || k <= shown;
      if (save) {
        const p = new URLSearchParams(location.search);
        want.forEach(([key, v]) => v ? p.set(key, v) : p.delete(key));
        history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
      }
      const cat = want.find(w => w[0] === 'cat');
      if (cat) $$('.ls a[data-cat]').forEach(a => a.dataset.cat === cat[1] ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
    };
    groups.forEach(g => $$('button', g).forEach(b => b.addEventListener('click', () => { press(g, b); shown = page; apply(true); })));
    const clr = $('[data-clear]', L);
    if (clr) clr.addEventListener('click', () => { groups.forEach(g => press(g, $('button', g))); shown = page; apply(true); $('button', groups[0]).focus(); });
    if (more) more.addEventListener('click', () => { shown += page; apply(false); });
    apply(false);
  });

  /* Guide form: validate, then open the guide on the page. Concept: nothing is sent. */
  $$('form[data-guide]').forEach(form => {
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
      const r = $('#guide');
      $('[data-gname]', r).textContent = $('#g-first').value.trim();
      form.hidden = true; r.hidden = false; $('#gread-h').focus();
    });
  });
})();
