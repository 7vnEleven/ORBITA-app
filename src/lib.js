// ============================================================
//  ORBITA · libreria condivisa (tema, helper, dati mappa)
// ============================================================
export const T = {
  ink: "#0B0D16", surface: "#141826", raised: "#1C2133", raised2: "#242B40",
  border: "#2C3450", borderSoft: "#222842", text: "#EEF1F8", muted: "#8B93A8",
  faint: "#5A6178", accent: "#6E8BFF", accentDeep: "#3D52CC", gold: "#FFC24B", ok: "#34D399",
};

export const CATEGORIES = ["Carrozzeria", "Falegnameria", "Nautica", "Industria", "Industria del legno", "Industria automobilistica", "Industria navale", "Marmo", "Acciaio"];
export const PAY_METHODS = ["Bonifico", "RIBA", "Assegno", "Rimessa diretta"];
export const TERMS_BY_METHOD = {
  "Bonifico": ["Anticipato", "Vista fattura", "30 giorni", "60 giorni", "90 giorni"],
  "RIBA": ["30 giorni", "60 giorni", "90 giorni"],
  "Assegno": ["Vista fattura"],
  "Rimessa diretta": ["Anticipato", "Vista fattura"],
};
export const isItaly = (p) => (p || "").trim().toLowerCase() === "italia";

export const ROLE_LABEL = { admin: "Titolare", manager: "Responsabile", agent: "Agente", packaging: "Imballaggio" };
export const ROLE_DESC = { admin: "Vede tutto · gestisce utenti", manager: "Vede tutti i clienti e gli ordini", agent: "Vede solo i clienti che segue", packaging: "Solo schede e prodotti · niente prezzi" };
export const seesAll = (u) => ["admin", "manager", "packaging"].includes(u?.role);
export const seesMoney = (u) => u?.role !== "packaging";
export const canManage = (u) => u?.role === "admin";
export const roleColor = (r) => (r === "admin" || r === "manager") ? T.gold : r === "packaging" ? T.ok : T.accent;
export const refAgent = (c) => c.agent_id || c.created_by;

