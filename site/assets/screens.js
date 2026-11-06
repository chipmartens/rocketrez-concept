/* screens lane: behaviour for the ui.py screen recreations. Loads after main.js (which wires the older screens). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const press = (all, b) => all.forEach(x => x.setAttribute('aria-pressed', x === b));
  const fx = n => { if (!n || reduce) return; n.classList.remove('fx'); void n.offsetWidth; n.classList.add('fx'); };
  const toast = (el, msg) => { const t = $('.rr-toast', el); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800); };

  /* ---- the floating piece: put each .ov over empty UI or field margin, 24px inside the field, never over text.
     Obstacles are the window's text, form controls and drawn marks. If nothing fits, the field grows a band on top
     and the piece sits there. ponytail: grid scan at 8px, O(cells x obstacles) per stage; fine for a dozen stages. */
  const INSET = 24, PAD = 6, STEP = 8;
  const rel = (r, f) => ({ l: r.left - f.left, t: r.top - f.top, r: r.right - f.left, b: r.bottom - f.top });
  const obstacles = (st, ov, f, near) => {
    const win = $('.win', st), out = [], rg = document.createRange(), tw = document.createTreeWalker(win, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const pe = n.parentElement;
      if (!n.textContent.trim() || pe.closest('.sr,[hidden]') || !pe.getClientRects().length) continue;
      rg.selectNodeContents(n);
      for (const t of rg.getClientRects()) if (t.width) out.push(rel(t, f));
    }
    const marks = 'input,select,textarea,svg,.rr-meter,.kp,.sw' + (ov.querySelector('.ov-tip') ? '' : ',.bcol,.mbars,.dm-ch,.ch-bar');
    $$(marks, win).forEach(e => { const r = e.getBoundingClientRect(); if (r.width) out.push(rel(r, f)); });
    if (near) out.push(rel(near.getBoundingClientRect(), f));
    return out;
  };
  const lead = (st, ov, near, fr, o) => {  // o: the piece's target box (its rect may still be mid-transition)
    let ln = $('.ov-lead', st.querySelector('.field'));
    if (!near || !(ov.querySelector('.ov-tip,.ov-conn'))) { if (ln) ln.remove(); return; }
    if (!ln) { ln = document.createElement('i'); ln.className = 'ov-lead'; ln.setAttribute('aria-hidden', 'true'); st.querySelector('.field').append(ln); }
    const t = rel(near.getBoundingClientRect(), fr);
    let x1, y1, x2, y2;
    if (o.l >= t.r - 8) { x1 = t.r; y1 = (t.t + t.b) / 2; x2 = o.l; y2 = Math.min(Math.max(y1, o.t + 12), o.b - 12); }
    else if (o.r <= t.l + 8) { x1 = t.l; y1 = (t.t + t.b) / 2; x2 = o.r; y2 = Math.min(Math.max(y1, o.t + 12), o.b - 12); }
    else { x1 = (t.l + t.r) / 2; y1 = o.b <= t.t ? t.t : t.b; x2 = Math.min(Math.max(x1, o.l + 12), o.r - 12); y2 = o.b <= t.t ? o.b : o.t; }
    const len = Math.hypot(x2 - x1, y2 - y1);
    Object.assign(ln.style, { left: x1 + 'px', top: y1 + 'px', width: len + 'px', transform: `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`, display: len < 6 ? 'none' : '' });
  };
  const place = st => {
    const ov = $('.ov', st), field = $('.field', st);
    if (!ov || !field) return;
    if (getComputedStyle(ov).position !== 'absolute') { ov.style.left = ov.style.top = ov.style.width = ''; field.style.paddingTop = ''; lead(st, ov, null); return; }
    const was = [ov.style.left, ov.style.top];
    ov.style.transition = 'none';
    Object.assign(ov.style, { width: '', left: '0px', top: '0px', right: 'auto', bottom: 'auto' });
    ov.style.width = ov.offsetWidth + 'px';
    [ov.style.left, ov.style.top] = was; void ov.offsetWidth; ov.style.transition = '';  // lock the width so it doesn't rewrap (and grow) near the field's right edge
    const first = ov.firstElementChild, nearSel = first && first.dataset.near, near = nearSel ? $(nearSel, st) : null;
    const a = [...st.classList].find(c => /^a-(tl|tr|bl|br)$/.test(c)) || 'a-tl';
    const go = () => {
      const f = field.getBoundingClientRect(), W = f.width, H = f.height, w = ov.offsetWidth, h = ov.offsetHeight;
      const obs = obstacles(st, ov, f, near);
      const ax = a[3] === 'l' ? INSET : W - INSET - w, ay = a[2] === 't' ? INSET : H - INSET - h;  // 'a-tr': [2] is t/b, [3] is l/r
      const tg = near ? rel(near.getBoundingClientRect(), f) : null;
      let best = null, bc = Infinity;
      for (let y = INSET; y <= H - INSET - h; y += STEP) for (let x = INSET; x <= W - INSET - w; x += STEP) {
        let c;
        if (tg) { const dx = Math.max(0, tg.l - (x + w), x - tg.r), dy = Math.max(0, tg.t - (y + h), y - tg.b); c = Math.hypot(dx, dy) + Math.hypot(x - ax, y - ay) * .02; }
        else c = Math.hypot(x - ax, y - ay);
        if (c >= bc) continue;
        let hit = false;
        for (const o of obs) if (o.l - PAD < x + w && o.r + PAD > x && o.t - PAD < y + h && o.b + PAD > y) { hit = true; break; }
        if (!hit) { bc = c; best = [x, y]; }
      }
      return best;
    };
    field.style.paddingTop = '';
    let p = go();
    // nothing free: open a band above the window, the least that lets the piece overlap only empty window chrome
    const pt = parseFloat(getComputedStyle(field).paddingTop);
    for (let k = 72; !p && k >= 0; k -= 12) { field.style.paddingTop = Math.max(pt, ov.offsetHeight + INSET * 2 - k) + 'px'; p = go(); }
    p = p || [INSET, INSET];
    Object.assign(ov.style, { left: p[0] + 'px', top: p[1] + 'px', right: 'auto', bottom: 'auto' });
    lead(st, ov, near, field.getBoundingClientRect(), { l: p[0], t: p[1], r: p[0] + ov.offsetWidth, b: p[1] + ov.offsetHeight });
  };
  const stages = () => $$('.stage:not(.scr2)');  // lane B's screens (ui_more.py) reserve their own room
  const placeAll = () => stages().forEach(place);
  window.RRplace = placeAll;  // tests and the page lane can re-run it after layout changes
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(placeAll));
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(placeAll, 150); });

  /* ---- extra behaviour on screens main.js already drives ---- */
  const S = {
    scpos(el) {  // the receipt reprints from the cart
      const cart = $('[data-o=cart]', el), rl = $('[data-rl]', el), slip = $('.ov-rcpt', el);
      const draw = () => { rl.innerHTML = $$('.pc', cart).map(c => `<p><span>${$('.pc-h b', c).textContent}</span><span>${$('.amt', c).textContent}</span></p>`).join('') || '<p><span>Nothing in the cart</span><span></span></p>'; };
      new MutationObserver(draw).observe(cart, { childList: true });
      $('[data-o=due]', el).addEventListener('click', () => { if (slip.classList.contains('ok')) { slip.classList.remove('print'); void slip.offsetWidth; slip.classList.add('print'); } });
    },
    scscan(el) {  // the toast follows the scan result
      const res = $('[data-o=res]', el), v = $('.ov-valid', el), lab = $('[data-v]', el);
      new MutationObserver(() => {
        const dup = res.classList.contains('dup'), n = parseInt(($('[data-o=ct]', el).textContent.match(/\d+/) || [1])[0], 10);
        v.classList.toggle('dup', dup); lab.textContent = dup ? 'Already scanned' : `Valid, ${n} ${n === 1 ? 'guest' : 'guests'}`; fx(v);
      }).observe(res, { attributes: true, attributeFilter: ['class'] });
    },
    sccal(el) {  // the chip points at the cheapest day in the picked day's week
      const cells = $$('.pap-g > *', el).filter(c => !c.classList.contains('dw')), btn = $('[data-cheap]', el);
      const pick = c => {
        const i = cells.indexOf(c), wk = cells.slice(i - i % 7, i - i % 7 + 7).filter(x => x.matches('button.cd'));
        const lo = wk.reduce((m, x) => (+x.dataset.p < +m.dataset.p ? x : m), c), save = +c.dataset.p - +lo.dataset.p;
        btn.hidden = !save; if (!save) return;
        const d = new Date(`${lo.dataset.day} 2026`), wd = d.toLocaleDateString('en-US', { weekday: 'short' });
        btn.textContent = `${wd}, ${lo.dataset.day} is $${lo.dataset.p}, $${save} less`; btn._to = lo;
      };
      cells.filter(c => c.matches('button.cd')).forEach(c => c.addEventListener('click', () => pick(c)));
      btn.addEventListener('click', () => btn._to && (btn._to.click(), btn._to.focus()));
      const on = $('button.cd[aria-pressed=true]', el); if (on) pick(on);
    },
    scins(el, d) {  // the tooltip moves to the day you point at
      const cols = $$('[data-o=b1] .bcol', el), sel = $('[data-o=sel]', el), ov = $('.ov-tip', el), st = el;
      const show = i => {
        const m = d.m[sel.value], v = m.ch[i], f = x => (m.unit ? '$' : '') + x.toLocaleString('en-US');
        cols.forEach((c, k) => c.classList.toggle('on', k === i));
        $('[data-td]', ov).textContent = `${d.days[i]} · ${f(v[0] + v[1])}`; $('[data-t0]', ov).textContent = f(v[0]); $('[data-t1]', ov).textContent = f(v[1]);
        ov.dataset.near = `[data-o=b1] .bcol[data-i='${i}']`; place(st);
      };
      let cur = 5;
      cols.forEach((c, i) => {
        ['mouseenter', 'focus'].forEach(e => c.addEventListener(e, () => { cur = i; show(i); }));
        c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } });
      });
      sel.addEventListener('change', () => show(cur));
    },
    scinv(el) {  // each docket line ticks when its count matches the order
      $$('.ckl li', el).forEach(li => {
        const i = $('input', li), of = $('[data-of]', li);
        const upd = () => { const done = +i.value === +i.max; li.classList.toggle('done', done); of.textContent = done ? `${i.max} of ${i.max} received` : `of ${i.max} received`; };
        i.addEventListener('input', upd); upd();
      });
    },
    scmem(el) {  // the card fills in from the form and is issued on save
      const ins = $$('.mf input', el), card = $('.ov-card', el), nm = $('[data-cn]', el), cs = $('[data-cs]', el);
      const sync = () => { const n = `${ins[0].value.trim()} ${ins[1].value.trim()}`.trim(); nm.textContent = n || 'New member'; };
      ins.slice(0, 2).forEach(i => i.addEventListener('input', sync));
      $('[data-o=find]', el).addEventListener('click', sync);  // runs after main.js's handler on the same button
      $('[data-o=save]', el).addEventListener('click', () => {
        const ok = !$$('.mf.err', el).length && ins.every(i => i.value.trim());
        sync(); card.classList.toggle('sent', ok); cs.textContent = ok ? `Card sent to ${ins[2].value.trim()}` : 'Fills in as you type'; if (ok) fx(card);
      });
    },
    scflow(el) {  // the connector follows the picked step
      $('.flw', el).addEventListener('click', () => setTimeout(() => place(el)));
    }
  };

  /* ---- the nine new screens ---- */
  const N = {
    sccap(el) {
      const ov = $('.ov-prog', el);
      const upd = tr => {
        const c = +tr.dataset.c, s = +tr.dataset.s, h = +tr.dataset.h, left = Math.max(0, c - s - h);
        $('output', tr).textContent = c; $('[data-left]', tr).textContent = left;
        $('[data-st]', tr).innerHTML = left <= 0 ? '<span class="pst pst-out">Sold out</span>' : left <= 20 ? '<span class="pst pst-partially">Nearly full</span>' : '<span class="pst pst-complete">Open</span>';
        $$('tbody tr', el).forEach(r => r.classList.toggle('on', r === tr));
        $('[data-pt]', ov).textContent = $('th', tr).textContent; $('[data-pn]', ov).textContent = s + h; $('[data-pc]', ov).textContent = c;
        const [si, hi] = $$('.pb i', ov); si.style.width = s / c * 100 + '%'; hi.style.width = h / c * 100 + '%';
        $('[data-pl]', ov).textContent = left ? `${left} left` : 'Sold out'; ov.classList.toggle('full', !left);
      };
      $$('tbody tr', el).forEach(tr => {
        const step = k => {
          const s = +tr.dataset.s + +tr.dataset.h, c = +tr.dataset.c + k;
          if (c < s) return toast(el, `${s} already booked or held at ${$('th', tr).textContent}. Capacity can’t go below that.`);
          if (c > 400) return toast(el, 'The site limit is 400 a slot.');
          tr.dataset.c = c; upd(tr); fx($('output', tr));
          if (c === s) toast(el, `${$('th', tr).textContent} is sold out. It stops selling on every channel.`);
        };
        $('.m', tr).addEventListener('click', () => step(-10)); $('.p', tr).addEventListener('click', () => step(10));
      });
    },
    scweb(el) {
      const pv = $('.wpv', el), sw = $$('.sw', el), sb = $$('.rr-seg button', el), us = $('[data-us]', el), dis = $('[data-dis]', el), pub = $('[data-pub]', el), hint = $('[data-hint]', el);
      const R = ['8px', '2px', '999px'], saved = { c: sw[0], s: sb[0] };
      let cur = { ...saved };
      const dirty = () => {
        const n = (cur.c !== saved.c) + (cur.s !== saved.s);
        us.textContent = n ? `${n} unpublished ${n === 1 ? 'change' : 'changes'}` : 'Theme saved. Nothing to publish.';
        dis.disabled = pub.disabled = !n; hint.hidden = !!n;
      };
      const apply = () => { pv.style.setProperty('--brand', cur.c.dataset.c); pv.style.setProperty('--rad', R[+cur.s.dataset.i]); press(sw, cur.c); press(sb, cur.s); dirty(); };
      sw.forEach(b => b.addEventListener('click', () => { cur.c = b; apply(); }));
      sb.forEach(b => b.addEventListener('click', () => { cur.s = b; apply(); }));
      dis.addEventListener('click', () => { cur = { ...saved }; apply(); toast(el, 'Changes discarded.'); });
      pub.addEventListener('click', () => { Object.assign(saved, cur); dirty(); toast(el, `Published. Your checkout now uses ${cur.c.getAttribute('aria-label').replace('Brand colour: ', '')}.`); });
    },
    scchan(el, d) {
      const rows = $$('tbody tr', el), all = $('[data-all]', el), segs = $$('[data-bar] i', el), sy = $('[data-sy]', el), sy2 = $('[data-sy2]', el), box = $('.ov-sync', el);
      rows.forEach((tr, i) => $('.sell', tr).addEventListener('click', () => {
        let left = +all.textContent; if (!left) return;
        left--; const sold = $('[data-sold]', tr); sold.textContent = +sold.textContent + 1;
        all.textContent = left; segs[i].style.flexGrow = sold.textContent; segs[segs.length - 1].style.flexGrow = left;
        rows.forEach((r, k) => setTimeout(() => {  // each channel syncs, one after the next
          const c = $('[data-left]', r); c.textContent = left; c.classList.add('sync'); setTimeout(() => c.classList.remove('sync'), 700);
        }, reduce ? 0 : k * 90));
        const name = $('th', tr).textContent.slice(1);
        sy.textContent = `${name} sold 1 seat`; sy2.textContent = left ? `All ${rows.length} channels now show ${left} left` : 'Sold out on every channel at once'; fx(box);
        if (!left) { $$('.sell', el).forEach(b => b.disabled = true); toast(el, 'Sold out everywhere. Nothing oversold.'); }
      }));
    },
    scdem(el, d) {
      const cs = $$('.dm-c', el), r = $('[data-r]', el), line = $('[data-l]', el), ann = $('[data-ann]', el), tg = $('[data-dt]', el), pts0 = line.getAttribute('points');
      let on = true, cur = 5;
      const flat = pts0.split(' ').map(p => p.split(',')[0] + ',' + line.ownerSVGElement.viewBox.baseVal.height * (1 - (32 - 24) / 20)).join(' ');
      const show = i => {
        cur = i; cs.forEach((c, k) => c.classList.toggle('on', k === i));
        const [w, dd, dm, p, sold] = d[i], price = on ? p : 32;
        r.innerHTML = `<b>${w}, Jul ${dd}</b> <span>${usd(price)} adult</span> <span>${dm}% forecast demand</span> <span>${sold}% sold</span>`;
        cs[i].setAttribute('aria-label', `${w} Jul ${dd}: $${price}, ${dm}% forecast demand, ${sold}% sold`);
      };
      cs.forEach((c, i) => ['mouseenter', 'focus', 'click'].forEach(e => c.addEventListener(e, () => show(i))));
      tg.addEventListener('click', () => {
        on = !on; tg.setAttribute('aria-checked', on); line.setAttribute('points', on ? pts0 : flat); ann.hidden = !on;
        $('[data-dl]', el).textContent = on ? 'Demand pricing on' : 'Demand pricing off';
        $('[data-ds]', el).textContent = on ? 'Prices move between $28 and $40' : 'Every day sells at the $32 base price';
        show(cur);
      });
    },
    scgrp(el, d) {
      const inp = $('.grp-s input', el), go = $('[data-go]', el), hint = $('[data-gh]', el), st = $('[data-gs]', el);
      inp.addEventListener('input', () => {
        const ok = inp.value.trim().length >= 2; go.disabled = !ok;
        hint.textContent = ok ? `Signing as ${inp.value.trim()}. The deposit button is on.` : 'Type a name to sign. The deposit button turns on.'; hint.classList.toggle('ok', ok);
      });
      go.addEventListener('click', () => {
        st.textContent = `Signed by ${inp.value.trim()} · deposit paid`; st.classList.add('ok'); fx(st);
        toast(el, `Signed. Deposit of ${usd(d.dep)} paid. The invoice for the balance is sent.`);
      });
    },
    scord(el) {
      const chips = $$('.ord-f button', el), rows = $$('tbody tr', el);
      chips.forEach(b => b.addEventListener('click', () => {
        press(chips, b); const ch = b.dataset.ch; let n = 0, t = 0;
        rows.forEach(r => { const hit = !ch || r.dataset.ch === ch; r.hidden = !hit; if (hit) { n++; t += +r.dataset.t; } });
        $('[data-n]', el).textContent = n; $('[data-sum]', el).textContent = usd(t);
        $('[data-fl]', el).textContent = ch ? `${ch} only` : 'All channels'; $('[data-fn]', el).textContent = n; $('[data-ft]', el).textContent = usd(t); fx($('.ov-filter', el));
      }));
    },
    sckds(el, d) {
      const g = $('[data-g]', el), open = $('[data-open]', el), q = d.q.slice(), ov = $('.ov-steps', el);
      const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      const tint = t => { const a = +t.dataset.age; t.classList.toggle('warn', a >= 300 && a < 480); t.classList.toggle('late', a >= 480); };
      let vis = false;
      new IntersectionObserver(es => es.forEach(e => vis = e.isIntersecting)).observe(el);
      setInterval(() => { if (!vis) return; $$('.kt', g).forEach(t => { t.dataset.age = +t.dataset.age + 1; $('[data-t]', t).textContent = fmt(+t.dataset.age); tint(t); }); }, 1000);
      g.addEventListener('click', e => {
        const b = e.target.closest('.bump'); if (!b) return;
        const t = b.closest('.kt'), n = t.dataset.n, guest = /A7-2291/.test(t.textContent) ? ' · Sam Rivera' : '';
        $('[data-sn]', ov).textContent = `Order #${n}${guest}`; $$('li', ov).forEach(li => { li.className = 'done'; }); fx(ov);
        const next = t.nextElementSibling || t.previousElementSibling;
        t.classList.add('out');
        setTimeout(() => {
          t.remove();
          if (q.length) { const [m, s, it] = q.shift(); g.insertAdjacentHTML('beforeend', `<article class="kt" data-n="${m}" data-age="0"><header><b>#${m}</b><time data-t>0:00</time></header><small>${s}</small><ul>${it.map(i => `<li>${i}</li>`).join('')}</ul><button class="bump" aria-label="Bump order ${m}">Bump</button></article>`); }
          open.textContent = $$('.kt', g).length;
          const f = next && next.isConnected ? $('.bump', next) : $('.bump', g); if (f && document.activeElement === document.body) f.focus();
        }, reduce ? 0 : 260);
        toast(el, `Order #${n} is up. The guest got a text.`);
      });
    },
    scphoto(el) {
      const ps = $$('.kp', el), n = $('[data-n]', el), p = $('[data-p]', el), go = $('[data-go]', el), pb = $('[data-pb]', el), pb2 = $('[data-pb2]', el);
      const price = k => (k === 6 ? 60 : k >= 3 ? 45 + (k - 3) * 18 : k * 18);
      const calc = () => {
        const k = ps.filter(x => x.getAttribute('aria-pressed') === 'true').length, v = price(k);
        n.textContent = k; p.textContent = usd(v); go.disabled = !k; go.textContent = k ? `Add to ticket A7-2291 · ${usd(v)}` : 'Pick a photo first';
        pb.textContent = !k ? 'Pick 3 for $45' : k < 3 ? `Pick ${3 - k} more: 3 for $45` : k === 6 ? 'All 6 for $60' : `${k}-photo package`;
        pb2.textContent = k >= 3 ? `You save ${usd(k * 18 - v)}` : 'Prints and a download link'; fx($('.ov-badge', el));
        return v;
      };
      ps.forEach(x => x.addEventListener('click', () => { x.setAttribute('aria-pressed', x.getAttribute('aria-pressed') !== 'true'); calc(); }));
      go.addEventListener('click', () => toast(el, `Added to ticket A7-2291 · ${usd(calc())}`));
      calc();
    },
    scups(el, d) {
      const rs = $$('.up-r', el), kl = $('[data-kl]', el), kv = $('[data-kv]', el), sk = $$('.sk i', el);
      rs.forEach((r, i) => r.addEventListener('click', () => {
        const on = r.getAttribute('aria-checked') !== 'true'; r.setAttribute('aria-checked', on);
        $(`[data-o-i="${i}"]`, el).hidden = !on;
        const [n, , take] = d[i];
        kl.textContent = `${n} offer, last 30 days`; kv.textContent = on ? `${take} of 100 carts add it` : 'Offer off: no carts see it';
        sk.forEach((b, k) => b.style.height = (on ? Math.min(95, take * 2 + (k * 7) % 23) : 6) + '%');
        toast(el, on ? `${n} now shows in every cart with ${$('b', r).textContent.toLowerCase()}.` : `${n} offer is off.`);
      }));
    }
  };

  $$('.rr[data-rr]').forEach(el => {
    const k = el.dataset.rr, f = S[k] || N[k];
    if (f) f(el, el.dataset.d ? JSON.parse(el.dataset.d) : null);
  });
})();
