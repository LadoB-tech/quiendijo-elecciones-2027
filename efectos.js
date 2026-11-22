/* =========================================================
   efectos.js — animaciones, sonidos, música y cronómetro
   Test Político · ¿Quién dijo qué? (lo usan las dos versiones)
   ========================================================= */
(function () {
  "use strict";
  const quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const yo = document.currentScript ? document.currentScript.src : "";
  const BASE = yo.replace(/efectos\.js.*$/, "");
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const $ = id => document.getElementById(id);
  let mudo = ls.get("tp_mudo") === "1";
 
  // ---------- ESTILOS ----------
  const st = document.createElement("style");
  st.textContent = `
  #tp-timer{margin-left:auto;font-weight:800;font-size:.85rem;color:#f7b928;background:rgba(247,185,40,.12);border:1px solid rgba(247,185,40,.35);padding:.3rem .65rem;border-radius:999px;white-space:nowrap;font-variant-numeric:tabular-nums}
  #tp-timer + .topbar-step{margin-left:.4rem}
  body.tp-jugando .topbar-title span, body.tp-jugando .topbar-title br{display:none}
  body.tp-jugando .topbar-title{white-space:nowrap}
  @media (max-width:420px){body.tp-jugando .topbar-inner{gap:.45rem}body.tp-jugando .topbar-title{font-size:.88rem}#tp-mute{margin-left:.2rem!important}#tp-timer,.topbar-step{font-size:.78rem!important;padding:.28rem .5rem!important}#tp-mute{width:34px;height:34px}}
  #tp-mute{flex-shrink:0;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font-size:1.05rem;cursor:pointer;margin-left:.4rem;display:flex;align-items:center;justify-content:center;padding:0}
  .tp-time{margin-top:.5rem;font-weight:800;color:#f7b928;font-size:1rem}
  .tp-fx{position:fixed;pointer-events:none;z-index:9999}
  .tp-toast{position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:9999;pointer-events:none;background:#f7b928;color:#1a1300;font-family:Montserrat,sans-serif;font-weight:900;font-size:1.3rem;padding:.75rem 1.5rem;border-radius:999px;box-shadow:0 10px 30px rgba(247,185,40,.45);white-space:nowrap}
  .tp-ufo{position:absolute;left:50%;top:-10px;width:120px;height:56px;margin-left:-60px;z-index:5;pointer-events:none}
  .tp-ufo i{position:absolute;left:35px;top:0;width:50px;height:36px;border-radius:25px 25px 6px 6px;background:radial-gradient(circle at 40% 35%,#d9fffb,#7af5e8 45%,#2b8f88)}
  .tp-ufo b{position:absolute;left:0;top:23px;width:120px;height:28px;border-radius:50%;background:linear-gradient(#c7cbe8,#6b7096);box-shadow:0 4px 12px rgba(0,0,0,.5)}
  .tp-beam{position:absolute;left:50%;top:40px;width:220px;margin-left:-110px;height:240px;transform-origin:top center;background:linear-gradient(rgba(122,245,232,.6),rgba(122,245,232,.06));clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);z-index:1;pointer-events:none;opacity:0}
  #a-choices .choice.correct{animation:tp-pulse .7s ease}
  #a-choices .choice.wrong{animation:tp-shake .5s ease}
  #cast.tp-flota img{animation:tp-aparece .8s ease-out both, tp-flota 3.2s ease-in-out infinite}
  .profile-badge.tp-type{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;animation:tp-type .8s steps(17) both}
  #tp-card-modal img{animation:tp-flip .8s cubic-bezier(.3,.8,.3,1) both}
  @keyframes tp-pulse{0%{transform:scale(1)}30%{transform:scale(1.07)}55%{transform:scale(.98)}80%{transform:scale(1.03)}100%{transform:scale(1)}}
  @keyframes tp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-7px)}80%{transform:translateX(5px)}}
  @keyframes tp-aparece{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes tp-flota{0%,100%{translate:0 0}50%{translate:0 -8px}}
  @keyframes tp-type{0%{max-width:0;opacity:0}1%{opacity:1}100%{max-width:20em;opacity:1}}
  @keyframes tp-flip{0%{transform:perspective(1200px) rotateY(90deg) scale(.6);opacity:0}60%{transform:perspective(1200px) rotateY(-12deg) scale(1.03);opacity:1}100%{transform:perspective(1200px) rotateY(0) scale(1)}}
  @media (max-width:370px){body.tp-jugando .topbar-title{display:none}}
  @media (prefers-reduced-motion: reduce){#a-choices .choice.correct,#a-choices .choice.wrong,#cast.tp-flota img,#tp-card-modal img,.profile-badge.tp-type{animation:none!important}}
  `;
  document.head.appendChild(st);
 
  // ---------- SONIDOS (se generan por código, no pesan nada) ----------
  let ctx = null;
  function audio() {
    try {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  function tono(f, t0, dur, tipo, vol, fFin) {
    const c = audio(); if (!c) return null;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = tipo || "sine";
    o.frequency.setValueAtTime(f, t);
    if (fFin) o.frequency.exponentialRampToValueAtTime(fFin, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  const SFX = {
    click: () => tono(560, 0, 0.07, "sine", 0.07, 760),
    ok: () => { tono(784, 0, 0.12, "triangle", 0.2); tono(1047, 0.09, 0.12, "triangle", 0.2); tono(1568, 0.18, 0.3, "triangle", 0.16); },
    err: () => { tono(311, 0, 0.18, "sawtooth", 0.06, 262); tono(233, 0.18, 0.4, "sawtooth", 0.06, 131); },
    racha: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tono(f, i * 0.055, 0.14, "square", 0.045)),
    ufo: () => {
      const c = audio(); if (!c) return;
      const o = tono(900, 0, 1.3, "sine", 0.09, 420); if (!o) return;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 9; lg.gain.value = 60; lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(); lfo.stop(c.currentTime + 1.4);
    },
    tada: () => {
      [523, 659, 784].forEach(f => tono(f, 0, 0.18, "triangle", 0.12));
      [659, 784, 1047, 1319].forEach(f => tono(f, 0.2, 0.9, "triangle", 0.1));
      [2093, 2637, 3136, 2637, 3520].forEach((f, i) => tono(f, 0.25 + i * 0.07, 0.12, "sine", 0.04));
    }
  };
  function sonar(n) { if (mudo) return; try { SFX[n] && SFX[n](); } catch (e) {} }
  window.tpSonido = sonar;
 
  // ---------- MÚSICA DE FONDO ----------
  const musica = new Audio(BASE + "musica.mp3");
  musica.loop = true; musica.volume = 0.22; musica.preload = "none";
  let sonando = false;
  function arrancarMusica() {
    if (mudo || sonando) return;
    sonando = true;
    const p = musica.play(); if (p && p.catch) p.catch(() => { sonando = false; });
  }
  function bajarMusica(v, ms) {
    if (!sonando) return;
    const ini = musica.volume, t0 = performance.now();
    const paso = now => { const k = Math.min(1, (now - t0) / ms); musica.volume = ini + (v - ini) * k; if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) musica.pause(); else if (sonando && !mudo) musica.play().catch(() => {}); });
 
  // Botón 🔊 / 🔇 y cronómetro en la barra de arriba
  const barra = document.querySelector(".topbar-inner");
  const reloj = document.createElement("span"); reloj.id = "tp-timer"; reloj.className = "hidden"; reloj.textContent = "⏱️ 0:00";
  const boton = document.createElement("button"); boton.id = "tp-mute"; boton.type = "button";
  const pintarBoton = () => { boton.textContent = mudo ? "🔇" : "🔊"; boton.setAttribute("aria-label", mudo ? "Activar sonido" : "Silenciar"); };
  pintarBoton();
  boton.onclick = () => {
    mudo = !mudo; ls.set("tp_mudo", mudo ? "1" : "0"); pintarBoton();
    if (mudo) { musica.pause(); sonando = false; } else { audio(); arrancarMusica(); sonar("click"); }
  };
  if (barra) { const paso = $("step-label"); barra.insertBefore(reloj, paso || null); barra.appendChild(boton); }
 
  // El primer toque destraba el audio y arranca la música
  document.addEventListener("pointerdown", e => { if (e.target === boton) return; audio(); arrancarMusica(); }, true);
  // Click suave en los botones (las respuestas del Test 1 tienen su propio sonido)
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("button, .btn");
    if (b && b !== boton && !b.closest("#a-choices")) sonar("click");
  }, true);
 
  // ---------- CRONÓMETRO ----------
  let acum = 0, desde = 0, corriendo = false, intervalo = null;
  const fmt = ms => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const tiempo = () => acum + (corriendo ? Date.now() - desde : 0);
  const pintar = () => { reloj.textContent = "⏱️ " + fmt(tiempo()); };
  function relojGo() { if (corriendo) return; corriendo = true; document.body.classList.add("tp-jugando"); desde = Date.now(); reloj.classList.remove("hidden"); clearInterval(intervalo); intervalo = setInterval(pintar, 250); pintar(); }
  function relojPausa() { if (!corriendo) return; acum = tiempo(); corriendo = false; clearInterval(intervalo); pintar(); }
  function relojCero() { relojPausa(); acum = 0; pintar(); }
  window.tpTiempo = () => fmt(tiempo());
 
  // ---------- EFECTOS VISUALES ----------
  function centro(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function confeti(x, y) {
    if (quieto) return;
    const cols = ["#f7b928", "#7af5e8", "#ff5fa2", "#8b5cf6", "#22c55e", "#ffffff"];
    for (let i = 0; i < 40; i++) {
      const d = document.createElement("div"), a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 200;
      const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * 0.7 - 90;
      d.className = "tp-fx";
      d.style.cssText += `left:${x}px;top:${y}px;width:${6 + Math.random() * 6}px;height:${4 + Math.random() * 5}px;background:${cols[i % 6]};border-radius:2px`;
      document.body.appendChild(d);
      d.animate([
        { transform: "translate(-50%,-50%)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px),calc(-50% + ${dy + 260}px)) rotate(${Math.random() * 900}deg)`, opacity: 0 }
      ], { duration: 1200, easing: "cubic-bezier(.2,.8,.4,1)" }).onfinish = () => d.remove();
    }
  }
  function brillos(x, y) {
    if (quieto) return;
    for (let i = 0; i < 7; i++) {
      const d = document.createElement("div"), a = i / 7 * Math.PI * 2;
      d.className = "tp-fx"; d.textContent = "✨"; d.style.cssText += `left:${x}px;top:${y}px;font-size:20px`;
      document.body.appendChild(d);
      d.animate([
        { transform: "translate(-50%,-50%) scale(.2)", opacity: 0 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * 55}px),calc(-50% + ${Math.sin(a) * 55}px)) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * 75}px),calc(-50% + ${Math.sin(a) * 75}px)) scale(.5)`, opacity: 0 }
      ], { duration: 800 }).onfinish = () => d.remove();
    }
  }
  function emoji(x, y, e) {
    const d = document.createElement("div");
    d.className = "tp-fx"; d.textContent = e; d.style.cssText += `left:${x}px;top:${y}px;font-size:34px`;
    document.body.appendChild(d);
    d.animate([
      { transform: "translate(-50%,-30%) scale(0)", opacity: 0 },
      { transform: "translate(-50%,-90%) scale(1.3)", opacity: 1, offset: 0.3 },
      { transform: "translate(-50%,-100%) scale(1)", opacity: 1, offset: 0.8 },
      { transform: "translate(-50%,-130%) scale(.9)", opacity: 0 }
    ], { duration: quieto ? 900 : 1300, easing: "ease-out" }).onfinish = () => d.remove();
  }
  function cartel(txt) {
    const d = document.createElement("div"); d.className = "tp-toast"; d.textContent = txt;
    document.body.appendChild(d);
    d.animate([
      { transform: "translateX(-50%) translateY(40px) scale(.4)", opacity: 0 },
      { transform: "translateX(-50%) scale(1.1)", opacity: 1, offset: 0.15 },
      { transform: "translateX(-50%) scale(1)", opacity: 1, offset: 0.25 },
      { transform: "translateX(-50%) scale(1)", opacity: 1, offset: 0.85 },
      { transform: "translateX(-50%) translateY(-20px)", opacity: 0 }
    ], { duration: 1900, easing: "ease-out" }).onfinish = () => d.remove();
  }
  // Plato volador que "baja" un elemento con su rayo de luz
  function aterrizar(cont, el, conDestello) {
    if (quieto || !cont || !el) return;
    if (getComputedStyle(cont).position === "static") cont.style.position = "relative";
    const ufo = document.createElement("div"); ufo.className = "tp-ufo";
    const k = Math.max(0.55, Math.min(1, el.offsetWidth / 160));
    ufo.innerHTML = `<div style="position:absolute;inset:0;transform:scale(${k});transform-origin:center top"><i></i><b></b></div>`;
    const rayo = document.createElement("div"); rayo.className = "tp-beam";
    cont.appendChild(rayo); cont.appendChild(ufo);
    // centrado sobre el elemento que aterriza
    let ox = 0, oy = 0, n = el; while (n && n !== cont) { ox += n.offsetLeft; oy += n.offsetTop; n = n.offsetParent; }
    const cx = ox + el.offsetWidth / 2, bw = Math.max(110, el.offsetWidth * 1.6);
    ufo.style.left = cx + "px"; ufo.style.top = (oy - 70 * k) + "px";
    rayo.style.left = cx + "px"; rayo.style.top = (oy - 70 * k + 40 * k) + "px";
    rayo.style.width = bw + "px"; rayo.style.marginLeft = (-bw / 2) + "px";
    rayo.style.height = (el.offsetHeight + 70 * k - 40 * k + 10) + "px";
    ufo.animate([{ transform: "translateY(-160px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1, offset: 0.25 }, { transform: "translateY(0)", opacity: 1, offset: 0.75 }, { transform: "translateY(-200px)", opacity: 0 }], { duration: 2200, easing: "ease-in-out" }).onfinish = () => ufo.remove();
    rayo.animate([{ opacity: 0, transform: "scaleY(0)" }, { opacity: 0, transform: "scaleY(0)", offset: 0.2 }, { opacity: 1, transform: "scaleY(1)", offset: 0.35 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }], { duration: 2200 }).onfinish = () => rayo.remove();
    el.animate([{ transform: "translateY(-120px) scale(.12)", opacity: 0 }, { transform: "translateY(-120px) scale(.12)", opacity: 0, offset: 0.3 }, { transform: "translateY(-90px) scale(.3)", opacity: 1, offset: 0.42 }, { transform: "translateY(6px) scale(1.06)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }], { duration: 2000, easing: "cubic-bezier(.3,.8,.4,1.1)", fill: "backwards" });
    sonar("ufo");
    if (conDestello) setTimeout(() => {
      const f = document.createElement("div");
      f.style.cssText = `position:absolute;pointer-events:none;z-index:6;left:${cx}px;top:${oy + el.offsetHeight / 2}px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,#fff,rgba(122,245,232,.6) 35%,rgba(122,245,232,0) 70%)`;
      cont.appendChild(f);
      f.animate([{ transform: "translate(-50%,-50%) scale(.4)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 1, offset: 0.3 }, { transform: "translate(-50%,-50%) scale(1.5)", opacity: 0 }], { duration: 650 }).onfinish = () => f.remove();
    }, 1350);
  }
 
  // ---------- ENGANCHES CON EL JUEGO ----------
  const envolver = (nombre, antes, despues) => {
    const orig = window[nombre]; if (typeof orig !== "function") return;
    window[nombre] = function () { if (antes) antes.apply(this, arguments); const r = orig.apply(this, arguments); if (despues) despues.apply(this, arguments); return r; };
  };
 
  // Portada: los aliens aparecen suave y quedan flotando
  const cast = $("cast");
  if (cast && !quieto) { cast.querySelectorAll("img").forEach((im, i) => { im.style.animationDelay = `${0.1 + i * 0.12}s, ${i * 0.45}s`; }); cast.classList.add("tp-flota"); }
  // Que entren todos en pantallas angostas (achica proporcionalmente si no caben)
  function ajustarFila(fila) {
    if (!fila || !fila.clientWidth) return; // si está oculta, se ajusta cuando aparezca
    const imgs = [...fila.querySelectorAll("img")]; if (!imgs.length) return;
    imgs.forEach(im => { if (!im.dataset.h) im.dataset.h = parseFloat(im.style.height) || im.offsetHeight; });
    if (imgs.some(im => !im.naturalWidth)) { imgs.forEach(im => im.addEventListener("load", () => ajustarFila(fila), { once: true })); return; }
    const solape = imgs.reduce((a, im) => { const cs = getComputedStyle(im); return a + parseFloat(cs.marginLeft) + parseFloat(cs.marginRight); }, 0);
    const ancho = imgs.reduce((a, im) => a + im.dataset.h * im.naturalWidth / im.naturalHeight, 0);
    const disp = fila.clientWidth - 32;
    const k = Math.min(1, (disp - solape) / ancho);
    imgs.forEach(im => { im.style.height = (im.dataset.h * k) + "px"; });
  }
  const ajustarTodo = () => { ajustarFila(cast); ajustarFila($("mini-cast")); };
  ajustarTodo(); window.addEventListener("resize", ajustarTodo);
 
  // Al pasar a elegir temas: el plato volador deja al presentador
  let yaAterrizo = false;
  envolver("show", null, id => {
    setTimeout(ajustarTodo, 30);
    if (id === "s-topics" && !yaAterrizo) {
      yaAterrizo = true;
      const sec = $("s-topics"), host = sec && sec.querySelector(".host-img");
      if (host) setTimeout(() => aterrizar(host.closest(".host") || sec, host, false), 250);
    }
  });
 
  // Test 1: arranca el reloj
  let racha = 0;
  envolver("startPartA", null, () => { if (!$("s-a").classList.contains("hidden")) { racha = 0; relojCero(); relojGo(); } });
 
  // Acierto / error
  envolver("answerA", null, i => {
    try {
      const k = typeof idxA !== "undefined" ? idxA : 0, q = roundA[k];
      if (!q || answersA[k] === undefined) return;
      const ok = answersA[k] === q.author;
      const btn = document.querySelectorAll("#a-choices .choice")[i];
      const host = document.querySelector("#host-a img");
      if (ok) {
        racha++; sonar("ok");
        if (btn) { const p = centro(btn); confeti(p.x, p.y); }
        if (host) { const p = centro(host); brillos(p.x, p.y); }
        if (racha >= 3 && racha % 3 === 0) setTimeout(() => { cartel(`🔥 ¡Racha de ${racha}!`); sonar("racha"); }, 350);
      } else {
        racha = 0; sonar("err");
        if (host) { const p = centro(host); emoji(p.x + 26, p.y - 30, Math.random() < 0.5 ? "😅" : "🤔"); }
      }
    } catch (e) {}
  });
 
  // Fin del Test 1: pausa el reloj y muestra el tiempo
  envolver("finishA", relojPausa, () => {
    setTimeout(ajustarTodo, 30);
    const sc = $("mid-score"); if (!sc) return;
    let t = $("tp-time-mid"); if (!t) { t = document.createElement("div"); t.id = "tp-time-mid"; t.className = "tp-time"; sc.insertAdjacentElement("afterend", t); }
    t.textContent = "⏱️ Lo hiciste en " + fmt(tiempo());
    sonar("tada");
  });
 
  // Test 2: el reloj sigue
  envolver("startPartB", null, relojGo);
 
  // Final: frena el reloj, plato volador + rayo + destello + "tadá"
  envolver("finish", relojPausa, () => {
    const el = $("fb-elogio");
    if (el) {
      let t = $("tp-time-fin"); if (!t) { t = document.createElement("div"); t.id = "tp-time-fin"; t.className = "tp-time"; el.insertAdjacentElement("afterend", t); }
      t.textContent = "⏱️ Lo hiciste en " + fmt(tiempo());
    }
    const av = $("fb-avatar"), img = av && av.querySelector("img");
    const badge = document.querySelector("#s-results .profile-badge");
    setTimeout(() => {
      if (img) aterrizar(av, img, true);
      if (badge && !quieto) { badge.classList.remove("tp-type"); void badge.offsetWidth; badge.style.animationDelay = "1.6s"; badge.classList.add("tp-type"); }
      const nick = $("fb-nick");
      if (nick && !quieto) nick.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(0)", opacity: 0, offset: 0.55 }, { transform: "scale(1.15)", opacity: 1, offset: 0.8 }, { transform: "scale(1)", opacity: 1 }], { duration: 2600, easing: "ease-out" });
      setTimeout(() => { sonar("tada"); bajarMusica(0.12, 400); setTimeout(() => bajarMusica(0.22, 1500), 1800); }, 1400);
    }, 350);
  });
})();
 
