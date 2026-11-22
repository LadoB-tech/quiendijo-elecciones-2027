/* =====================================================
   "Cómo respondió la gente" — adelanto gratis + informes pagos
   Lo usan las dos versiones del juego (larga y rápida).
   Solo muestra números totales, nunca respuestas individuales.
   ===================================================== */
(function () {
  const API = "https://script.google.com/macros/s/AKfycbwzlhXYIPdG2DEcF-vCTL8oai4YYG1CV8P3R3UA_dauGYg9fZ12Qmn-Y83dmtQdqC3g/exec";
  const PLANES = {
    resumen: { nombre: "Resumen", precio: "$4.000", items: ["🪞 Vos vs. el resto: en qué temas sos mayoría y en cuáles minoría", "⭐ Tu tarjeta PRO para compartir, con tus datos", "Qué tan raro es tu alien y cómo te fue comparado con el promedio", "Qué postura gana en cada tema y qué elige cada edad"] },
    completo: { nombre: "Completo", precio: "$10.000", items: ["Todo lo del Resumen, con tarjeta PRO", "📍 Tu comparación con gente de tu edad y de tu provincia", "Qué frases confunden más y a quién se las atribuyen", "Qué espacio suma más adhesiones", "Quiénes votan a un partido pero piensan como otro"] }
  };
  const params = new URLSearchParams(location.search);
  const PRUEBA = params.get("prueba") === "1";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const guardado = () => { try { return localStorage.getItem("tp_codigo") || ""; } catch (e) { return ""; } };
  const guardar = c => { try { localStorage.setItem("tp_codigo", c); } catch (e) {} };
  const api = q => fetch(API + "?" + new URLSearchParams(q)).then(r => r.json());
  const ls = { get: k => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const mis = () => { try { return JSON.parse(ls.get("tp_mis") || "null"); } catch (e) { return null; } };
 
  // ---------- Invitaciones ----------
  window.tpMiRef = function () {
    let r = ls.get("tp_mi_ref");
    if (!/^[A-Z0-9]{8}$/.test(r)) { r = Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join(""); ls.set("tp_mi_ref", r); }
    return r;
  };
  window.tpRefDe = function () { const r = ls.get("tp_ref_de"); return r && r !== ls.get("tp_mi_ref") ? r : ""; };
  (function () { const r = String(params.get("ref") || "").toUpperCase(); if (/^[A-Z0-9]{6,12}$/.test(r) && r !== ls.get("tp_mi_ref")) ls.set("tp_ref_de", r); })();
  const linkInvitacion = () => location.origin + location.pathname + "?ref=" + tpMiRef();
 
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
  #tp-stats .lectura{background:rgba(122,245,232,.07);border-left:3px solid #7af5e8;border-radius:8px;padding:.6rem .75rem;margin:.2rem 0 .8rem;font-size:.92rem;line-height:1.5}
  #tp-stats .metodo p{font-size:.9rem;line-height:1.55;margin:0;color:#c9cff0}
  #tp-stats .concl{border-color:rgba(247,185,40,.45)}
  #tp-stats .concl ul{margin:0;padding-left:1.1rem;line-height:1.6}
  #tp-stats .yo{border:1.5px solid rgba(247,185,40,.6);background:linear-gradient(180deg,#221f4a,#151a3d)}
  #tp-stats .yo .fila{display:flex;gap:.6rem;align-items:flex-start;padding:.55rem 0;border-top:1px solid rgba(255,255,255,.07);font-size:.93rem;line-height:1.45}
  #tp-stats .yo .fila:first-of-type{border-top:0}
  #tp-stats .tag{flex:0 0 auto;font-size:.72rem;font-weight:800;border-radius:99px;padding:.2rem .5rem;margin-top:.1rem}
  #tp-stats .tag.may{background:rgba(122,245,232,.15);color:#7af5e8}
  #tp-stats .tag.min{background:rgba(247,185,40,.18);color:#f7b928}
  #tp-stats .big{font-family:Montserrat,Inter,sans-serif;font-weight:900;font-size:2rem;color:#f7b928;line-height:1}
  #tp-stats .trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin-bottom:.8rem}
  #tp-stats .gift{border:1.5px dashed rgba(122,245,232,.5)}
  #tp-stats .prog{height:10px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;margin:.4rem 0 .8rem}
  #tp-stats .prog div{height:100%;background:#7af5e8}
  #tp-stats .row2{display:flex;gap:.5rem}
  #tp-stats .row2 .btn{flex:1}
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
        <p class="muted">Datos de todas las personas que hicieron el test. Siempre totales, nunca respuestas de una persona. 🔄 El informe se actualiza solo: con tu código podés volver cuando quieras y ver los datos nuevos.</p>
        <div class="card">
          <h3>🎁 Gratis</h3>
          ${d.promedioAciertos != null ? `<div class="kpi"><b>${d.promedioAciertos}%</b><span class="muted">de aciertos promedio en el Test 1: ¿estás arriba o abajo?</span></div>` : ""}
          ${d.temasTop && d.temasTop.length ? `<p style="margin:.9rem 0 .3rem;font-weight:700">⭐ Los temas que más le importan a la gente:</p><ol style="margin:0;padding-left:1.2rem">${d.temasTop.map(t => `<li>${esc(t)}</li>`).join("")}</ol>` : ""}
          ${d.temasTop && d.temasTop[0] ? `<p style="margin:.9rem 0 0">🔒 En <strong>${esc(d.temasTop[0])}</strong>, la postura más elegida fue <span class="lock">████████████</span>… <span class="muted">(en el informe)</span></p>` : ""}
        </div>
        ${cod ? `<button class="btn" style="margin-bottom:1rem" onclick="verInforme('${esc(cod)}')">📊 Ver mi informe</button>` : ""}
        <div class="card">
          <h3>🔓 Desbloqueá el informe</h3>
          <label class="muted">Tu email (ahí te llega el código de acceso)</label>
          <input type="text" inputmode="email" id="tp-email" placeholder="tu@correo.com" autocomplete="email" oninput="document.getElementById('tp-err').textContent=''">
          <div id="tp-err" class="err"></div>
        </div>
        ${planes.map(([k, p]) => `
          <div class="card plan">
            <div style="display:flex;justify-content:space-between;align-items:baseline"><h3 style="margin:0">Informe ${esc(p.nombre)}</h3><span class="precio">${p.precio}</span></div>
            <ul>${p.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
            <button class="btn" id="tp-pay-${k}" onclick="pagarInforme('${k}')">Pagar con Mercado Pago</button>
          </div>`).join("")}
        <div class="card gift" id="tp-gift">
          <h3>🎁 Gratis: invitá a 3 amigos</h3>
          <p style="margin:0 0 .6rem">Compartí tu link. Cuando <strong>3 amigos terminen el Test 1</strong> entrando por ahí, el <strong>Informe Resumen</strong> (con tu tarjeta PRO) es tuyo.</p>
          <input type="text" readonly value="${esc(linkInvitacion())}" onclick="this.select()">
          <div class="row2"><button class="btn" onclick="compartirInvitacion()">📲 Compartir mi link</button><button class="btn sec" onclick="copiarInvitacion(this)">Copiar</button></div>
          <div id="tp-ref-estado" class="muted" style="margin-top:.8rem">Contando tus invitados…</div>
        </div>
        <div class="card">
          <h3>¿Ya tenés un código?</h3>
          <input type="text" id="tp-cod" placeholder="Ej: A1B2C3D4" style="text-transform:uppercase">
          <button class="btn sec" onclick="verInforme(document.getElementById('tp-cod').value)">Ver informe</button>
          <p class="muted" style="margin-top:.8rem">¿Pagaste y no te llegó el código? <a href="#" onclick="recuperarCodigo();return false">Reenviámelo</a> (usa el email de arriba).</p>
        </div>`);
      estadoInvitados();
    }).catch(() => body(`<h2>Cómo respondió la gente</h2><p class="err">No pudimos cargar los datos. Probá de nuevo en un rato.</p>`));
  };
 
  function estadoInvitados() {
    const el = document.getElementById("tp-ref-estado"); if (!el) return;
    api({ accion: "referidos", ref: tpMiRef() }).then(r => {
      const c = Math.min(r.cuenta || 0, r.meta || 3), m = r.meta || 3;
      if (c >= m) {
        el.innerHTML = `<div class="prog"><div style="width:100%"></div></div><p class="ok" style="margin:0 0 .5rem">🎉 ¡Ya jugaron ${m} amigos! Desbloqueá tu Resumen gratis:</p>
          <input type="text" inputmode="email" id="tp-gift-email" placeholder="tu@correo.com" autocomplete="email">
          <button class="btn" id="tp-gift-btn" onclick="canjearInvitacion()">🔓 Desbloquear gratis</button><div id="tp-gift-err" class="err"></div>`;
      } else {
        el.innerHTML = `<div class="prog"><div style="width:${Math.round(100 * c / m)}%"></div></div><span>${c} de ${m} amigos ya jugaron con tu link.</span>`;
      }
    }).catch(() => { el.textContent = ""; });
  }
  window.compartirInvitacion = function () {
    const url = linkInvitacion(), text = "👽 ¿Qué alien político sos? Frases reales sin nombres ni partidos. Jugalo acá:";
    if (navigator.share) navigator.share({ title: "Test Político", text, url }).catch(() => {});
    else window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank");
  };
  window.copiarInvitacion = function (b) {
    (navigator.clipboard ? navigator.clipboard.writeText(linkInvitacion()) : Promise.reject()).then(() => { b.textContent = "✓ Copiado"; }).catch(() => { b.textContent = "Copialo de arriba"; });
  };
  window.canjearInvitacion = function () {
    const e = (document.getElementById("tp-gift-email").value || "").trim(), err = document.getElementById("tp-gift-err"), b = document.getElementById("tp-gift-btn");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { err.textContent = "Escribí tu email para recibir el código."; return; }
    b.disabled = true; b.textContent = "Desbloqueando…"; err.textContent = "";
    api({ accion: "canjear", ref: tpMiRef(), email: e }).then(r => {
      if (r.codigo) { guardar(r.codigo); verInforme(r.codigo); return; }
      b.disabled = false; b.textContent = "🔓 Desbloquear gratis";
      err.textContent = r.error === "faltan" ? `Todavía faltan amigos (${r.cuenta} de ${r.meta}).` : "No pudimos desbloquearlo. Probá de nuevo en un rato.";
    }).catch(() => { b.disabled = false; b.textContent = "🔓 Desbloquear gratis"; err.textContent = "No pudimos conectarnos. Probá de nuevo."; });
  };
 
  const emailOk = () => {
    const e = (document.getElementById("tp-email").value || "").trim();
    const err = document.getElementById("tp-err");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { err.textContent = "Escribí tu email para recibir el código."; document.getElementById("tp-email").focus(); return ""; }
    err.textContent = ""; return e;
  };
 
  window.pagarInforme = function (plan) {
    const email = emailOk(); if (!email) return;
    const b = document.getElementById("tp-pay-" + plan), err = document.getElementById("tp-err");
    const reset = msg => { b.disabled = false; b.textContent = "Pagar con Mercado Pago"; err.textContent = msg; };
    b.disabled = true; b.textContent = "Abriendo Mercado Pago…";
    err.innerHTML = '<span class="ok">Abriendo Mercado Pago, esperá unos segundos…</span>';
    api({ accion: "pagar", plan, email, volver: location.origin + location.pathname }).then(r => {
      if (r.url) { location.href = r.url; return; }
      reset("No pudimos abrir Mercado Pago (" + (r.error || "error") + "). Probá de nuevo en un rato.");
    }).catch(e => reset("No pudimos conectarnos. Revisá tu conexión y probá de nuevo."));
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
 
  // ---------- Textos de lectura (se generan solos con los datos) ----------
  const nom = x => x === "Ninguna" ? "“ninguna me convence”" : x;
  const B = x => `<strong>${esc(nom(x))}</strong>`;
  const PROPIO = { "La Libertad Avanza / Libertarios": "Libertaria", "PRO / Centroderecha": "Centro (PRO / UCR)", "UCR / Centro": "Centro (PRO / UCR)", "Peronismo / Unión por la Patria": "Peronismo", "Frente de Izquierda": "Izquierda" };
  const gap = r => r.length > 1 ? r[0][1] - r[1][1] : 100;
  const nivel = g => g < 5 ? "prácticamente un empate" : g < 15 ? "una ventaja moderada" : "una diferencia clara";
  const lee = t => `<p class="lectura">💡 ${t}</p>`;
 
  function textoTemas(d) {
    const t = d.temas, n = d.total || 1;
    if (!t.length) return "";
    const pct = c => Math.round(100 * c / n);
    return lee(`El tema que más le importa a la gente es ${B(t[0][0])}: lo eligió el ${pct(t[0][1])}% entre sus tres prioridades${t[1] ? `, seguido por ${B(t[1][0])} (${pct(t[1][1])}%)` : ""}${t[2] ? ` y ${B(t[2][0])} (${pct(t[2][1])}%)` : ""}.`);
  }
  function textoPosturas(d) {
    const g = d.ganadorPorTema.filter(x => x.ranking.length);
    if (!g.length) return "";
    const ord = g.filter(x => x.ranking.length > 1 && x.ranking[0][0] !== "Ninguna").sort((a, b) => gap(a.ranking) - gap(b.ranking));
    if (!ord.length) ord.push(g[0]);
    const dis = ord[0], cla = ord[ord.length - 1];
    let t = `En ${B(dis.tema)} está la discusión más pareja: ${B(dis.ranking[0][0])} (${dis.ranking[0][1]}%) y ${B(dis.ranking[1] ? dis.ranking[1][0] : "")} (${dis.ranking[1] ? dis.ranking[1][1] : 0}%), ${nivel(gap(dis.ranking))}.`;
    if (cla !== dis) t += ` En ${B(cla.tema)}, en cambio, ${B(cla.ranking[0][0])} gana con ${nivel(gap(cla.ranking))} (${cla.ranking[0][1]}%).`;
    const nin = g.filter(x => x.ranking[0][0] === "Ninguna").map(x => x.tema);
    if (nin.length) t += ` En ${nin.map(B).join(", ")} lo más elegido fue que ninguna propuesta convence: una señal de descontento con las ofertas actuales.`;
    return lee(t);
  }
  function textoEdades(d) {
    const g = d.porEdad;
    if (g.length < 2) return g.length ? lee(`En el rango ${B(g[0].edad)}, la postura más elegida es ${B(g[0].ranking[0][0])} (${g[0].ranking[0][1]}%).`) : "";
    const tops = [...new Set(g.map(x => x.ranking[0][0]))];
    if (tops.length === 1) return lee(`En todos los rangos de edad la afinidad más alta es con ${B(tops[0])}: la edad no cambia la tendencia general.`);
    return lee(`La edad sí marca diferencias: ${g.map(x => `en el rango de ${esc(x.edad)} gana ${B(x.ranking[0][0])} (${x.ranking[0][1]}%)`).join("; ")}.`);
  }
  function textoConfusiones(d) {
    const c = d.confusiones || [];
    if (!c.length) return "";
    const [era, dijo] = c[0][0].split(" → ");
    return lee(`La confusión más repetida es atribuirle a ${B(dijo)} frases que en realidad dijo ${B(era)} (${c[0][1]} veces). Cuando no se ve quién habla, los discursos se parecen más de lo que se cree.`);
  }
  function textoAciertos(d) {
    const a = d.aciertosPorReferente || [];
    if (a.length < 2) return "";
    const dif = a[0], fac = a[a.length - 1];
    return lee(`El referente más fácil de reconocer es ${B(fac[0])} (${fac[1]}% de aciertos) y el más difícil, ${B(dif[0])} (${dif[1]}%).`);
  }
  function textoEspacios(d) {
    const e = d.espacios || [];
    if (!e.length) return "";
    const g2 = e[1] ? e[0][1] - e[1][1] : 100;
    return lee(`A ciegas, la mayor coincidencia es con ${B(e[0][0])} (${e[0][1]}%)${e[1] ? (g2 < 5 ? `, prácticamente empatado con ${B(e[1][0])} (${e[1][1]}%)` : `, por delante de ${B(e[1][0])} (${e[1][1]}%)`) : ""}.`);
  }
  function desfasajes(d) {
    return (d.votoVsIdeas || []).map(g => {
      const propio = PROPIO[g.voto]; if (!propio) return null;
      const mio = (g.ranking.find(r => r[0] === propio) || [propio, 0])[1];
      return { voto: g.voto, propio, mio, top: g.ranking[0] };
    }).filter(Boolean);
  }
  function textoVoto(d) {
    const x = desfasajes(d);
    if (!x.length) return "";
    const fuera = x.filter(y => y.top[0] !== y.propio).sort((a, b) => a.mio - b.mio);
    if (!fuera.length) return lee(`En todos los grupos, la coincidencia más alta fue con propuestas de su propio espacio: el voto y las ideas van de la mano.`);
    const f = fuera[0];
    return lee(`El mayor desfasaje está entre quienes votan ${B(f.voto)}: a ciegas, el ${f.top[1]}% coincidió más con ${B(f.top[0])} y solo el ${f.mio}% con su propio espacio.`);
  }
  function conclusiones(d) {
    const out = [];
    if (d.temas[0]) out.push(`La prioridad número uno de la gente es ${B(d.temas[0][0])}.`);
    const g = d.ganadorPorTema.filter(x => x.ranking.length > 1 && x.ranking[0][0] !== "Ninguna").sort((a, b) => gap(a.ranking) - gap(b.ranking));
    if (g[0]) out.push(`El tema más disputado es ${B(g[0].tema)}: ${nivel(gap(g[0].ranking))} entre ${B(g[0].ranking[0][0])} y ${B(g[0].ranking[1][0])}.`);
    if (d.plan === "completo") {
      const c = (d.confusiones || [])[0];
      if (c) { const [era, dijo] = c[0].split(" → "); out.push(`Las frases de ${B(era)} son las que más se confunden con las de ${B(dijo)}.`); }
      const f = desfasajes(d).filter(y => y.top[0] !== y.propio).sort((a, b) => a.mio - b.mio)[0];
      if (f) out.push(`Quienes votan ${B(f.voto)} son los que más coinciden con ideas de otro espacio (${B(f.top[0])}).`);
    } else if (d.porEdad.length > 1) {
      const tops = [...new Set(d.porEdad.map(x => x.ranking[0][0]))];
      out.push(tops.length > 1 ? `Las preferencias cambian según la edad.` : `Las preferencias son parecidas en todas las edades.`);
    }
    return out.length ? `<div class="card concl"><h3>📌 Conclusiones principales</h3><ul>${out.map(t => `<li>${t}</li>`).join("")}</ul></div>` : "";
  }
  const metodo = d => `<div class="card metodo"><h3>📐 Cómo leer este informe</h3><p>Este informe resume las respuestas de <strong>${d.total} personas</strong> que hicieron el test de forma voluntaria y anónima. No es una encuesta representativa de toda la población: muestra cómo piensan quienes jugaron. Los porcentajes se calculan sobre quienes respondieron cada pregunta y se redondean, por eso pueden no sumar exactamente 100. No se muestra ningún grupo con menos de 5 personas, para proteger la privacidad. Cuando dos opciones están a menos de 5 puntos, lo leemos como un empate.</p></div>`;
 
 
  // =====================================================
  //  TARJETAS PARA COMPARTIR (gratis y PRO)
  // =====================================================
  const conTope = (p, ms, def) => Promise.race([p, new Promise(r => setTimeout(() => r(def), ms))]);
  const cargarImg = src => new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const envolver = (x, t, w) => { const ws = String(t).split(" "), out = []; let l = ""; ws.forEach(p => { const n = l ? l + " " + p : p; if (x.measureText(n).width > w && l) { out.push(l); l = p; } else l = n; }); if (l) out.push(l); return out; };
  const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  const F = (peso, px) => `${peso} ${px}px Montserrat, Inter, sans-serif`;
 
  async function dibujarTarjeta(m, pro) {
    try { if (document.fonts) await conTope(document.fonts.load(F(900, 40)).then(() => document.fonts.ready), 1500); } catch (e) {}
    const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"), col = /^#[0-9a-f]{6}$/i.test(m.color || "") ? m.color : "#7af5e8";
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pro ? "#120c2e" : "#0b0d24"); g.addColorStop(1, pro ? "#2a1d55" : "#1a1f55");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 150; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.6})`; x.beginPath(); x.arc(rnd() * W, rnd() * H, rnd() * 2.4 + 0.6, 0, 7); x.fill(); }
    const piso = pro ? 960 : 1110, alto = pro ? 620 : 760;
    const rg = x.createRadialGradient(W / 2, piso - alto / 2, 30, W / 2, piso - alto / 2, 520);
    rg.addColorStop(0, col + "bb"); rg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    try { x.letterSpacing = "6px"; } catch (e) {}
    x.fillStyle = "#f7b928"; x.font = F(800, 32); x.fillText(pro ? "⭐ TEST POLÍTICO · EDICIÓN PRO ⭐" : "TEST POLÍTICO", W / 2, 130);
    try { x.letterSpacing = "0px"; } catch (e) {}
    x.fillStyle = "#fff"; x.font = F(900, 66); x.fillText("¿QUÉ ALIEN POLÍTICO SOS?", W / 2, 220);
    const img = await conTope(cargarImg(typeof AVATAR_IMG !== "undefined" ? AVATAR_IMG[m.perfilKey] : ""), 3000, null);
    if (img) { const k = Math.min(alto / img.height, 940 / img.width), w = img.width * k, h = img.height * k; x.shadowColor = "rgba(0,0,0,.55)"; x.shadowBlur = 40; x.drawImage(img, (W - w) / 2, piso - h, w, h); x.shadowBlur = 0; }
    x.fillStyle = "rgba(122,245,232,.55)"; x.fillRect(140, piso, W - 280, 4);
    let y = piso + 90;
    x.fillStyle = "#7af5e8"; x.font = F(800, 36);
    x.fillText(m.nombre ? `${m.nombre.toUpperCase()} ATERRIZÓ COMO…` : "ATERRIZASTE COMO…", W / 2, y);
    y += 110; x.font = F(900, 104); x.fillStyle = "#fff"; x.shadowColor = col; x.shadowBlur = 30;
    let nick = m.nick || ""; while (x.measureText(nick).width > 980 && parseInt(x.font) > 60) x.font = F(900, parseInt(x.font) - 6);
    x.fillText(nick, W / 2, y); x.shadowBlur = 0;
    y += 62; x.font = F(700, 36); x.fillStyle = "#c9cff0"; x.fillText(m.perfilTitle || "", W / 2, y);
    if (!pro && m.tiempo) { y += 56; x.font = F(800, 36); x.fillStyle = "#f7b928"; x.fillText(`⏱️ Lo hice en ${m.tiempo}`, W / 2, y); }
    if (pro && m.stats && m.stats.length) {
      y += 40;
      m.stats.slice(0, 3).forEach(st => {
        rr(x, 110, y, W - 220, 128, 26); x.fillStyle = "rgba(247,185,40,.10)"; x.fill(); x.strokeStyle = "rgba(247,185,40,.45)"; x.lineWidth = 2; x.stroke();
        x.textAlign = "left"; x.fillStyle = "#f7b928"; x.font = F(900, 70); x.fillText(st.big, 150, y + 90);
        const bw = x.measureText(st.big).width; x.fillStyle = "#fff"; x.font = F(700, 34);
        const ls2 = envolver(x, st.text, W - 300 - bw).slice(0, 2);
        ls2.forEach((l, i) => x.fillText(l, 180 + bw, y + (ls2.length === 1 ? 78 : 58 + i * 42)));
        x.textAlign = "center"; y += 148;
      });
    } else {
      y += 70; x.font = "italic " + F(700, 46); const ls2 = envolver(x, `«${m.frase || ""}»`, 860);
      const bh = ls2.length * 60 + 60; rr(x, 90, y, W - 180, bh, 30); x.fillStyle = "rgba(255,255,255,.07)"; x.fill(); x.strokeStyle = col; x.lineWidth = 3; x.stroke();
      x.fillStyle = "#fff"; ls2.forEach((l, i) => x.fillText(l, W / 2, y + 75 + i * 60)); y += bh;
    }
    const py = H - 230; rr(x, 170, py, W - 340, 104, 52); x.fillStyle = "#f7b928"; x.fill();
    x.fillStyle = "#1a1300"; x.font = F(900, 44); x.fillText("¿Y VOS QUÉ ALIEN SOS?", W / 2, py + 68);
    x.fillStyle = "#7af5e8"; x.font = F(800, 44); x.fillText("testpolitico.pages.dev", W / 2, H - 70);
    if (pro) {
      const gg = x.createLinearGradient(0, 0, W, H); gg.addColorStop(0, "#fff2b3"); gg.addColorStop(0.35, "#f7b928"); gg.addColorStop(0.7, "#b8860b"); gg.addColorStop(1, "#ffe27a");
      rr(x, 22, 22, W - 44, H - 44, 48); x.strokeStyle = gg; x.lineWidth = 16; x.stroke();
    }
    return c;
  }
 
  // Convierte la tarjeta en un archivo de imagen listo para compartir
  const aArchivo = c => {
    const url = c.toDataURL("image/png");
    const bin = atob(url.split(",")[1]), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: "image/png" });
    let file = null; try { file = new File([blob], "mi-alien.png", { type: "image/png" }); } catch (e) {}
    return { url, blob, file };
  };
  const puedeCompartir = f => { try { return !!(f && navigator.canShare && navigator.share && navigator.canShare({ files: [f] })); } catch (e) { return false; } };
  const textoCompartir = m => `Soy ${m.nick} 👽 ¿Y vos qué alien político sos? Jugalo acá: ${linkInvitacion()}`;
 
  // Plan B: muestra la imagen en grande para guardarla o compartirla con un toque nuevo
  function verTarjeta(t, texto) {
    let el = document.getElementById("tp-card-modal"); if (el) el.remove();
    const url = t.url;
    el = document.createElement("div"); el.id = "tp-card-modal";
    el.style.cssText = "position:fixed;inset:0;z-index:10000;background:#05061a;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:1rem;font-family:Inter,system-ui,sans-serif;color:#fff;text-align:center";
    const bt = "display:block;width:100%;max-width:380px;border:0;border-radius:12px;padding:.85rem;font-weight:800;font-size:1rem;cursor:pointer;margin:.35rem auto";
    el.innerHTML = `<img src="${url}" alt="Tu tarjeta" style="max-width:min(380px,92vw);max-height:68vh;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.6);margin:.5rem 0 .6rem">
      <p style="margin:.2rem 0 .6rem;font-size:.95rem;color:#fff">📱 <strong>Mantené apretada la imagen</strong> y elegí <strong>Guardar</strong> o <strong>Compartir</strong>.</p>
      ${puedeCompartir(t.file) ? `<button id="tp-cm-share" style="${bt};background:#f7b928;color:#1a1300">📲 Compartir</button>` : ""}
      <a href="${url}" download="mi-alien.png" style="${bt};background:#7af5e8;color:#06121a;text-decoration:none;box-sizing:border-box">⬇️ Descargar imagen</a>
      <button id="tp-cm-close" style="${bt};background:rgba(255,255,255,.14);color:#fff">Cerrar</button>`;
    document.body.appendChild(el);
    const sh = document.getElementById("tp-cm-share");
    if (sh) sh.onclick = () => navigator.share({ files: [t.file], text: texto }).catch(() => {});
    document.getElementById("tp-cm-close").onclick = () => el.remove();
  }
 
  // Tarjeta GRATIS: se arma apenas aparece el resultado, así al tocar el botón ya está lista
  let tarjetaLista = null, tarjetaPromesa = null;
  window.prepararTarjeta = function () {
    const m = mis(); tarjetaLista = null;
    if (!m || !m.perfilKey) { tarjetaPromesa = null; return null; }
    tarjetaPromesa = dibujarTarjeta(m, false).then(aArchivo).then(t => (tarjetaLista = t)).catch(e => { console.error(e); tarjetaPromesa = null; return null; });
    return tarjetaPromesa;
  };
  window.compartirAlien = async function () {
    const m = mis(); if (!m || !m.perfilKey) return;
    const texto = textoCompartir(m);
    if (tarjetaLista) { verTarjeta(tarjetaLista, texto); return; }
    const btns = document.querySelectorAll(".share-alien"), orig = [...btns].map(b => b.innerHTML);
    btns.forEach(b => { b.disabled = true; b.innerHTML = "⏳ Armando tu tarjeta…"; });
    try {
      const t = await conTope(tarjetaPromesa || prepararTarjeta(), 10000, null);
      if (t) verTarjeta(t, texto);
    } catch (e) { console.error(e); }
    finally { btns.forEach((b, i) => { b.disabled = false; b.innerHTML = orig[i]; }); }
  };
 
  // Tarjeta PRO (dentro del informe pago)
  let datosPro = [];
  window.tarjetaPro = async function () {
    const m = mis(); if (!m || !m.perfilKey) return;
    const b = document.getElementById("tp-pro-btn"); b.disabled = true; b.textContent = "⏳ Armando tu tarjeta…";
    const nombre = (document.getElementById("tp-pro-nombre").value || "").trim().slice(0, 18);
    try { verTarjeta(await aArchivo(await dibujarTarjeta({ ...m, nombre, stats: datosPro }, true)), textoCompartir(m)); }
    catch (e) { console.error(e); }
    finally { b.disabled = false; b.textContent = "⭐ Ver mi tarjeta PRO"; }
  };
 
  // =====================================================
  //  VOS VS. EL RESTO (comparación personal)
  // =====================================================
  const norm = s => String(s || "").split(" (")[0].trim();
  const nomE = s => norm(s) === "Ninguna" ? "“ninguna me convence”" : norm(s);
  function percentil(h, p) {
    if (!h || !h.length) return null;
    const b = Math.min(20, Math.floor(p / 5)), tot = h.reduce((a, c) => a + c, 0); if (!tot) return null;
    const abajo = h.slice(0, b).reduce((a, c) => a + c, 0);
    return Math.max(0, Math.min(99, Math.round(100 * (abajo + h[b] / 2) / tot)));
  }
  const fila = (ico, html) => `<div class="fila"><span>${ico}</span><div>${html}</div></div>`;
 
  function seccionYo(d) {
    const m = mis();
    datosPro = [];
    if (!m) return `<div class="card yo"><h3>🪞 Vos vs. el resto</h3><p class="muted" style="margin:0">Para ver tu comparación personal y tu tarjeta PRO, abrí este informe en el mismo celular o compu donde jugaste. Si todavía no jugaste, <a href="${location.pathname}">jugá acá</a> y después volvé con tu código.</p></div>`;
    const filas = [], trio = [];
    let pctMejor = null;
    if (m.pctA != null) {
      pctMejor = percentil(d.aciertosHist, m.pctA);
      let t = `Acertaste el <strong>${m.pctA}%</strong> de las frases (${m.aciertos} de ${m.nA}).`;
      if (d.promedioAciertos != null) t += ` El promedio de la gente es ${d.promedioAciertos}%.`;
      if (pctMejor != null) t += ` <strong>Te fue mejor que al ${pctMejor}%</strong> de las personas.`;
      filas.push(fila("🎯", t));
      if (pctMejor != null) trio.push(pctMejor >= 50 ? `<div class="kpi"><b>${pctMejor}%</b><span class="muted">acertó menos que vos</span></div>` : `<div class="kpi"><b>${100 - pctMejor}%</b><span class="muted">acertó más que vos</span></div>`);
    }
    let rareza = null, minoria = null, nMay = 0, nTemas = 0;
    if (m.stage === 2) {
      const pf = (d.perfiles || []).find(p => p[0] === m.perfilTitle);
      if (pf) {
        rareza = pf[1];
        filas.push(fila("👽", `Sacaste <strong>${esc(m.nick)}</strong>: lo sacó el <strong>${rareza}%</strong> de la gente.${rareza <= 12 ? " ¡Es de los alien más raros! 💎" : rareza >= 30 ? " Es de los más comunes." : ""}`));
        trio.push(`<div class="kpi"><b>${rareza}%</b><span class="muted">sacó tu mismo alien</span></div>`);
      }
      (m.chosenB || []).forEach(c => {
        const g = (d.ganadorPorTema || []).find(t => t.tema === c.topic); if (!g || !g.ranking.length) return;
        const mio = g.ranking.find(r => norm(r[0]) === norm(c.space)), pct = mio ? mio[1] : 0;
        const may = norm(g.ranking[0][0]) === norm(c.space);
        nTemas++; if (may) nMay++;
        if (!minoria || pct < minoria.pct) minoria = { tema: c.topic, pct };
        filas.push(`<div class="fila"><span class="tag ${may ? "may" : "min"}">${may ? "Mayoría" : "Minoría"}</span><div><strong>${esc(c.topic)}</strong>: elegiste ${esc(nomE(c.space))}, igual que el <strong>${pct}%</strong>.${may ? "" : ` Lo más elegido fue ${esc(nomE(g.ranking[0][0]))} (${g.ranking[0][1]}%).`}</div></div>`);
      });
      if (nTemas) trio.push(`<div class="kpi"><b>${nMay}/${nTemas}</b><span class="muted">temas en los que sos mayoría</span></div>`);
    } else {
      filas.push(fila("👽", `Terminá el Test 2 para ver qué tan raro es tu alien y en qué temas sos mayoría o minoría.`));
    }
    if (d.plan === "completo") {
      const grupo = (etq, valor, acs, rks, campo) => {
        const a = (acs || []).find(e => e[0] === valor), r = (rks || []).find(e => e[campo] === valor);
        if (!valor || (!a && !r)) return fila("📍", `${etq}: todavía no hay suficientes personas para comparar (hacen falta 5).`);
        let t = `<strong>${etq} (${esc(valor)})</strong>:`;
        if (a) t += ` aciertan en promedio el ${a[1]}%${m.pctA != null ? ` (vos, ${m.pctA}%)` : ""}.`;
        if (r) t += ` Su espacio más elegido es ${esc(nomE(r.ranking[0][0]))} (${r.ranking[0][1]}%)${m.topSpace ? (norm(m.topSpace) === norm(r.ranking[0][0]) ? ", igual que vos." : `; vos coincidiste más con ${esc(nomE(m.topSpace))}.`) : "."}`;
        return fila("📍", t);
      };
      filas.push(grupo("Gente de tu edad", m.edad, d.aciertosPorEdad, d.porEdad, "edad"));
      filas.push(grupo("Gente de tu provincia", m.provincia, d.aciertosPorProvincia, d.porProvincia, "provincia"));
    } else {
      filas.push(fila("🔒", `En el <strong>Informe Completo</strong>: tu comparación con gente de tu edad y de tu provincia.`));
    }
    let lect = "";
    if (nTemas) lect = lee(`Pensás como la mayoría en <strong>${nMay} de ${nTemas}</strong> temas.${minoria && minoria.pct < 50 ? ` Donde más te diferenciás es en <strong>${esc(minoria.tema)}</strong>: solo el ${minoria.pct}% eligió lo mismo que vos.` : ""}`);
    if (rareza != null) datosPro.push({ big: `${rareza}%`, text: `sacó este mismo alien${rareza <= 12 ? " · ¡de los más raros!" : ""}` });
    if (pctMejor != null && pctMejor >= 50) datosPro.push({ big: `${pctMejor}%`, text: "de la gente acertó menos frases que yo" });
    if (minoria) datosPro.push({ big: `${minoria.pct}%`, text: `pensó como yo en ${minoria.tema}` });
    if (datosPro.length < 3 && m.tiempo) datosPro.push({ big: m.tiempo, text: "tardé en descubrir mi alien ⏱️" });
    if (!datosPro.length && m.pctA != null) datosPro.push({ big: `${m.pctA}%`, text: "de frases acertadas a ciegas" });
    const proHtml = m.perfilKey ? `<div style="margin-top:1rem;border-top:1px solid rgba(255,255,255,.1);padding-top:1rem">
        <p style="margin:0 0 .5rem;font-weight:800">⭐ Tu tarjeta PRO</p>
        <p class="muted" style="margin:0 0 .5rem">Tu alien con tus datos, en diseño dorado, lista para historias o WhatsApp.</p>
        <input type="text" id="tp-pro-nombre" maxlength="18" placeholder="Tu nombre en la tarjeta (opcional)">
        <button class="btn" id="tp-pro-btn" onclick="tarjetaPro()">⭐ Ver mi tarjeta PRO</button></div>` : "";
    return `<div class="card yo"><h3>🪞 Vos vs. el resto</h3>${trio.length ? `<div class="trio">${trio.join("")}</div>` : ""}${lect}${filas.join("")}${proHtml}</div>`;
  }
 
  window.verInforme = function (codigo) {
    codigo = String(codigo || "").trim().toUpperCase();
    if (!codigo) return;
    abrir(`<h2>Tu informe</h2><p class="muted">Cargando…</p>`);
    api({ accion: "informe", codigo }).then(d => {
      if (d.error) { body(`<h2>Código no válido</h2><p class="muted">Revisá que esté bien escrito.</p><button class="btn" onclick="abrirEstadisticas()">Volver</button>`); return; }
      guardar(codigo);
      const n = d.total, grupos = (arr, titulo) => arr.map(g => `<div class="grupo"><p style="margin:0 0 .2rem;font-weight:700">${esc(g[titulo])} <span class="muted">(${g.n} personas)</span></p>${g.ranking.slice(0, 3).map(([k, p]) => bar(k === "Ninguna" ? "Ninguna me convence" : k, p)).join("")}</div>`).join("") || `<p class="muted">Todavía no hay suficientes respuestas.</p>`;
      let h = `
        <h2>Informe ${d.plan === "completo" ? "Completo" : "Resumen"}</h2>
        <p class="muted">Basado en ${n} personas · se actualiza solo a medida que más gente juega.</p>
        ${seccionYo(d)}
        ${metodo(d)}
        <div class="card"><h3>⭐ Los temas que más le importan a la gente</h3>${textoTemas(d)}${d.temas.map(([t, c]) => bar(t, Math.round(100 * c / (n || 1)))).join("")}</div>
        <div class="card"><h3>🧭 Qué postura gana en cada tema</h3>${textoPosturas(d)}${grupos(d.ganadorPorTema, "tema")}</div>
        <div class="card"><h3>🎂 Qué elige cada rango de edad</h3>${textoEdades(d)}${grupos(d.porEdad, "edad")}</div>`;
      if (d.plan === "completo") {
        h += `
        <div class="card"><h3>🤯 Las confusiones más comunes</h3><p class="muted">Frases de un referente que la gente le atribuyó a otro.</p>${textoConfusiones(d)}${(d.confusiones || []).map(([k, c]) => { const [era, dijo] = k.split(" → "); return `<p style="margin:.4rem 0">Frases de <strong>${esc(era)}</strong> que sonaron a <strong>${esc(dijo)}</strong>: ${c} veces</p>`; }).join("")}</div>
        <div class="card"><h3>🎯 ¿A quién se reconoce más?</h3><p class="muted">Porcentaje de aciertos según quién dijo la frase.</p>${textoAciertos(d)}${(d.aciertosPorReferente || []).map(([k, p, t]) => bar(k, p, t + " frases")).join("")}</div>
        <div class="card"><h3>🗳️ Qué espacio suma más adhesiones</h3><p class="muted">Con qué espacio coincidió más cada persona en el Test 2, sin ver nombres.</p>${textoEspacios(d)}${(d.espacios || []).map(([k, p]) => bar(k, p)).join("")}</div>
        <div class="card"><h3>🔄 Votan a uno, piensan como otro</h3><p class="muted">Según su voto habitual, con qué espacio coincidieron más a ciegas.</p>${textoVoto(d)}${grupos(d.votoVsIdeas || [], "voto")}</div>`;
      }
      h += conclusiones(d);
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
 
