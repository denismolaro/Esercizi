/* Albero del percorso: a sinistra su schermo largo, a scomparsa (pulsante «Percorso») su schermo stretto. */
(function(){
  if (typeof PERCORSI === "undefined" || typeof CARDS === "undefined") return;
  const here = decodeURIComponent(location.pathname.split("/").pop());
  let subj = null, list = null, cur = -1;
  for (const s in PERCORSI){ const k = PERCORSI[s].findIndex(e => e.href === here); if (k >= 0){ subj = s; list = PERCORSI[s]; cur = k; break; } }
  if (!list) return;
  const side = document.createElement("aside"); side.id = "albero"; side.setAttribute("aria-label", "Percorso di " + subj);
  const btn = document.createElement("button"); btn.id = "alberoBtn"; btn.type = "button"; btn.textContent = "☰ Percorso";
  btn.onclick = () => document.body.classList.toggle("albero-open");
  const velo = document.createElement("div"); velo.id = "alberoVelo"; velo.onclick = () => document.body.classList.remove("albero-open");
  document.body.appendChild(side); document.body.appendChild(velo); document.body.appendChild(btn);
  document.body.classList.add("con-albero");
  const get = k => { try { const v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? -1 : v; } catch(e){ return -1; } };
  const set = (k, v) => { try { localStorage.setItem(k, String(v)); } catch(e){} };
  const seen = e => { const m = get(e.key + "-max"); return m >= 0 ? m : get(e.key); };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  let primo = true;
  function draw(){
    const me = list[cur];
    if (typeof idx === "number" && idx > seen(me)) set(me.key + "-max", idx);
    let h = '<div class="al-top"><a class="al-home" href="../index.html">← Palestra</a><div class="al-subj">' + esc(subj) + '</div></div><ol class="al-schede">';
    list.forEach((e, k) => {
      const vist = Math.min(e.n, Math.max(0, seen(e) + 1));
      const pct = Math.round(100 * vist / Math.max(1, e.n));
      h += '<li class="al-s' + (k === cur ? ' cur' : '') + (vist >= e.n ? ' fatta' : '') + '">';
      if (k === cur){
        h += '<div class="al-st">' + esc(e.t) + '</div><ol class="al-parti">';
        PARTI.forEach((pn, pi) => {
          const cc = []; CARDS.forEach((c, i) => { if (c.parte === pi) cc.push(i); });
          if (!cc.length) return;
          const open = cc.indexOf(idx) >= 0;
          h += '<li class="al-p' + (open ? ' open' : '') + '"><button type="button" class="al-pb" onclick="alVai(' + cc[0] + ')">' + esc(pn) + '</button><ol class="al-carte">';
          cc.forEach(i => { h += '<li><button type="button" class="al-c' + (i === idx ? ' on' : '') + (i <= seen(me) ? ' vista' : '') + '" onclick="alVai(' + i + ')">' + esc(CARDS[i].t) + '</button></li>'; });
          h += '</ol></li>';
        });
        h += '</ol>';
      } else {
        h += '<a class="al-st" href="' + encodeURI(e.href) + '">' + esc(e.t) + '</a>';
      }
      h += '<div class="al-bar" title="' + vist + ' carte su ' + e.n + '"><span style="width:' + pct + '%"></span></div></li>';
    });
    side.innerHTML = h + '</ol>';
    const on = side.querySelector(".al-c.on");
    if (on){ const r = on.getBoundingClientRect(), s = side.getBoundingClientRect();
      if (primo || r.top < s.top || r.bottom > s.bottom) side.scrollTop += r.top - s.top - s.height / 3; }
    primo = false;
  }
  window.alVai = function(i){ document.body.classList.remove("albero-open"); show(i); };
  const r0 = window.render;
  window.render = function(){ r0.apply(this, arguments); draw(); };
  draw();
})();
