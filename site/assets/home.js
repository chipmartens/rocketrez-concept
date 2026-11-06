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

  /* System map: hover, focus or tap a part to light the guest-record lines it sold. A click pins it. */
  document.querySelectorAll('.sysmap').forEach(sm => {
    const js = [...sm.querySelectorAll('.sm-j')], out = sm.querySelector('.sm-out'), rec = sm.querySelector('.sm-rec'), list = sm.querySelector('.sm-js');
    if (!js.length || !out || !rec || !list) return;
    let pin = '';
    const show = k => {
      sm.dataset.on = k;
      js.forEach(j => {
        j.classList.toggle('on', j.dataset.j === k);
        j.querySelector('.sm-b').setAttribute('aria-pressed', String(!!pin && j.dataset.j === pin));
      });
      rec.querySelectorAll('[data-j]').forEach(el => el.classList.toggle('lit', !!k && (k === 'know' || el.dataset.j === k)));
      const j = js.find(x => x.dataset.j === k);
      out.textContent = j ? j.dataset.say : out.dataset.idle;
    };
    js.forEach(j => {
      const k = j.dataset.j;
      j.addEventListener('mouseenter', () => show(k));
      j.addEventListener('focusin', () => show(k));
      j.querySelector('.sm-b').addEventListener('click', () => { pin = pin === k ? '' : k; show(pin); });
    });
    list.addEventListener('mouseleave', () => show(pin));
    list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) show(pin); });
    show('');
    // phone: the parts are a swipe row; the card in view lights its lines unless one is pinned
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && !pin && getComputedStyle(list).display === 'flex') show(e.target.dataset.j);
      }), { root: list, threshold: .75 });
      js.forEach(j => io.observe(j));
    }
  });
})();
