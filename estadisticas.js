/* =====================================================
   "Cómo respondió la gente" — adelanto gratis + informes pagos
   Lo usan las dos versiones del juego (larga y rápida).
   Solo muestra números totales, nunca respuestas individuales.
   ===================================================== */
(function () {
  const API = "https://script.google.com/macros/s/AKfycbwzlhXYIPdG2DEcF-vCTL8oai4YYG1CV8P3R3UA_dauGYg9fZ12Qmn-Y83dmtQdqC3g/exec";
  const PLANES = {
    resumen: { nombre: "Resumen", precio: "$15.000", items: ["Qué postura gana en cada tema", "Qué elige cada rango de edad", "Los temas que más le importan a la gente"] },
    completo: { nombre: "Completo", precio: "$30.000", items: ["Todo lo del Resumen", "Qué frases confunden más y a quién se las atribuyen", "Qué espacio suma más adhesiones y cuál más errores", "Quiénes votan a un partido pero piensan como otro"] }
  };
  const params = new URLSearchParams(location.search);
  const PRUEBA = params.get("prueba") === "1";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const guardado = () => { try { return localStorage.getItem("tp_codigo") || ""; } catch (e) { return ""; } };
  const guardar = c => { try { localStorage.setItem("tp_codigo", c); } catch (e) {} };
  const api = q => fetch(API + "?" + new URLSearchParams(q)).then(r => r.json());

  const css = `
  #tp-stats{position:fixed;inset:0;z-index:9999;overflow-y:auto;background:#0b0d24 radial-gradient(circle at 20% 10%,rgba(122,245,232,.08),transparent 40%);color:#eef0ff;font-family:Inter,system-ui,sans-serif;-webkit-overflow-scrolling:touch}
  #tp-stats *{box-sizing:border-box}
  #tp-stats .w{max-width:620px;margin:0 auto;padding:1rem 1rem 4rem}
  #tp-stats .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
  #tp-stats h2{font-family:Montserrat,Inter,sans-serif;font-weight:900;text-transform:uppercase;font-size:1.45rem;margin:.2rem 0 .3rem;line-height:1.15}
  #tp-stats h3{font-size:1rem;margin:0 0 .7rem;color:#7af5e8}
  #tp-stats .x{background:rgba(255,255,255,.1);border:0;color:#fff;border-radius:999px;padding:.5rem .9rem;font-weight:700;cursor:pointer}
  #tp-stats .card{background:#151a3d;border:1px solid rgba(122,245,232,.18);border-radius:16px;padding:1.1rem;margin-bottom:1rem}
  #tp-stats .muted{color:#9aa3d6;font-size:.88rem}
  #tp-stats .kpis{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
  #tp-stats .kpi{background:#10143a;border-radius:12px;padding:.8rem;text-align:center}
  #tp-stats .kpi b{display:block;font-size:1.7rem;color:#f7b928;font-family:Montserrat,Inter,sans-serif}
  #tp-stats .lock{filter:blur(5px);user-select:none}
  #tp-stats .plan{border:1px solid rgba(247,185,40,.45);background:linear-gradient(180deg,#1b2050,#151a3d)}
  #tp-stats .plan ul{margin:.4rem 0 .9rem;padding-left:1.1rem;font-size:.92rem}
  #tp-stats .precio{font-size:1.5rem;font-weight:900;color:#f7b928;font-family:Montserrat,Inter,sans-serif}
  #tp-stats .btn{display:block;width:100%;border:0;border-radius:12px;padding:.9rem;font-weight:800;font-size:1rem;cursor:pointer;background:#f7b928;color:#1a1300}
  #tp-stats .btn.sec{background:rgba(255,255,255,.12);color:#fff}
  #tp-stats .btn:disabled{opacity:.6}
  #tp-stats input{width:100%;padding:.8rem;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#0f1333;color:#fff;font-size:1rem;margin:.3rem 0 .7rem}
  #tp-stats .err{color:#ff8fa3;font-size:.88rem;margin:.3rem 0}
  #tp-stats .ok{color:#7af5e8;font-weight:700}
  #tp-stats .bar{margin:.45rem 0}
  #tp-stats .bar .l{display:flex;justify-content:space-between;font-size:.88rem;gap:.5rem}
  #tp-stats .bar .t{height:8px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;margin-top:.2rem}
  #tp-stats .bar .f{height:100%;background:#f7b928;border-radius:99px}
  #tp-stats .grupo{border-top:1px solid rgba(255,255,255,.08);padding-top:.6rem;margin-top:.6rem}
  #tp-stats .grupo:first-of-type{border-top:0;margin-top:0;padding-top:0}
  #tp-stats .codigo{font-size:1.6rem;letter-spacing:.2em;font-weight:900;text-align:center;background:#10143a;border-radius:12px;padding:.7rem;margin:.5rem 0}
  #tp-stats a{color:#7af5e8}
  `;

  function abrir(html) {
    let el = document.getElementById("tp-stats");
    if (!el) {
      const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
      el = document.createElement("div"); el.id = "tp-stats"; document.body.appendChild(el);
    }
    el.innerHTML = `<div class="w"><div class="top"><span class="muted">📊 Test Político</span><button class="x" onclick="cerrarEstadisticas()">✕ Cerrar</button></div><div id="tp-body">${html}</div></div>`;
    el.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }
  window.cerrarEstadisticas = function () {
    const el = document.getElementById("tp-stats"); if (el) el.remove();
    document.body.style.overflow = "";
    if (params.has("pago") || params.has("codigo")) history.replaceState(null, "", location.pathname);
  };
  const body = h => { document.getElementById("tp-body").innerHTML = h; };
  const bar = (label, pct, extra) => `<div class="bar"><div class="l"><span>${esc(label)}</span><strong>${pct}%${extra ? " · " + esc(extra) : ""}</strong></div><div class="t"><div class="f" style="width:${pct}%"></div></div></div>`;

  window.abrirEstadisticas = function () {
    abrir(`<h2>Cómo respondió la gente</h2><p class="muted">Cargando datos…</p>`);
    api({ accion: "adelanto" }).then(d => {
      const cod = guardado();
      const planes = Object.entries(PLANES).concat(PRUEBA ? [["prueba", { nombre: "Prueba", precio: "$100", items: ["Pago de prueba: da acceso al Completo"] }]] : []);
      body(`
        <h2>Cómo respondió la gente</h2>
        <p class="muted">Datos de todas las personas que hicieron el test. Siempre totales, nunca respuestas de una persona.</p>
        <div class="card">
          <h3>🎁 Gratis</h3>
          <div class="kpis">
            <div class="kpi"><b>${d.total ?? "-"}</b><span class="muted">personas jugaron</span></div>
            <div class="kpi"><b>${d.promedioAciertos != null ? d.promedioAciertos + "%" : "-"}</b><span class="muted">de aciertos promedio en el Test 1</span></div>
          </div>
          ${d.temasTop && d.temasTop.length ? `<p style="margin:.9rem 0 .3rem;font-weight:700">⭐ Los temas que más le importan a la gente:</p><ol style="margin:0;padding-left:1.2rem">${d.temasTop.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}
          ${d.temasTop && d.temasTop[0] ? `<p style="margin:.9rem 0 0">🔒 En <strong>${esc(d.temasTop[0])}</strong>, la postura más elegida fue <span class="lock">████████████</span>… <span class="muted">(en el informe)</span></p>` : ""}
        </div>
        ${cod ? `<button class="btn" style="margin-bottom:1rem" onclick="verInforme('${esc(cod)}')">📊 Ver mi informe</button>` : ""}
        <div class="card">
          <h3>🔓 Desbloqueá el informe</h3>
          <label class="muted">Tu email (ahí te llega el código de acceso)</label>
          <input type="email" id="tp-email" placeholder="tu@correo.com" autocomplete="email">
          <div id="tp-err" class="err"></div>
        </div>
        ${planes.map(([k, p]) => `
          <div class="card plan">
            <div style="display:flex;justify-content:space-between;align-items:baseline"><h3 style="margin:0">Informe ${esc(p.nombre)}</h3><span class="precio">${p.precio}</span></div>
            <ul>${p.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
            <button class="btn" id="tp-pay-${k}" onclick="pagarInforme('${k}')">Pagar con Mercado Pago</button>
          </div>`).join("")}
        <div class="card">
          <h3>¿Ya tenés un código?</h3>
          <input type="text" id="tp-cod" placeholder="Ej: A1B2C3D4" style="text-transform:uppercase">
          <button class="btn sec" onclick="verInforme(document.getElementById('tp-cod').value)">Ver informe</button>
          <p class="muted" style="margin-top:.8rem">¿Pagaste y no te llegó el código? <a href="#" onclick="recuperarCodigo();return false">Reenviámelo</a> (usa el email de arriba).</p>
        </div>`);
    }).catch(() => body(`<h2>Cómo respondió la gente</h2><p class="err">No pudimos cargar los datos. Probá de nuevo en un rato.</p>`));
  };

  const emailOk = () => {
    const e = (document.getElementById("tp-email").value || "").trim();
    const err = document.getElementById("tp-err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { err.textContent = "Escribí tu email para recibir el código."; document.getElementById("tp-email").focus(); return ""; }
    err.textContent = ""; return e;
  };

  window.pagarInforme = function (plan) {
    const email = emailOk(); if (!email) return;
    const b = document.getElementById("tp-pay-" + plan); b.disabled = true; b.textContent = "Abriendo Mercado Pago…";
    api({ accion: "pagar", plan, email, volver: location.origin + location.pathname }).then(r => {
      if (r.url) { location.href = r.url; return; }
      b.disabled = false; b.textContent = "Pagar con Mercado Pago";
      document.getElementById("tp-err").textContent = "No pudimos abrir Mercado Pago. Probá de nuevo en un rato.";
    }).catch(() => { b.disabled = false; b.textContent = "Pagar con Mercado Pago"; });
  };

  window.recuperarCodigo = function () {
    const email = emailOk(); if (!email) return;
    document.getElementById("tp-err").textContent = "Buscando tus pagos…";
    api({ accion: "recuperar", email }).then(r => {
      document.getElementById("tp-err").innerHTML = r.enviados ? `<span class="ok">✓ Te reenviamos el código a ${esc(email)}. Revisá también Spam.</span>` : "No encontramos pagos aprobados con ese email.";
    });
  };

  function volviDePagar() {
    const id = params.get("payment_id") || params.get("collection_id");
    abrir(`<h2>Confirmando tu pago…</h2><p class="muted">Un segundo, estamos chequeando con Mercado Pago.</p>`);
    if (!id || id === "null") { body(`<h2>El pago no se completó</h2><p class="muted">No se hizo ningún cobro. Podés intentarlo de nuevo cuando quieras.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`); return; }
    api({ accion: "verificar", payment_id: id }).then(r => {
      if (r.estado === "approved" && r.codigo) {
        guardar(r.codigo);
        body(`<h2>¡Pago aprobado! 🎉</h2><p>Este es tu código. También te lo mandamos por mail:</p><div class="codigo">${esc(r.codigo)}</div><button class="btn" onclick="verInforme('${esc(r.codigo)}')">📊 Ver mi informe</button>`);
      } else if (r.estado === "pending" || r.estado === "in_process") {
        body(`<h2>Tu pago está pendiente ⏳</h2><p class="muted">Cuando Mercado Pago lo apruebe, volvé a esta pantalla y tocá “Reenviámelo” con tu email para recibir el código.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`);
      } else {
        body(`<h2>El pago no se aprobó</h2><p class="muted">No se hizo ningún cobro. Podés intentarlo de nuevo con otro medio de pago.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`);
      }
    }).catch(() => body(`<h2>No pudimos confirmar el pago</h2><p class="muted">Si te cobraron, tocá “Reenviámelo” con tu email y te llega el código.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`));
  }

  window.verInforme = function (codigo) {
    codigo = String(codigo || "").trim().toUpperCase();
    if (!codigo) return;
    abrir(`<h2>Tu informe</h2><p class="muted">Cargando…</p>`);
    api({ accion: "informe", codigo }).then(d => {
      if (d.error) { body(`<h2>Código no válido</h2><p class="muted">Revisá que esté bien escrito.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`); return; }
      guardar(codigo);
      const n = d.total, grupos = (arr, titulo) => arr.map(g => `<div class="grupo"><p style="margin:0 0 .2rem;font-weight:700">${esc(g[titulo])} <span class="muted">(${g.n} personas)</span></p>${g.ranking.slice(0, 3).map(([k, p]) => bar(k, p)).join("")}</div>`).join("") || `<p class="muted">Todavía no hay suficientes respuestas.</p>`;
      let h = `
        <h2>Informe ${d.plan === "completo" ? "Completo" : "Resumen"}</h2>
        <p class="muted">Basado en ${n} personas · se actualiza solo a medida que más gente juega.</p>
        <div class="card"><h3>⭐ Los temas que más le importan a la gente</h3>${d.temas.map(([t, c]) => bar(t, Math.round(100 * c / (n || 1)))).join("")}</div>
        <div class="card"><h3>🧭 Qué postura gana en cada tema</h3>${grupos(d.ganadorPorTema, "tema")}</div>
        <div class="card"><h3>🎂 Qué elige cada rango de edad</h3>${grupos(d.porEdad, "edad")}</div>`;
      if (d.plan === "completo") {
        h += `
        <div class="card"><h3>🤯 Las confusiones más comunes</h3><p class="muted">Frases de un referente que la gente le atribuyó a otro.</p>${(d.confusiones || []).map(([k, c]) => { const [era, dijo] = k.split(" → "); return `<p style="margin:.4rem 0">Frases de <strong>${esc(era)}</strong> que sonaron a <strong>${esc(dijo)}</strong>: ${c} veces</p>`; }).join("")}</div>
        <div class="card"><h3>🎯 ¿A quién se reconoce más?</h3><p class="muted">Porcentaje de aciertos según quién dijo la frase.</p>${(d.aciertosPorReferente || []).map(([k, p, t]) => bar(k, p, t + " frases")).join("")}</div>
        <div class="card"><h3>🗳️ Qué espacio suma más adhesiones</h3><p class="muted">Con qué espacio coincidió más cada persona en el Test 2, sin ver nombres.</p>${(d.espacios || []).map(([k, p]) => bar(k, p)).join("")}</div>
        <div class="card"><h3>🔄 Votan a uno, piensan como otro</h3><p class="muted">Según su voto habitual, con qué espacio coincidieron más a ciegas.</p>${grupos(d.votoVsIdeas || [], "voto")}</div>`;
      }
      h += `<p class="muted">Tu código: <strong>${esc(codigo)}</strong> · guardalo para volver a entrar.</p>`;
      body(h);
    }).catch(() => body(`<h2>No pudimos cargar el informe</h2><button class="btn" onclick="abrirEstadisticas()">Volver</button>`));
  };

  function inicio() {
    if (params.get("pago") === "1") volviDePagar();
    else if (params.get("codigo")) verInforme(params.get("codigo"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicio); else inicio();
})();