export const eur = (n) => (Number(n) || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const eur2 = (n) => (Number(n) || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const inMonth = (iso) => { const d = new Date(iso), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); };
export const monthTotal = (c) => (c.orders || []).filter((o) => inMonth(o.date)).reduce((s, o) => s + (+o.amount || 0), 0);
export const yearTotal = (c) => (c.orders || []).filter((o) => new Date(o.date).getFullYear() === new Date().getFullYear()).reduce((s, o) => s + (+o.amount || 0), 0);
export const allTotal = (c) => (c.orders || []).reduce((s, o) => s + (+o.amount || 0), 0);
export const fmtDate = (iso) => new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
export const initials = (s) => (s || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
export const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// ---------- calendario ----------
export const apptVisited = (a) => !!a.done;
const pad2 = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const mapsUrl = (loc) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc || "")}`;
export const WD = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
export const MON = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
export function monthCells(year, month) {
  const first = new Date(year, month, 1); const startDay = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate(); const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function downloadICS(a) {
  const [y, m, d] = a.date.split("-"); const [hh, mm] = (a.time || "09:00").split(":");
  const start = `${y}${m}${d}T${pad2(hh)}${pad2(mm)}00`;
  const dt = new Date(`${a.date}T${a.time || "09:00"}:00`); const e = new Date(dt.getTime() + 3600000);
  const end = `${e.getFullYear()}${pad2(e.getMonth() + 1)}${pad2(e.getDate())}T${pad2(e.getHours())}${pad2(e.getMinutes())}00`;
  const esc = (s) => (s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, " ");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ORBITA//IT", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${a.id}@orbita`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${esc(a.title || "Appuntamento")}`,
    a.location ? `LOCATION:${esc(a.location)}` : "", a.notes ? `DESCRIPTION:${esc(a.notes)}` : "",
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Promemoria", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a"); link.href = url; link.download = `${(a.title || "appuntamento").replace(/[^\w-]/g, "_")}.ics`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ---------- mappa stilizzata Italia ----------
export const MAP_W = 384, MAP_H = 462, MAP_PAD = 18;
const LAT_HI = 47.15, LAT_LO = 36.5, LNG_LO = 6.55, LNG_HI = 18.55;
export const projXY = (lat, lng) => [MAP_PAD + ((lng - LNG_LO) / (LNG_HI - LNG_LO)) * (MAP_W - 2 * MAP_PAD), MAP_PAD + ((LAT_HI - lat) / (LAT_HI - LAT_LO)) * (MAP_H - 2 * MAP_PAD)];
export const ITALY = [
  [[43.78,7.53],[44.9,6.9],[45.2,6.8],[45.83,6.86],[45.98,7.66],[46.0,8.95],[46.45,10.0],[46.55,10.45],[46.99,11.5],[46.75,12.3],[46.5,13.58],[45.98,13.65],[45.65,13.77],[45.68,13.1],[45.44,12.34],[44.49,12.29],[44.06,12.57],[43.62,13.51],[42.65,14.0],[42.46,14.21],[42.05,14.71],[41.9,15.9],[41.62,16.0],[41.13,16.87],[40.63,17.94],[40.35,18.17],[39.81,18.38],[40.14,17.98],[40.47,17.24],[40.14,16.6],[39.9,16.55],[39.08,17.12],[38.91,16.59],[38.44,16.58],[38.11,15.65],[38.7,15.9],[39.37,16.23],[40.03,15.28],[40.68,14.76],[40.85,14.27],[41.07,13.94],[41.22,13.57],[41.45,12.9],[41.73,12.28],[42.09,11.79],[42.44,11.15],[43.55,10.31],[44.1,9.83],[44.31,9.21],[44.41,8.93],[43.9,8.02]],
  [[38.19,15.55],[38.13,13.36],[38.02,12.51],[37.8,12.44],[37.51,13.08],[37.31,13.58],[37.07,14.24],[36.72,14.83],[37.07,15.29],[37.51,15.09],[37.92,15.3]],
  [[41.2,9.2],[40.92,9.52],[39.93,9.66],[39.22,9.12],[39.17,8.52],[39.9,8.59],[40.56,8.32],[40.94,8.23],[41.1,9.0]],
];
export const CITY = { "torino":[45.07,7.69],"milano":[45.46,9.19],"genova":[44.41,8.93],"bologna":[44.49,11.34],"firenze":[43.77,11.26],"roma":[41.9,12.5],"napoli":[40.85,14.27],"bari":[41.12,16.87],"palermo":[38.12,13.36],"cagliari":[39.22,9.12],"venezia":[45.44,12.34],"verona":[45.44,10.99],"padova":[45.41,11.88],"vicenza":[45.55,11.55],"treviso":[45.67,12.24],"trieste":[45.65,13.77],"udine":[46.06,13.24],"trento":[46.07,11.12],"bolzano":[46.5,11.35],"brescia":[45.54,10.22],"bergamo":[45.7,9.67],"como":[45.81,9.09],"monza":[45.58,9.27],"pavia":[45.19,9.16],"cremona":[45.13,10.02],"mantova":[45.16,10.79],"varese":[45.82,8.83],"novara":[45.45,8.62],"alessandria":[44.91,8.62],"asti":[44.9,8.21],"cuneo":[44.39,7.55],"piacenza":[45.05,9.69],"parma":[44.8,10.33],"reggio emilia":[44.7,10.63],"modena":[44.65,10.93],"ferrara":[44.84,11.62],"ravenna":[44.42,12.2],"forlì":[44.22,12.04],"cesena":[44.14,12.24],"rimini":[44.06,12.57],"ancona":[43.62,13.51],"pesaro":[43.91,12.91],"perugia":[43.11,12.39],"terni":[42.56,12.65],"pisa":[43.72,10.4],"livorno":[43.55,10.31],"lucca":[43.84,10.5],"prato":[43.88,11.1],"pistoia":[43.93,10.92],"arezzo":[43.46,11.88],"siena":[43.32,11.33],"grosseto":[42.76,11.11],"latina":[41.47,12.9],"frosinone":[41.64,13.35],"viterbo":[42.42,12.1],"l'aquila":[42.35,13.4],"pescara":[42.46,14.21],"chieti":[42.35,14.17],"teramo":[42.66,13.7],"campobasso":[41.56,14.66],"caserta":[41.07,14.33],"salerno":[40.68,14.76],"avellino":[40.91,14.79],"benevento":[41.13,14.78],"foggia":[41.46,15.55],"andria":[41.23,16.29],"barletta":[41.32,16.28],"trani":[41.28,16.42],"brindisi":[40.63,17.94],"lecce":[40.35,18.17],"taranto":[40.47,17.24],"potenza":[40.64,15.81],"matera":[40.67,16.6],"cosenza":[39.3,16.25],"catanzaro":[38.91,16.59],"reggio calabria":[38.11,15.65],"crotone":[39.08,17.12],"vibo valentia":[38.68,16.1],"messina":[38.19,15.55],"catania":[37.51,15.09],"siracusa":[37.07,15.29],"ragusa":[36.93,14.73],"agrigento":[37.31,13.58],"caltanissetta":[37.49,14.06],"enna":[37.57,14.28],"trapani":[38.02,12.51],"sassari":[40.73,8.56],"nuoro":[40.32,9.33],"oristano":[39.9,8.59],"olbia":[40.92,9.5],"aosta":[45.74,7.32],"savona":[44.31,8.48],"imperia":[43.89,8.03],"la spezia":[44.1,9.83],"lodi":[45.31,9.5],"lecco":[45.85,9.39],"sondrio":[46.17,9.87],"belluno":[46.14,12.22],"rovigo":[45.07,11.79],"pordenone":[45.96,12.66],"gorizia":[45.94,13.62],"macerata":[43.3,13.45],"ascoli piceno":[42.85,13.58],"fermo":[43.16,13.72],"massa":[44.04,10.14],"carrara":[44.08,10.1],"rieti":[42.4,12.86],"bressanone":[46.72,11.66],"brunico":[46.8,11.94],"merano":[46.67,11.16],"laives":[46.42,11.34],"vipiteno":[46.9,11.43],"chiusa":[46.64,11.57],"egna":[46.32,11.27],"appiano":[46.46,11.25],"caldaro":[46.41,11.24],"silandro":[46.63,10.77],"malles":[46.69,10.55],"san candido":[46.73,12.28],"dobbiaco":[46.73,12.22],"rovereto":[45.89,11.04],"riva del garda":[45.88,10.84],"arco":[45.92,10.89],"pergine":[46.06,11.24],"cles":[46.36,11.03],"mori":[45.85,10.98],"levico":[46.01,11.3],"borgo valsugana":[46.05,11.45],"mezzolombardo":[46.21,11.09],"tione":[46.03,10.72],"predazzo":[46.31,11.6],"cavalese":[46.29,11.46],"conegliano":[45.89,12.3],"castelfranco veneto":[45.67,11.93],"bassano del grappa":[45.77,11.73],"montebelluna":[45.78,12.05],"schio":[45.71,11.36],"thiene":[45.71,11.48],"arzignano":[45.52,11.34],"legnago":[45.19,11.31],"san bonifacio":[45.4,11.27],"chioggia":[45.22,12.28],"mestre":[45.49,12.24],"portogruaro":[45.78,12.84],"san donà di piave":[45.63,12.57],"jesolo":[45.53,12.64],"mira":[45.44,12.13],"villafranca":[45.35,10.85],"peschiera del garda":[45.44,10.69],"valdagno":[45.65,11.3],"marostica":[45.75,11.66],"cittadella":[45.65,11.78],"este":[45.23,11.66],"monselice":[45.24,11.75],"vittorio veneto":[45.99,12.3],"oderzo":[45.78,12.49],"cinisello balsamo":[45.55,9.22],"sesto san giovanni":[45.53,9.24],"rho":[45.53,9.04],"legnano":[45.6,8.92],"busto arsizio":[45.61,8.85],"gallarate":[45.66,8.79],"saronno":[45.63,9.03],"seregno":[45.65,9.2],"desio":[45.62,9.21],"vimercate":[45.61,9.37],"gorgonzola":[45.53,9.4],"treviglio":[45.52,9.59],"crema":[45.36,9.69],"voghera":[44.99,9.01],"vigevano":[45.31,8.86],"abbiategrasso":[45.4,8.92],"melzo":[45.5,9.42],"cologno monzese":[45.53,9.28],"lissone":[45.61,9.24],"meda":[45.66,9.15],"cantù":[45.74,9.13],"erba":[45.81,9.22],"merate":[45.69,9.42],"desenzano":[45.47,10.54],"montichiari":[45.41,10.39],"carpi":[44.78,10.88],"sassuolo":[44.55,10.78],"imola":[44.35,11.71],"faenza":[44.29,11.88],"lugo":[44.42,11.91],"mirandola":[44.89,11.07],"fidenza":[44.87,10.06],"empoli":[43.72,10.95],"pontedera":[43.66,10.63],"viareggio":[43.87,10.25],"foligno":[42.95,12.7],"assisi":[43.07,12.62],"aversa":[40.97,14.21],"nola":[40.93,14.53],"pompei":[40.75,14.5],"battipaglia":[40.61,14.98],"altamura":[40.83,16.55],"molfetta":[41.2,16.6],"monopoli":[40.95,17.3],"fasano":[40.84,17.36],"manfredonia":[41.63,15.92],"martina franca":[40.7,17.34],"ostuni":[40.73,17.58],"lamezia terme":[38.97,16.31],"rende":[39.33,16.18],"marsala":[37.8,12.44],"gela":[37.07,14.24],"modica":[36.86,14.77],"acireale":[37.61,15.17],"milazzo":[38.22,15.24],"carbonia":[39.17,8.52],"alghero":[40.56,8.32],"biella":[45.57,8.05],"ivrea":[45.47,7.88],"moncalieri":[45.0,7.68],"rivoli":[45.07,7.52],"pinerolo":[44.89,7.33],"casale monferrato":[45.13,8.45],"tortona":[44.9,8.86],"verbania":[45.92,8.55],"domodossola":[46.12,8.29],"sanremo":[43.82,7.78],"ventimiglia":[43.79,7.61],"chiavari":[44.32,9.32],"sarzana":[44.11,9.96] };
export const CAP_ZONE = { "00":[41.9,12.5],"01":[42.42,12.1],"02":[42.4,12.86],"03":[41.64,13.35],"04":[41.47,12.9],"05":[42.56,12.65],"06":[43.11,12.39],"07":[40.73,8.56],"08":[40.32,9.33],"09":[39.22,9.12],"10":[45.07,7.69],"11":[45.74,7.32],"12":[44.39,7.55],"13":[45.32,8.42],"14":[44.9,8.21],"15":[44.91,8.62],"16":[44.41,8.93],"17":[44.31,8.48],"18":[43.89,8.03],"19":[44.1,9.83],"20":[45.46,9.19],"21":[45.82,8.83],"22":[45.81,9.09],"23":[46.17,9.87],"24":[45.7,9.67],"25":[45.54,10.22],"26":[45.13,10.02],"27":[45.19,9.16],"28":[45.45,8.62],"29":[45.05,9.69],"30":[45.44,12.34],"31":[45.67,12.24],"32":[46.14,12.22],"33":[46.06,13.24],"34":[45.65,13.77],"35":[45.41,11.88],"36":[45.55,11.55],"37":[45.44,10.99],"38":[46.07,11.12],"39":[46.5,11.35],"40":[44.49,11.34],"41":[44.65,10.93],"42":[44.7,10.63],"43":[44.8,10.33],"44":[44.84,11.62],"45":[45.07,11.79],"46":[45.16,10.79],"47":[44.06,12.57],"48":[44.42,12.2],"50":[43.77,11.26],"51":[43.93,10.92],"52":[43.46,11.88],"53":[43.32,11.33],"54":[44.04,10.14],"55":[43.84,10.5],"56":[43.72,10.4],"57":[43.55,10.31],"58":[42.76,11.11],"59":[43.88,11.1],"60":[43.62,13.51],"61":[43.91,12.91],"62":[43.3,13.45],"63":[42.85,13.58],"64":[42.66,13.7],"65":[42.46,14.21],"66":[42.35,14.17],"67":[42.35,13.4],"70":[41.12,16.87],"71":[41.46,15.55],"72":[40.63,17.94],"73":[40.35,18.17],"74":[40.47,17.24],"75":[40.67,16.6],"76":[41.23,16.29],"80":[40.85,14.27],"81":[41.07,14.33],"82":[41.13,14.78],"83":[40.91,14.79],"84":[40.68,14.76],"85":[40.64,15.81],"86":[41.56,14.66],"87":[39.3,16.25],"88":[38.91,16.59],"89":[38.11,15.65],"90":[38.12,13.36],"91":[38.02,12.51],"92":[37.31,13.58],"93":[37.49,14.06],"94":[37.57,14.28],"95":[37.51,15.09],"96":[37.07,15.29],"97":[36.93,14.73],"98":[38.19,15.55] };
const CITY_KEYS = Object.keys(CITY).sort((a, b) => b.length - a.length);
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const capCity = (s) => s.replace(/\b\w/g, (m) => m.toUpperCase());
function matchCity(txt) {
  if (!txt) return null;
  const s = norm(txt);
  let best = null, bestIdx = -1, bestLen = 0;
  for (const k of CITY_KEYS) {
    const nk = norm(k);
    const re = new RegExp("(^|[^a-z])" + nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "g");
    let m, idx = -1; while ((m = re.exec(s))) { idx = m.index + m[1].length; }
    if (idx >= 0 && (idx > bestIdx || (idx === bestIdx && nk.length > bestLen))) { best = k; bestIdx = idx; bestLen = nk.length; }
  }
  return best;
}
const capOf = (t) => { const m = (t || "").match(/\b(\d{5})\b/); return m ? m[1] : null; };
function townLabel(t) { const parts = (t || "").split(",").map((s) => s.trim()).filter(Boolean); let c = parts.length ? parts[parts.length - 1] : (t || ""); return c.replace(/\b\d{5}\b/g, "").replace(/\bitalia\b/ig, "").replace(/\(.*?\)/g, "").trim(); }
function resolvePlace(text, cap) {
  const k = matchCity(text);
  if (k) return { key: k, label: capCity(k), ll: CITY[k] };
  const code = (cap && /^\d{5}$/.test(String(cap).trim())) ? String(cap).trim() : capOf(text);
  if (code) { const z = CAP_ZONE[code.slice(0, 2)]; if (z) { const lbl = townLabel(text) || ("CAP " + code); return { key: "z" + code + lbl.toLowerCase(), label: lbl, ll: z, approx: true }; } }
  return null;
}
export function agentPlaces(agentId, appts, customers = []) {
  const V = {}, D = {}, unmatched = [];
  const put = (bag, r) => { const e = bag[r.key] || { name: r.label, ll: r.ll, count: 0, approx: r.approx }; e.count++; bag[r.key] = e; };
  appts.filter((a) => a.agent_id === agentId).forEach((a) => {
    const cust = a.customer_id ? customers.find((c) => c.id === a.customer_id) : null;
    const text = a.location || a.prospect_address || (cust && cust.address) || "";
    const cap = (cust && cust.cap) || "";
    const r = resolvePlace(text, cap);
    if (r) put(apptVisited(a) ? V : D, r);
    else { const label = (text || a.title || "").trim(); if (label) unmatched.push(label); }
  });
  const toArr = (o) => Object.values(o).sort((a, b) => b.count - a.count);
  return { visited: toArr(V), todo: toArr(D), unmatched };
}
