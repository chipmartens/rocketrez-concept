/* screens lane B (ui_more.py): behaviour for the 11 extra product screens. Sample data. Every control is a native button or select. */
(() => {
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const outs = el => Object.fromEntries($$('[data-o]', el).map(n => [n.dataset.o, n]));
  const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const toast = (el, msg) => { const t = $('.rr-toast', el); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3200); };
  const press = (all, b) => all.forEach(x => x.setAttribute('aria-pressed', x === b));
  const flip = b => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', v); return v; };
  const fresh = n => { if (!reduce) n.classList.add('new'); return n; };
  const ICK = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICA = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2l6.5 11.5h-13z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.5v3M8 11.6v.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let clock = 15;  // audit and thread times tick forward from 9:15
  const now = () => `09:${String(clock++).padStart(2, '0')}`;

  const S = {
    sctiers(el, o, d) {
      const tiers = d.tiers.map(t => ({ n: t[0], p: t[1], k: new Set(t[2]), g: t[3] })), names = Object.fromEntries(d.perks);
      let cur = 1;
      const tb = $$('.tr-t', el), sw = $$('.s2-sw', el);
      const card = (added) => {
        const t = tiers[cur];
        o.cn.textContent = t.n; o.cp.textContent = `${usd(t.p)} a year`; o.cg.textContent = `${t.g} guest pass${t.g === 1 ? '' : 'es'}`;
        o.cl.innerHTML = d.perks.filter(([k]) => t.k.has(k)).map(([k, n]) => `<li${k === added && !reduce ? ' class="new"' : ''}>${ICK}${esc(n)}</li>`).join('') || '<li>No perks yet</li>';
        o.gm.disabled = t.g <= 0; o.gpp.disabled = t.g >= 10;
      };
      const load = () => {
        const t = tiers[cur];
        o.nm.textContent = t.n; o.pr.textContent = `${usd(t.p)} a year`; o.gp.textContent = t.g;
        sw.forEach(b => b.setAttribute('aria-checked', t.k.has(b.dataset.k)));
        card();
      };
      tb.forEach(b => b.addEventListener('click', () => { press(tb, b); cur = +b.dataset.t; load(); }));
      sw.forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k, v = flip(b);
        v ? tiers[cur].k.add(k) : tiers[cur].k.delete(k); card(v ? k : null);
      }));
      const gp = n => { const t = tiers[cur]; t.g = Math.max(0, Math.min(10, t.g + n)); o.gp.textContent = t.g; card(); };
      o.gm.addEventListener('click', () => gp(-1)); o.gpp.addEventListener('click', () => gp(1));
      o.save.addEventListener('click', () => toast(el, `${tiers[cur].n} saved. New members get these perks from today.`));
      card();
    },

    scgive(el, o, d) {
      const b = $$('.rr-seg button', el), keys = ['Monthly', 'Annual'], M = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      b.forEach(x => x.addEventListener('click', () => {
        press(b, x); const k = keys[+x.dataset.i], v = d[k], unit = k === 'Monthly' ? 'a month' : 'a year', top = Math.max(...v.tr);
        o.kl.textContent = v.lab; o.kn.textContent = v.n; o.tl.textContent = v.tl; o.kt.textContent = usd(v.tot);
        o.bars.innerHTML = v.tr.map((n, i) => `<span><i style="transform:scaleY(${(n / top).toFixed(3)})"></i><small>${M[i]}</small></span>`).join('');
        o.rows.innerHTML = v.rows.map(([n, a, nx]) => `<tr><th scope="row">${esc(n)}</th><td class="num">${usd(a)} <small>${unit}</small></td><td>${nx}</td><td><span class="s2-ok">${ICK}Receipt sent</span></td></tr>`).join('');
        const r = v.rows[0];
        o.mt.textContent = `To ${r[3]}`; o.ms.textContent = `${usd(r[1])} ${k === 'Monthly' ? 'monthly gift, Nov 1' : 'annual gift, renewed Nov 2'}`;
      }));
    },

    screnew(el, o, d) {
      const first = n => n.split(' ')[0];
      const count = () => { o.cdue.textContent = o.ldue.children.length; o.csent.textContent = o.lsent.children.length; o.empty.hidden = o.ldue.children.length > 0; };
      $$('[data-send]', el).forEach(b => b.addEventListener('click', () => {
        const [n, t, dt] = d[+b.dataset.send], row = b.closest('li'), next = row.nextElementSibling || row.previousElementSibling;
        row.remove();
        const li = document.createElement('li'); li.className = 'rn-r';
        li.innerHTML = `<span><b>${esc(n)}</b><small>${esc(t)} · text sent just now</small></span>`;
        o.lsent.prepend(fresh(li)); count();
        o.to.textContent = first(n); o.tx.textContent = `Hi ${first(n)}, your ${t} membership ends ${dt}. Renew in one tap at yourattraction.com/renew`;
        toast(el, `Reminder texted to ${n}.`);
        const f = next && $('button', next);
        if (f) f.focus(); else { o.empty.tabIndex = -1; o.empty.focus(); }
      }));
    },

    scapi(el, o, d) {
      $$('.s2-sw', el).forEach(b => b.addEventListener('click', () => {
        const i = +b.dataset.z, [ev, w, t, , , n] = d.zaps[i], v = flip(b), st = $(`[data-st="${i}"]`, el);
        st.textContent = v ? `On · ran ${n} times today` : 'Off'; st.classList.toggle('act', v);
        if (v) { o.ev.textContent = ev; o.js.textContent = d.pay[ev]; toast(el, `Zap on: ${w} sends to ${t}. Test data sent.`); }
        else toast(el, `Zap off: ${w} stops sending to ${t} until you turn it back on.`);
      }));
    },

    scpayout(el, o, d) {
      const b = $$('.py-d', el);
      const calc = ([dn, dt, g, n, r]) => { const a = Math.round(g * d.rate * 100) / 100, f = Math.round(n * d.per * 100) / 100; return { dn, dt, g, n, r, a, f, net: g - a - f - r }; };
      b.forEach(x => x.addEventListener('click', () => {
        press(b, x); const c = calc(d.days[+x.dataset.i]);
        o.day.textContent = `${c.dn} ${c.dt}`; o.g.textContent = usd(c.g); o.a.textContent = '-' + usd(c.a); o.n.textContent = c.n;
        o.b.textContent = '-' + usd(c.f); o.r.textContent = '-' + usd(c.r); o.net.textContent = usd(c.net);
        o.eday.textContent = c.dn; o.eff.textContent = ((c.a + c.f) / c.g * 100).toFixed(2) + '%';
      }));
    },

    scroster(el, o, d) {
      const have = d.have.map(r => r.slice()), DAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const shortOf = dd => d.areas.map((a, i) => [a, d.need[i][dd] - have[i][dd]]).filter(x => x[1] > 0);
      const alert = () => {
        const sh = DAY.map((n, i) => [n, i, shortOf(i)]).filter(x => x[2].length);
        o.al.classList.toggle('ok', !sh.length); o.ai.innerHTML = sh.length ? ICA : ICK;
        if (!sh.length) { o.at.textContent = 'Every day is covered'; o.as.textContent = `Saturday: ${d.booked[5]} booked · ${have[0][5]} of ${d.need[0][5]} gate staff`; return; }
        const [n, i, s] = sh[0];
        o.at.textContent = `${n} is short at the ${s[0][0].toLowerCase()}`;
        o.as.textContent = `${d.booked[i]} booked · ${have[d.areas.indexOf(s[0][0])][i]} of ${d.need[d.areas.indexOf(s[0][0])][i]} ${s[0][0].toLowerCase()} staff`;
      };
      $$('.rs-c', el).forEach(b => b.addEventListener('click', () => {
        const a = +b.dataset.a, dd = +b.dataset.d, area = d.areas[a], need = d.need[a][dd];
        if (have[a][dd] >= need + 2) return toast(el, `${area} on ${DAY[dd]} already has ${have[a][dd]} staff for ${need} needed.`);
        have[a][dd]++; const h = have[a][dd];
        $('b', b).textContent = h; b.classList.toggle('short', h < need);
        b.setAttribute('aria-label', `${area}, ${d.wk[dd]}: ${h} of ${need} staff. Add a shift`);
        const cv = $(`[data-cv="${dd}"] .rs-cv`, el), short = shortOf(dd).length > 0;
        cv.classList.toggle('short', short); cv.innerHTML = (short ? ICA : ICK) + `<span class="sr">${short ? 'Short' : 'Covered'}</span>`;
        alert();
        toast(el, `Shift added: ${area}, ${DAY[dd]}, 9:00 am to 5:00 pm.${short ? '' : ` ${DAY[dd]} is covered.`}`);
      }));
      o.tpl.addEventListener('click', () => toast(el, 'Pick a cell in the grid to add a shift for that area and day.'));
    },

    scimport(el, o, d) {
      let left = d.length, ok = 2412;
      $$('[data-fix]', el).forEach(b => b.addEventListener('click', () => {
        const li = b.closest('li'); li.classList.add('dn');
        b.outerHTML = `<span class="s2-ok" tabindex="-1">${ICK}Fixed</span>`;
        left--; ok++; o.left.textContent = left; o.ok.textContent = ok.toLocaleString('en-US'); o.rvn.textContent = d.length - left;
        $('.s2-ok', li).focus();
        if (!left) {
          o.c3.classList.add('dn'); o.go.disabled = false; o.c4s.textContent = 'Ready when you are';
          o.bar.style.transform = 'scaleX(.75)'; toast(el, 'All 3 rows fixed. Ready to import 2,415 members.');
        } else { o.bar.style.transform = `scaleX(${(.5 + (d.length - left) / d.length * .25).toFixed(3)})`; }
      }));
      o.go.addEventListener('click', () => {
        o.c4.classList.add('dn'); o.c4s.textContent = '2,415 members, with tiers and expiry'; o.bar.style.transform = 'scaleX(1)';
        o.go.disabled = true; o.go.textContent = 'Imported'; toast(el, '2,415 members imported. Their cards are ready to send.');
      });
    },

    sclaunch(el, o, d) {
      const add = (who, txt) => {
        const [a, n] = d.ppl[who], li = document.createElement('li'); li.className = `lch-m p-${who}`;
        li.innerHTML = `<span class="av" aria-hidden="true">${a}</span><div><p class="lch-n"><b>${n}</b><time>${now()}</time></p><p class="lch-t">${esc(txt)}</p></div>`;
        o.th.append(fresh(li));
      };
      $$('[data-q]', el).forEach(b => b.addEventListener('click', () => {
        const [q, a] = d.q[+b.dataset.q]; b.disabled = true; add('dw', q);
        setTimeout(() => add('et', a), reduce ? 0 : 700);
        const nx = $$('[data-q]', el).find(x => !x.disabled); nx && nx.focus();
      }));
    },

    scperms(el, o, d) {
      $$('.s2-sw:not(:disabled)', el).forEach(b => b.addEventListener('click', () => {
        const v = flip(b), r = d.roles[+b.dataset.r], p = d.perms[+b.dataset.p];
        const li = document.createElement('li'); li.innerHTML = `<time>${now()}</time><span>Maya R. turned ${v ? 'on' : 'off'} ${p} for ${r}</span>`;
        o.log.prepend(fresh(li)); while (o.log.children.length > 5) o.log.lastElementChild.remove();
        toast(el, `${r} ${v ? 'can now use' : 'can no longer use'} ${p}. Logged.`);
      }));
    },

    scmanifest(el, o, d) {
      const P = d.p.map(x => ({ n: x[0], g: x[1], b: !!x[4] })); let nb = d.b;
      const go = o.go;
      go.addEventListener('click', () => {
        const i = P.findIndex(x => !x.b); if (i < 0) return;
        P[i].b = true; nb += P[i].g;
        const tr = $(`tr[data-i="${i}"]`, el); tr.classList.add('on');
        $(`[data-st="${i}"]`, el).innerHTML = `<span class="s2-ok">${ICK}Boarded</span>`;
        o.nb.textContent = nb; o.nw.textContent = 148 - nb; o.cn.textContent = nb; o.bar.style.transform = `scaleX(${(nb / 148).toFixed(3)})`;
        o.cl.textContent = `${P[i].n}, party of ${P[i].g} · ${148 - nb} still to board`;
        if (!P.some(x => !x.b)) { go.disabled = true; go.lastChild.textContent = 'Everyone’s aboard'; o.cl.textContent = 'All 148 aboard · ready to cast off'; toast(el, 'All 148 guests aboard. Ready to cast off.'); }
      });
    },

    sccabana(el, o) {
      $$('.cb-c.free', el).forEach(b => b.addEventListener('click', () => {
        const n = b.dataset.c, p = +b.dataset.p;
        b.classList.replace('free', 'mine'); b.disabled = true; $('small', b).textContent = 'Yours';
        b.setAttribute('aria-label', `Cabana ${n}, reserved for Priya Shah`);
        const left = $$('.cb-c.free', el).length;
        o.ol.textContent = 'Reserved for Sat Jul 11'; o.ob.textContent = `Cabana ${n} · ${usd(p)}`; o.os.textContent = 'Priya Shah’s order'; o.nf.textContent = left;
        toast(el, `Cabana ${n} reserved for Priya Shah. ${usd(p)} added to her order.`);
        const nx = $('.cb-c.free', el), m = $('.cb-map', el); m.tabIndex = -1; (nx || m).focus();
      }));
    },
  };

  $$('.scr2[data-rr]').forEach(el => { const f = S[el.dataset.rr]; f && f(el, outs(el), el.dataset.d ? JSON.parse(el.dataset.d) : null); });
})();
