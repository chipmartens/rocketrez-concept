/* Home only (home lane). Loaded on every page: each block returns early when its section isn't there. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Industry accordion. main.js opens a panel on click, hover and link focus; this adds arrow keys between panels (desktop)
     and the swipe row's position count and arrows (tablet and phone). */
  document.querySelectorAll('.acc.ind').forEach(a => {
    const ps = [...a.querySelectorAll('.acc-p')], bs = ps.map(p => p.querySelector('.acc-b'));
    const ctl = a.nextElementSibling, pos = ctl && ctl.querySelector('.ind-pos');
    /* An opening panel grows under a still pointer, and the browser then fires mouseenter on whichever panel slid beneath it,
       so main.js would flip to that one. Ignore an enter at the exact spot of the last open: only a real move opens a panel. */
    let ox = -1, oy = -1;
    a.addEventListener('mouseenter', e => {
      if (!e.target.classList || !e.target.classList.contains('acc-p')) return;
      if (e.clientX === ox && e.clientY === oy) { e.stopImmediatePropagation(); return; }
      ox = e.clientX; oy = e.clientY;
    }, true);
    a.addEventListener('click', e => { ox = e.clientX; oy = e.clientY; }, true);
    a.addEventListener('keydown', e => {
      let i = bs.indexOf(e.target);
      if (i < 0) return;
      const k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: bs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      i = (k + bs.length) % bs.length;
      bs[i].focus();
      bs[i].click();
    });
    if (!pos || ps.length < 2) return;
    const prev = ctl.querySelector('.prev'), next = ctl.querySelector('.next');
    const step = () => ps[1].offsetLeft - ps[0].offsetLeft;
    const upd = () => {
      const end = a.scrollLeft >= a.scrollWidth - a.clientWidth - 2;
      const i = end ? ps.length - 1 : Math.min(ps.length - 1, Math.max(0, Math.round(a.scrollLeft / step())));
      pos.textContent = `${i + 1} of ${ps.length}`;
      prev.disabled = a.scrollLeft <= 2;
      next.disabled = end;
    };
    let raf = 0;
    a.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
    prev.addEventListener('click', () => a.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => a.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    upd();
  });

  /* The story (Chip 2026-11-06): five systems morph into Sam's one guest record, and that record stays on the right (sticky, desktop)
     while the dark section walks through each part of RocketRez.
     Morph: each system's line for Sam lights up, lifts off as a chip and flies a curved path (FLIP: first = the line, last = its row;
     transform and opacity only, Web Animations) onto the record, while the system it left tilts back, greys and fades. Plays once in
     view; "Put it on one system" and Replay run it again. Reduced motion: no travel, the lines light, then the record fades in finished.
     Parts: as a block reaches the middle of the screen the record lights the rows that part sold (IntersectionObserver on a band around
     the middle, no scroll handlers); a tag on the record jumps to its part. */
  document.querySelectorAll('.story').forEach(story => {
    const merge = story.querySelector('.merge'), sys = story.querySelector('.sys'), rec = story.querySelector('.rec');
    const fig = rec && rec.querySelector('.rr'), go = story.querySelector('.ring-go'), re = story.querySelector('.mo-re');
    const tot = rec && rec.querySelector('[data-o=tot]'), foot = rec && rec.querySelector('.mo-tot'), label = foot && foot.querySelector('span');
    const rows = rec ? [...rec.querySelectorAll('.mo-l[data-a]')] : [], keep = rec && rec.querySelector('.mo-keep');
    if (!merge || !sys || !fig || !go || !re || !tot || !label || !rows.length || !rows.every(r => sys.querySelector(`[data-k="${r.dataset.k}"]`))) return;
    const phone = matchMedia('(max-width: 900px)'), EASE = 'cubic-bezier(.16,1,.3,1)';
    const money = v => '$' + v.toFixed(2);
    const src = r => sys.querySelector(`[data-k="${r.dataset.k}"]`);
    const sum = rows.reduce((s, r) => s + +r.dataset.a, 0), idle = label.textContent;
    let timers = [], raf = 0, shown = 0, landed = 0, io = null;
    const at = (ms, f) => timers.push(setTimeout(f, ms));
    const count = to => {  // the total runs up to each new sum, exponential ease-out
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / 400);
        shown = k < 1 ? from + (to - from) * (1 - Math.pow(2, -10 * k)) : to;
        tot.textContent = money(shown);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const reset = () => {
      timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf);
      story.getAnimations({ subtree: true }).forEach(a => a.cancel());
      rec.querySelectorAll('.mo-chip').forEach(c => c.remove());
      sys.querySelectorAll('[data-k]').forEach(e => e.classList.remove('mo-on', 'mo-gone'));
      rows.concat(keep || []).forEach(r => r.classList.remove('in'));
      shown = landed = 0; tot.textContent = money(0);
      story.dataset.m = 'ready';
    };
    // done: on a phone the emptied systems collapse; the record glides up into their place (FLIP) instead of jumping
    const finish = () => {
      const de = document.documentElement, oa = de.style.overflowAnchor, y0 = rec.getBoundingClientRect().top;
      if (!reduce) de.style.overflowAnchor = 'none';
      story.dataset.m = 'done'; story.dataset.seen = '';
      const dy = phone.matches ? y0 - rec.getBoundingClientRect().top : 0;
      if (dy && !reduce) rec.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: 500, easing: EASE });
      requestAnimationFrame(() => requestAnimationFrame(() => { de.style.overflowAnchor = oa; }));
    };
    // the finished record at once: for a reader who reaches the parts before the morph ever played
    const complete = () => {
      if (io) io.disconnect();
      reset();
      sys.querySelectorAll('[data-k]').forEach(e => e.classList.add('mo-gone'));
      rows.concat(keep || []).forEach(r => r.classList.add('in'));
      shown = landed = sum; tot.textContent = money(sum);
      story.dataset.m = 'done'; story.dataset.seen = '';
    };
    // one line's flight, measured at take-off in the record's own coordinates, so a record that sticks mid-flight still catches it
    const fly = (r, frag, left) => {
      const line = src(r), m = rec.getBoundingClientRect(), a = line.getBoundingClientRect(), b = r.getBoundingClientRect();
      const tag = document.createElement('em');
      tag.className = 'smt'; tag.dataset.j = r.dataset.j; tag.textContent = r.querySelector('.smt').textContent;
      const chip = document.createElement('span');
      chip.className = 'mo-chip'; chip.setAttribute('aria-hidden', 'true');
      chip.append(tag, r.children[1].cloneNode(true), r.querySelector('b').cloneNode(true));
      rec.append(chip);
      const w = chip.offsetWidth, h = chip.offsetHeight, L = b.left - m.left - parseFloat(getComputedStyle(chip).paddingLeft), T = b.top - m.top + (b.height - h) / 2;
      chip.style.left = L + 'px'; chip.style.top = T + 'px';
      const fx = a.left - m.left + a.width / 2 - w / 2 - L, fy = a.top - m.top + a.height / 2 - h / 2 - T, d = Math.hypot(fx, fy) || 1;
      // bow the path upward on desktop; on a phone the line drops straight down
      let nx = fy / d, ny = -fx / d;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const bow = phone.matches ? 0 : d * .22, cx = fx / 2 + nx * bow, cy = fy / 2 + ny * bow;
      const tm = new DOMMatrix(getComputedStyle(frag).transform), ang = Math.atan2(tm.b, tm.a) * 180 / Math.PI;
      const kf = [];
      for (let j = 0, N = 16; j <= N; j++) {
        const t = j / N, u = 1 - t, x = u * u * fx + 2 * u * t * cx, y = u * u * fy + 2 * u * t * cy;
        kf.push({ transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(ang * u).toFixed(2)}deg) scale(${(.94 + .06 * t).toFixed(3)})` });
      }
      line.classList.replace('mo-on', 'mo-gone');
      const fl = chip.animate(kf, { duration: Math.round(Math.min(900, Math.max(700, 560 + d * .5))), easing: EASE, fill: 'both' });
      fl.onfinish = () => {
        r.classList.add('in');
        count(landed += +r.dataset.a);
        chip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).onfinish = () => chip.remove();
      };
      if (!left) frag.animate([  // the last line has left this system: it tilts back, greys out and goes
        { opacity: 1, filter: 'saturate(1)', rotate: 'x 0deg', translate: '0 0' },
        { opacity: .5, filter: 'saturate(0)', rotate: 'x 28deg', translate: '0 -6px', offset: .45 },
        { opacity: 0, filter: 'saturate(0)', rotate: 'x 44deg', translate: '0 -14px' }],
        { duration: 700, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    };
    const play = () => {
      if (io) io.disconnect();
      reset();
      story.dataset.m = 'play';
      rows.forEach(r => src(r).classList.add('mo-on'));
      if (reduce) {  // no travel: the lines light, then the systems fade out and the finished record fades in
        at(900, () => {
          sys.querySelectorAll('[data-k]').forEach(e => e.classList.replace('mo-on', 'mo-gone'));
          sys.querySelectorAll('.sy').forEach(f => f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
          if (!phone.matches) fig.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          rows.concat(keep || []).forEach(r => r.classList.add('in'));
          shown = landed = sum; tot.textContent = money(sum);
          at(300, finish);
        });
        return;
      }
      // desktop: the chips converge on empty space and the card forms around them, over the systems as they go
      if (!phone.matches) fig.animate([{ opacity: 0, scale: .97 }, { opacity: 1, scale: 1 }], { duration: 450, delay: 1400, easing: EASE, fill: 'backwards' });
      const left = new Map();
      rows.forEach(r => { const f = src(r).closest('.sy'); left.set(f, (left.get(f) || 0) + 1); });
      let end = 0;
      rows.forEach((r, i) => {
        const f = src(r).closest('.sy'), t = 900 + i * 120;
        at(t, () => { left.set(f, left.get(f) - 1); fly(r, f, left.get(f)); });
        end = t + 900;
      });
      at(end + 120, () => { if (keep) keep.classList.add('in'); });
      at(end + 520, finish);
    };
    reset();
    go.removeAttribute('aria-pressed');
    // main.js gave this button a show/hide toggle; the morph replaces it, so the click stops here before reaching it
    story.addEventListener('click', e => { if (e.target.closest('.ring-go')) { e.stopPropagation(); play(); } }, true);
    re.addEventListener('click', () => {
      // from further down the page, go back up to the five systems so the lines have somewhere to fly from
      if (phone.matches || merge.getBoundingClientRect().top < 0) merge.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      play();
    });
    if (!('IntersectionObserver' in window)) { complete(); return; }
    io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) play(); }, { threshold: .35 });
    io.observe(phone.matches ? rec : sys);

    // ---- the parts: the block in the middle of the screen lights its rows on the record
    const blocks = [...story.querySelectorAll('.sm-j[data-j]')];
    if (!blocks.length) return;
    const light = k => {
      rec.dataset.on = k;
      rows.forEach(r => r.classList.toggle('lit', k === 'know' || r.dataset.j === k));
      if (keep) keep.classList.toggle('lit', k === 'keep');
      foot.classList.toggle('lit', k === 'know');
      blocks.forEach(b => b.classList.toggle('on', b.dataset.j === k));
      const b = blocks.find(x => x.dataset.j === k);
      label.textContent = b ? b.dataset.foot : idle;
    };
    const mid = new Set();
    const bio = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) mid.add(e.target);
        else mid.delete(e.target);
      });
      const on = blocks.filter(b => mid.has(b)).pop();
      if (!on) {  // between parts the last one stays lit; back up above the first part, the record shows plain
        if (blocks[0].getBoundingClientRect().top > innerHeight / 2) light('');
        return;
      }
      if (story.dataset.m === 'ready') complete();
      light(on.dataset.j);
    }, { rootMargin: '-45% 0px -45% 0px' });
    blocks.forEach(b => bio.observe(b));
    light('');
    // Pick a part: a tag on the record jumps to its block and moves focus to its heading
    rec.addEventListener('click', e => {
      const t = e.target.closest('button.smt');
      const b = t && story.querySelector(`#sm-${t.dataset.j}`);
      if (!b) return;
      b.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      b.querySelector('.sm-n').focus({ preventScroll: true });
      light(t.dataset.j);
    });
  });
})();
