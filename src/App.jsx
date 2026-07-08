import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LogIn, LogOut, Search, Plus, X, ChevronRight, ChevronLeft, Users, User, Phone, Mail,
  MapPin, FileText, Trash2, Shield, Pencil, BarChart3, Building2, Receipt, Crown, Save,
  Calendar, Clock, Hash, Tag, CalendarDays, Navigation, Map, LayoutGrid, Loader2, KeyRound, ArrowDownUp,
} from "lucide-react";
import { supabase } from "./supabase.js";
import {
  T, CATEGORIES, PAY_METHODS, TERMS_BY_METHOD, isItaly, ROLE_LABEL, ROLE_DESC,
  seesAll, seesMoney, canManage, roleColor, refAgent, eur, eur2, monthTotal, yearTotal, allTotal,
  fmtDate, initials, uid, apptVisited, ymd, mapsUrl, WD, MON, monthCells, downloadICS,
  MAP_W, MAP_H, projXY, ITALY, agentPlaces, capCity,
} from "./lib.js";

/* ---------------- atoms ---------------- */
const inputStyle = { width: "100%", background: T.ink, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 12px", color: T.text, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const Eyebrow = ({ children, color = T.accent }) => <div style={{ color, fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>{children}</div>;
function Avatar({ name, size = 40, color = T.accent, round, src }) {
  if (src) return <img src={src} alt={name || ""} style={{ width: size, height: size, borderRadius: round ? "50%" : 11, flexShrink: 0, objectFit: "cover", display: "block" }} />;
  return <div style={{ width: size, height: size, borderRadius: round ? "50%" : 11, flexShrink: 0, background: `linear-gradient(135deg, ${color}, ${T.accentDeep})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: size * 0.36 }}>{initials(name)}</div>;
}
function Logo({ size = 30 }) {
  return <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 50% 45%, ${T.accent}, ${T.accentDeep})` }} />
    <div style={{ position: "absolute", inset: size * 0.18, borderRadius: "50%", background: T.ink }} />
    <div style={{ position: "absolute", inset: size * 0.30, borderRadius: "50%", background: `linear-gradient(135deg, ${T.gold}, #E8962B)` }} />
  </div>;
}
function Btn({ children, onClick, disabled, color = T.accent, ghost, full }) {
  return <button onClick={onClick} disabled={disabled} style={{ width: full ? "100%" : undefined, border: ghost ? `1px solid ${T.border}` : "none", cursor: disabled ? "default" : "pointer", background: ghost ? "transparent" : (disabled ? T.raised2 : `linear-gradient(135deg, ${color}, ${T.accentDeep})`), color: ghost ? T.text : (disabled ? T.faint : "#fff"), fontWeight: 700, fontSize: 14.5, padding: "11px 16px", borderRadius: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap" }}>{children}</button>;
}
function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", textarea }) {
  return <label style={{ display: "block" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>{Icon && <Icon size={13} color={T.faint} />}<span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: T.muted }}>{label}</span></div>
    {textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: "vertical" }} /> : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} style={inputStyle} />}
  </label>;
}
const Chip = ({ children, href, as = "div" }) => { const Tag = as; return <Tag href={href} target={href ? "_blank" : undefined} rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surface, border: `1px solid ${T.borderSoft}`, borderRadius: 9, padding: "7px 11px", fontSize: 13, color: T.muted, textDecoration: "none" }}>{children}</Tag>; };
const Empty = ({ icon: Icon, title, sub }) => <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}><Icon size={36} color={T.faint} style={{ marginBottom: 10 }} /><div style={{ fontWeight: 700, color: T.text, marginBottom: 3 }}>{title}</div><div style={{ fontSize: 13.5 }}>{sub}</div></div>;
const Chips = ({ options, value, onChange, activeColor = T.accent, activeText = "#fff" }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {options.map((o) => <button key={o} onClick={() => onChange(o)} style={{ padding: "9px 13px", borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: "pointer", background: value === o ? activeColor : T.surface, color: value === o ? activeText : T.muted, border: `1px solid ${value === o ? activeColor : T.border}` }}>{o}</button>)}
  </div>
);
function Modal({ title, children, onClose, wide }) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.65)" }} />
    <div style={{ position: "relative", width: "100%", maxWidth: wide ? 720 : 460, maxHeight: "90vh", overflowY: "auto", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 19 }}>{title}</div>
        <button onClick={onClose} style={{ background: T.raised2, border: "none", borderRadius: 9, padding: 8, cursor: "pointer" }}><X size={18} color={T.muted} /></button>
      </div>
      {children}
    </div>
  </div>;
}
function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < 820 : false);
  useEffect(() => { const f = () => setM(window.innerWidth < 820); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return m;
}
const nameFrom = (profiles, id) => profiles.find((u) => u.id === id)?.name || "—";

/* ============================================================ LOGIN */
function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) setErr("Email o password non corretti.");
    setBusy(false);
  };
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ width: "100%", maxWidth: 380, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 30 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, gap: 10 }}>
        <Logo size={44} />
        <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 4 }}>ORBITA</div>
        <Eyebrow>Gestione clienti</Eyebrow>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onKeyDown={(e) => { if (e.key === "Enter" && email && pw && !busy) submit(); }}>
        <Field icon={Mail} label="Email" value={email} onChange={setEmail} placeholder="tu@azienda.com" type="email" />
        <Field icon={KeyRound} label="Password" value={pw} onChange={setPw} placeholder="••••••••" type="password" />
        {err && <div style={{ color: "#ef6464", fontSize: 13, textAlign: "center" }}>{err}</div>}
        <Btn full disabled={busy || !email || !pw} onClick={submit}>{busy ? <Loader2 size={18} className="spin" /> : <><LogIn size={18} /> Entra</>}</Btn>
      </div>
    </div>
  </div>;
}

/* ============================================================ CLIENTI */
function Clienti({ me, customers, profiles, onOpen, onNew, isMobile }) {
  const money = seesMoney(me);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(money ? "fatturato" : "az");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const l = !s ? customers : customers.filter((c) => [c.name, c.code, c.vat, c.category].some((f) => (f || "").toLowerCase().includes(s)));
    return [...l].sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : monthTotal(b) - monthTotal(a));
  }, [customers, q, sort]);
  const totM = customers.reduce((s, c) => s + monthTotal(c), 0), totY = customers.reduce((s, c) => s + yearTotal(c), 0);

  return <div style={{ padding: isMobile ? "16px 14px 90px" : "26px 30px 40px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div><div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900 }}>Clienti</div><div style={{ color: T.muted, fontSize: 14, marginTop: 2 }}>{customers.length} schede</div></div>
      {money && <div style={{ display: "flex", gap: 12 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.gold}`, borderRadius: 14, padding: "12px 14px" }}><Eyebrow color={T.gold}>Mese</Eyebrow><div style={{ fontWeight: 900, fontSize: 20, color: T.gold }}>{eur(totM)}</div></div>
        {!isMobile && <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px" }}><Eyebrow color={T.muted}>Anno</Eyebrow><div style={{ fontWeight: 900, fontSize: 20 }}>{eur(totY)}</div></div>}
      </div>}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
      <div style={{ flex: 1, maxWidth: 460, display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 12px" }}>
        <Search size={17} color={T.faint} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca…" style={{ flex: 1, background: "none", border: "none", outline: "none", color: T.text, fontSize: 15, fontFamily: "inherit" }} />
      </div>
      {money && <button onClick={() => setSort((m) => m === "az" ? "fatturato" : "az")} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 12px", cursor: "pointer", color: T.muted, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><ArrowDownUp size={15} color={sort === "az" ? T.muted : T.gold} /> {sort === "az" ? "A–Z" : "Fatt."}</button>}
      {!isMobile && <div style={{ flex: 1 }} />}
      {me.role !== "packaging" && <Btn onClick={onNew}><Plus size={17} /> {isMobile ? "" : "Nuovo cliente"}</Btn>}
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      {rows.length === 0 ? <Empty icon={Building2} title={q ? "Nessun risultato" : "Ancora nessun cliente"} sub={q ? "Prova un'altra ricerca." : "Crea la prima scheda."} />
        : rows.map((c) => <div key={c.id} onClick={() => onOpen(c.id)} className="rowh" style={{ display: "flex", gap: 12, padding: "12px 14px", borderBottom: `1px solid ${T.borderSoft}`, cursor: "pointer", alignItems: "center" }}>
          <Avatar name={c.name} src={c.avatar} size={40} round />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ color: T.faint, fontSize: 12.5 }}>{[c.code ? "#" + c.code : "", c.category].filter(Boolean).join(" · ") || "—"}</div>
          </div>
          {money && <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, color: monthTotal(c) > 0 ? T.gold : T.faint, fontSize: 14 }}>{eur(monthTotal(c))}</div><div style={{ color: T.faint, fontSize: 11 }}>mese</div></div>}
          <ChevronRight size={16} color={T.faint} />
        </div>)}
    </div>
  </div>;
}

/* ============================================================ DETTAGLIO CLIENTE */
function Detail({ me, customer, profiles, onBack, onEdit, onDelete, onSave, isMobile }) {
  const money = seesMoney(me);
  const canEdit = me.role === "admin" || me.can_edit || customer.created_by === me.id;
  const orders = [...(customer.orders || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [orderCtx, setOrderCtx] = useState(null);
  const saveOrder = (o) => {
    const list = customer.orders || [];
    const next = list.some((x) => x.id === o.id) ? list.map((x) => x.id === o.id ? o : x) : [...list, o];
    onSave({ ...customer, orders: next }); setOrderCtx(null);
  };
  const delOrder = (id) => { onSave({ ...customer, orders: (customer.orders || []).filter((o) => o.id !== id) }); setOrderCtx(null); };

  return <div style={{ padding: isMobile ? "14px 14px 90px" : "22px 30px 40px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px", cursor: "pointer", color: T.text, fontSize: 13.5, fontWeight: 700 }}>← Clienti</button>
      <div style={{ display: "flex", gap: 8 }}>
        {canEdit && <Btn ghost onClick={() => onEdit(customer.id)}><Pencil size={15} color={T.accent} /> Modifica</Btn>}
        {canEdit && <button onClick={() => onDelete(customer.id)} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, padding: 10, cursor: "pointer" }}><Trash2 size={16} color={T.faint} /></button>}
      </div>
    </div>
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ width: isMobile ? "100%" : 300, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 }}>
          <Avatar name={customer.name} src={customer.avatar} size={80} round />
          <div style={{ fontWeight: 900, fontSize: 19, marginTop: 12 }}>{customer.name}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 5, flexWrap: "wrap" }}>
            {customer.code && <span style={{ fontWeight: 700, fontSize: 13 }}>#{customer.code}</span>}
            {customer.category && <span style={{ fontWeight: 700, fontSize: 13, color: T.accent }}>{customer.category}</span>}
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
          <Chip><Shield size={13} color={T.gold} /> Agente: {nameFrom(profiles, refAgent(customer))}</Chip>
          {customer.contact && <Chip><User size={13} /> Ref: {customer.contact}</Chip>}
          {customer.phone && <Chip as="a" href={`tel:${customer.phone}`}><Phone size={13} /> {customer.phone}</Chip>}
          {customer.email_referente && <Chip as="a" href={`mailto:${customer.email_referente}`}><Mail size={13} /> Ref: {customer.email_referente}</Chip>}
          {customer.email && <Chip as="a" href={`mailto:${customer.email}`}><Mail size={13} /> {customer.email}</Chip>}
          {customer.email_fatture && <Chip as="a" href={`mailto:${customer.email_fatture}`}><Receipt size={13} color={T.gold} /> Fatture: {customer.email_fatture}</Chip>}
          {customer.vat && <Chip><Hash size={13} /> P.IVA {customer.vat}</Chip>}
          {customer.cf && <Chip><Hash size={13} /> CF {customer.cf}</Chip>}
          {(customer.address || customer.cap) && <Chip><MapPin size={13} /> {[customer.address, customer.cap, !isItaly(customer.paese) ? customer.paese : ""].filter(Boolean).join(", ")}</Chip>}
          {customer.iban && <Chip><Receipt size={13} /> IBAN {customer.iban}</Chip>}
          {customer.pay_method && <Chip><Receipt size={13} color={T.gold} /> {customer.pay_method}{customer.pay_term ? ` · ${customer.pay_term}` : ""}</Chip>}
          {customer.notes && <div style={{ background: T.surface, border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: 12, color: T.muted, fontSize: 13.5, lineHeight: 1.5 }}>{customer.notes}</div>}
        </div>
      </div>
      {money && <div style={{ flex: 1, minWidth: isMobile ? "100%" : 320 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[["Questo mese", monthTotal(customer), T.gold], [`Anno`, yearTotal(customer), T.gold], ["Storico", allTotal(customer), T.text]].map(([l, v, col]) =>
            <div key={l} style={{ background: T.surface, border: `1px solid ${col === T.gold ? T.gold : T.border}`, borderRadius: 14, padding: "12px 16px", flex: 1, minWidth: 100 }}><Eyebrow color={col === T.gold ? T.gold : T.muted}>{l}</Eyebrow><div style={{ fontWeight: 900, fontSize: 22, color: col }}>{eur(v)}</div></div>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Eyebrow>Ordini ({orders.length})</Eyebrow>
          {canEdit && <Btn color={T.gold} onClick={() => setOrderCtx({})}><Plus size={16} /> Ordine</Btn>}
        </div>
        {orders.length === 0 ? <Empty icon={Receipt} title="Nessun ordine" sub="Aggiungi il primo ordine." />
          : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{orders.map((o) => <div key={o.id} onClick={canEdit ? () => setOrderCtx(o) : undefined} style={{ display: "flex", gap: 12, alignItems: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, cursor: canEdit ? "pointer" : "default" }}>
            <div style={{ width: 40, height: 40, borderRadius: 9, background: T.raised2, display: "flex", alignItems: "center", justifyContent: "center" }}><Receipt size={18} color={T.faint} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ color: T.muted, fontSize: 12.5 }}>{fmtDate(o.date)}</div>{o.note && <div style={{ fontSize: 14 }}>{o.note}</div>}</div>
            <div style={{ fontWeight: 900, fontSize: 17, color: T.gold }}>{eur2(o.amount)}</div>
          </div>)}</div>}
      </div>}
    </div>
    {orderCtx && <OrderModal existing={orderCtx.id ? orderCtx : null} onClose={() => setOrderCtx(null)} onSave={saveOrder} onDelete={() => delOrder(orderCtx.id)} />}
  </div>;
}

function OrderModal({ existing, onClose, onSave, onDelete }) {
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [date, setDate] = useState((existing ? new Date(existing.date) : new Date()).toISOString().slice(0, 10));
  const [note, setNote] = useState(existing?.note || "");
  const save = () => { if (!(+amount > 0)) return; onSave({ id: existing?.id || uid("o"), amount: +amount, date: new Date(date).toISOString(), note: note.trim() }); };
  return <Modal title={existing ? "Modifica ordine" : "Nuovo ordine"} onClose={onClose}>
    <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Importo €</div><input value={amount} autoFocus onChange={(e) => setAmount(e.target.value.replace(",", "."))} placeholder="0,00" type="number" style={{ ...inputStyle, fontSize: 26, fontWeight: 900, color: T.gold }} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
      <Field icon={Calendar} label="Data" value={date} onChange={setDate} type="date" />
      <Field icon={FileText} label="Rif." value={note} onChange={setNote} placeholder="DDT / nota" />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      {existing ? <Btn ghost onClick={onDelete}><Trash2 size={15} color="#ef6464" /> <span style={{ color: "#ef6464" }}>Elimina</span></Btn> : <span />}
      <Btn color={T.gold} onClick={save} disabled={!(+amount > 0)}><Save size={16} /> Salva</Btn>
    </div>
  </Modal>;
}

/* ============================================================ RITAGLIO FOTO */
function CropModal({ url, onCancel, onConfirm }) {
  const V = 288, OUT = 640;
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const drag = useRef(null);
  const base = img ? V / Math.max(img.width, img.height) : 1; // "contieni" tutta la foto
  const disp = base * zoom;
  const dispW = img ? img.width * disp : V, dispH = img ? img.height * disp : V;
  const clamp = (o) => {
    const minX = Math.min(0, V - dispW), maxX = Math.max(0, V - dispW);
    const minY = Math.min(0, V - dispH), maxY = Math.max(0, V - dispH);
    return { x: Math.min(maxX, Math.max(minX, o.x)), y: Math.min(maxY, Math.max(minY, o.y)) };
  };
  useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.src = url; }, [url]);
  useEffect(() => { if (img) setOff(clamp({ x: (V - dispW) / 2, y: (V - dispH) / 2 })); }, [img]);
  useEffect(() => { setOff((o) => clamp(o)); }, [zoom]);
  const down = (e) => { const p = pt(e); drag.current = { x: p.x - off.x, y: p.y - off.y }; };
  const moveH = (e) => { if (!drag.current) return; const p = pt(e); setOff(clamp({ x: p.x - drag.current.x, y: p.y - drag.current.y })); };
  const up = () => { drag.current = null; };
  const pt = (e) => ({ x: e.clientX, y: e.clientY });
  const confirm = () => {
    if (!img) return; setBusy(true);
    const c = document.createElement("canvas"); c.width = OUT; c.height = OUT;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, OUT, OUT);
    const sx = -off.x / disp, sy = -off.y / disp, s = V / disp;
    ctx.drawImage(img, sx, sy, s, s, 0, 0, OUT, OUT);
    c.toBlob((b) => { setBusy(false); onConfirm(b); }, "image/jpeg", 0.85);
  };
  return <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.75)" }} />
    <div style={{ position: "relative", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20, width: "100%", maxWidth: 360 }}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Ritaglia foto</div>
      <div style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Trascina per spostare · usa il cursore per ingrandire</div>
      <div onPointerDown={down} onPointerMove={moveH} onPointerUp={up} onPointerLeave={up}
        style={{ width: V, height: V, margin: "0 auto", position: "relative", overflow: "hidden", borderRadius: "50%", background: "#ffffff", cursor: "grab", touchAction: "none", border: `2px solid ${T.border}` }}>
        {img && <img src={url} draggable={false} style={{ position: "absolute", left: off.x, top: off.y, width: dispW, height: dispH, maxWidth: "none", userSelect: "none", pointerEvents: "none" }} />}
      </div>
      <input type="range" min="1" max="5" step="0.01" value={zoom} onChange={(e) => setZoom(+e.target.value)} style={{ width: "100%", marginTop: 16, accentColor: T.accent }} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
        <Btn ghost onClick={onCancel}>Annulla</Btn>
        <Btn onClick={confirm} disabled={busy || !img}>{busy ? <Loader2 size={16} className="spin" /> : <><Save size={16} /> Usa foto</>}</Btn>
      </div>
    </div>
  </div>;
}

/* ============================================================ FORM CLIENTE */
function CustomerForm({ me, existing, profiles, onClose, onSave }) {
  const isEdit = !!existing;
  const draftKey = `orbita:draft:cliente:${existing?.id || "nuovo"}`;
  const blank = {
    name: existing?.name || "", code: existing?.code || "", category: existing?.category || "",
    contact: existing?.contact || "", phone: existing?.phone || "", vat: existing?.vat || "",
    cf: existing?.cf || "", iban: existing?.iban || "", email: existing?.email || "",
    email_referente: existing?.email_referente || "", email_fatture: existing?.email_fatture || "",
    address: existing?.address || "", paese: existing?.paese || "Italia", cap: existing?.cap || "",
    pay_method: existing?.pay_method || "", pay_term: existing?.pay_term || "", notes: existing?.notes || "",
    agent_id: existing?.agent_id || existing?.created_by || (me.role === "agent" ? me.id : ""),
    avatar: existing?.avatar || "",
  };
  const readDraft = () => { try { const d = localStorage.getItem(draftKey); return d ? JSON.parse(d) : null; } catch { return null; } };
  const [f, setF] = useState(() => { const d = readDraft(); return d ? { ...blank, ...d } : blank; });
  const [restored, setRestored] = useState(() => !!readDraft());
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState("");
  const [cropUrl, setCropUrl] = useState(null);
  useEffect(() => { try { localStorage.setItem(draftKey, JSON.stringify(f)); } catch {} }, [f]);
  const clearDraft = () => { try { localStorage.removeItem(draftKey); } catch {} };
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  // scelta file -> apre il ritaglio interattivo
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0]; e.target.value = "";
    if (!file) return;
    setUpErr("");
    setCropUrl(URL.createObjectURL(file));
  };
  // carica su Supabase Storage il ritaglio confermato (bucket "fotos")
  const uploadBlob = async (blob) => {
    setCropUrl(null); if (!blob) return;
    setUpErr(""); setUploading(true);
    try {
      const path = `clienti/${existing?.id || uid("c")}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("fotos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("fotos").getPublicUrl(path);
      setF((p) => ({ ...p, avatar: data.publicUrl }));
    } catch (err) { setUpErr("Caricamento foto non riuscito. Riprova."); }
    setUploading(false);
  };
  const setMethod = (m) => setF((p) => ({ ...p, pay_method: m, pay_term: (TERMS_BY_METHOD[m] || []).includes(p.pay_term) ? p.pay_term : "" }));
  const agents = profiles.filter((u) => ["agent", "admin", "manager"].includes(u.role));
  const allowedTerms = TERMS_BY_METHOD[f.pay_method] || [];
  const valid = f.name.trim() && f.category && (!isItaly(f.paese) || f.cap.trim());
  const save = () => { if (!valid) return; clearDraft(); onSave({ ...(existing || {}), ...f, name: f.name.trim() }); };
  const cancel = () => { clearDraft(); onClose(); };

  return <Modal wide title={isEdit ? "Modifica cliente" : "Nuovo cliente"} onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {restored && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: `${T.accent}18`, border: `1px solid ${T.accent}`, borderRadius: 11, padding: "9px 12px", fontSize: 13 }}>
        <span style={{ color: T.text }}>Bozza ripristinata — avevi già iniziato a compilare.</span>
        <button onClick={() => { clearDraft(); setF(blank); setRestored(false); }} style={{ background: "transparent", border: "none", color: T.accent, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Ricomincia</button>
      </div>}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar name={f.name} src={f.avatar} size={64} round />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "9px 13px", borderRadius: 10, cursor: uploading ? "default" : "pointer" }}>
              {uploading ? <Loader2 size={15} className="spin" /> : <Plus size={15} />} {f.avatar ? "Cambia foto" : "Carica foto"}
              <input type="file" accept="image/*" onChange={onFile} disabled={uploading} style={{ display: "none" }} />
            </label>
            {f.avatar && <button onClick={() => set("avatar")("")} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: T.muted, fontSize: 13.5, fontWeight: 700 }}><Trash2 size={14} color="#ef6464" /> Rimuovi</button>}
          </div>
          {upErr ? <span style={{ color: "#ef6464", fontSize: 12 }}>{upErr}</span> : <span style={{ color: T.faint, fontSize: 12 }}>Foto profilo del cliente (facoltativa)</span>}
        </div>
      </div>
      <Field icon={Building2} label="Nome cliente *" value={f.name} onChange={set("name")} placeholder="Ragione sociale" />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}><Tag size={13} color={T.faint} /><span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted }}>Categoria *</span></div>
        <Chips options={CATEGORIES} value={f.category} onChange={set("category")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field icon={Hash} label="Codice" value={f.code} onChange={set("code")} placeholder="CL-014" />
        <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Shield size={13} color={T.faint} /><span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted }}>Agente rif.</span></div>
          <select value={f.agent_id} onChange={(e) => set("agent_id")(e.target.value)} style={{ ...inputStyle, appearance: "none" }}><option value="">—</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      </div>
      <Field icon={User} label="Referente (loro)" value={f.contact} onChange={set("contact")} placeholder="Contatto cliente" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field icon={Phone} label="Telefono" value={f.phone} onChange={set("phone")} placeholder="+39…" />
        <Field icon={Hash} label="P. IVA" value={f.vat} onChange={set("vat")} placeholder="IT…" />
      </div>
      <Field icon={Mail} label="Email referente" value={f.email_referente} onChange={set("email_referente")} placeholder="referente@…" />
      <Field icon={Mail} label="Email generica" value={f.email} onChange={set("email")} placeholder="info@…" />
      <Field icon={Receipt} label="Email fatture" value={f.email_fatture} onChange={set("email_fatture")} placeholder="fatture@…" />
      <Field icon={MapPin} label="Indirizzo" value={f.address} onChange={set("address")} placeholder="Via, città" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field icon={Navigation} label="Paese" value={f.paese} onChange={set("paese")} placeholder="Italia" />
        <Field icon={Hash} label={isItaly(f.paese) ? "CAP *" : "CAP / ZIP"} value={f.cap} onChange={set("cap")} placeholder={isItaly(f.paese) ? "25010" : "—"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field icon={Hash} label="Cod. Fiscale" value={f.cf} onChange={set("cf")} placeholder="Cod. fiscale" />
        <Field icon={Hash} label="IBAN" value={f.iban} onChange={set("iban")} placeholder="IT60…" />
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Pagamento</div>
        <Chips options={PAY_METHODS} value={f.pay_method} onChange={setMethod} />
      </div>
      {f.pay_method && <div><div style={{ fontSize: 10.5, color: T.faint, marginBottom: 7 }}>Termini compatibili con {f.pay_method}:</div><Chips options={allowedTerms} value={f.pay_term} onChange={set("pay_term")} activeColor={T.gold} activeText="#0B0D16" /></div>}
      <Field icon={FileText} label="Note" value={f.notes} onChange={set("notes")} placeholder="Accordi…" textarea />
    </div>
    <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <Btn ghost onClick={cancel}>Annulla</Btn>
      <Btn onClick={save} disabled={!valid}><Save size={16} /> {isEdit ? "Salva" : "Crea cliente"}</Btn>
    </div>
    {cropUrl && <CropModal url={cropUrl} onCancel={() => setCropUrl(null)} onConfirm={uploadBlob} />}
  </Modal>;
}

/* ============================================================ CALENDARIO */
function CalendarView({ me, appts, customers, profiles, onNew, onEdit, isMobile }) {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(ymd(today));
  const [filter, setFilter] = useState("all");
  const custName = (id) => customers.find((c) => c.id === id)?.name;
  const mine = useMemo(() => appts.filter((a) => seesAll(me) ? (filter === "all" || a.agent_id === filter) : a.agent_id === me.id), [appts, me, filter]);
  const byDay = useMemo(() => { const m = {}; mine.forEach((a) => { (m[a.date] = m[a.date] || []).push(a); }); return m; }, [mine]);
  const cells = monthCells(cur.getFullYear(), cur.getMonth());
  const dayList = (byDay[sel] || []).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const agents = profiles.filter((u) => ["agent", "admin", "manager"].includes(u.role));

  return <div style={{ padding: isMobile ? "16px 14px 90px" : "26px 30px 40px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
      <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900 }}>Calendario</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {seesAll(me) && <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", appearance: "none" }}><option value="all">Tutti</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>}
        <Btn onClick={() => onNew(sel)}><Plus size={16} /> {isMobile ? "" : "Appuntamento"}</Btn>
      </div>
    </div>
    <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: isMobile ? "100%" : 400, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() - 1, 1))} style={{ background: T.ink, border: `1px solid ${T.border}`, borderRadius: 9, padding: 8, cursor: "pointer" }}><ChevronLeft size={17} color={T.text} /></button>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{MON[cur.getMonth()]} {cur.getFullYear()}</div>
          <button onClick={() => setCur(new Date(cur.getFullYear(), cur.getMonth() + 1, 1))} style={{ background: T.ink, border: `1px solid ${T.border}`, borderRadius: 9, padding: 8, cursor: "pointer" }}><ChevronRight size={17} color={T.text} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>{WD.map((w) => <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.faint }}>{w}</div>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((d, i) => { if (!d) return <div key={i} />; const key = ymd(d); const has = byDay[key]?.length; const isToday = key === ymd(today); const isSel = key === sel;
            return <button key={i} onClick={() => setSel(key)} style={{ aspectRatio: "1", borderRadius: 10, cursor: "pointer", border: `1px solid ${isSel ? T.accent : "transparent"}`, background: isSel ? T.raised2 : "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontSize: 14, fontWeight: isToday ? 900 : 600, color: isToday ? T.gold : T.text }}>{d.getDate()}</span>
              {has ? <span style={{ position: "absolute", bottom: 6, width: 5, height: 5, borderRadius: "50%", background: T.accent }} /> : null}
            </button>; })}
        </div>
      </div>
      <div style={{ width: isMobile ? "100%" : 320 }}>
        <Eyebrow>{new Date(sel).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</Eyebrow>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
          {dayList.length === 0 ? <Empty icon={CalendarDays} title="Nessun appuntamento" sub="Aggiungine uno." />
            : dayList.map((a) => <button key={a.id} onClick={() => onEdit(a)} style={{ textAlign: "left", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: 12, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontWeight: 900, color: T.accent, fontSize: 14 }}>{a.time}</span><span style={{ fontWeight: 800, fontSize: 14.5 }}>{a.title}</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, color: T.muted, fontSize: 12.5 }}>
                {a.customer_id && custName(a.customer_id) && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={11} /> {custName(a.customer_id)}</span>}
                {!a.customer_id && a.prospect_name && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Building2 size={11} /> {a.prospect_name} <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, background: `${T.accent}22`, borderRadius: 5, padding: "1px 5px" }}>POTENZIALE</span></span>}
                {a.done && <span style={{ display: "flex", alignItems: "center", gap: 4, color: T.ok }}><MapPin size={11} /> visitato</span>}
                {a.location && <span style={{ display: "flex", alignItems: "center", gap: 4, color: T.accent }}><MapPin size={11} /> {a.location}</span>}
                {seesAll(me) && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={11} /> {nameFrom(profiles, a.agent_id)}</span>}
              </div>
            </button>)}
        </div>
      </div>
    </div>
  </div>;
}

function ApptModal({ me, existing, defaultDate, customers, profiles, onClose, onSave, onDelete, onPromote }) {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title || "");
  const [date, setDate] = useState(existing?.date || defaultDate || ymd(new Date()));
  const [time, setTime] = useState(existing?.time || "09:00");
  const [customerId, setCustomerId] = useState(existing?.customer_id || (existing?.prospect_name ? "__new__" : ""));
  const [newName, setNewName] = useState(existing?.prospect_name || "");
  const [newAddress, setNewAddress] = useState(existing?.prospect_address || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [done, setDone] = useState(existing?.done || false);
  const [agentId, setAgentId] = useState(existing?.agent_id || (me.role === "agent" ? me.id : ""));
  const custs = customers;
  const agents = profiles.filter((u) => ["agent", "admin", "manager"].includes(u.role));
  const isNew = customerId === "__new__";
  const isProspect = isNew && !existing?.customer_id;
  const isPast = new Date(`${date}T${time || "23:59"}:00`) < new Date();
  useEffect(() => { if (!isPast && done) setDone(false); }, [isPast]);
  const valid = title.trim() && date && (seesAll(me) ? agentId : true) && (!isNew || newName.trim());
  const pickCustomer = (id) => { setCustomerId(id); if (id === "__new__") { setLocation(newAddress); return; } const c = customers.find((x) => x.id === id); if (c && !location) setLocation(c.address || c.name); };
  const build = () => {
    const ag = seesAll(me) ? agentId : me.id;
    const base = { title: title.trim(), date, time, location: location.trim(), notes: notes.trim(), done: isPast ? done : false, agent_id: ag };
    if (isNew) { base.prospect_name = newName.trim(); base.prospect_address = (newAddress || location).trim(); base.customer_id = null; }
    else { base.customer_id = customerId || null; base.prospect_name = ""; base.prospect_address = ""; }
    return isEdit ? { ...existing, ...base } : base;
  };
  return <Modal title={isEdit ? "Appuntamento" : "Nuovo appuntamento"} onClose={onClose}>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field icon={CalendarDays} label="Titolo *" value={title} onChange={setTitle} placeholder="Es. Visita" />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}><Field icon={Calendar} label="Data" value={date} onChange={setDate} type="date" /><Field icon={Clock} label="Ora" value={time} onChange={setTime} type="time" /></div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Cliente</div>
        <select value={customerId} onChange={(e) => pickCustomer(e.target.value)} style={{ ...inputStyle, appearance: "none" }}><option value="">— nessuno —</option>{custs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="__new__">➕ Nuovo cliente (non in rubrica)</option></select></div>
      {isNew && <div style={{ background: T.ink, border: `1px solid ${T.accent}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12.5, color: T.accent, fontWeight: 700 }}>Cliente potenziale · NON entra in rubrica</div>
        <Field icon={Building2} label="Nome potenziale *" value={newName} onChange={setNewName} placeholder="Ragione sociale" />
        <Field icon={MapPin} label="Indirizzo" value={newAddress} onChange={(v) => { setNewAddress(v); setLocation(v); }} placeholder="Via, città" />
        {newAddress && <a href={mapsUrl(newAddress)} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", gap: 6, alignItems: "center" }}><Navigation size={14} /> Verifica su Google Maps</a>}
      </div>}
      {!isNew && <Field icon={MapPin} label="Luogo" value={location} onChange={setLocation} placeholder="Indirizzo o ditta" />}
      {!isNew && location && <a href={mapsUrl(location)} target="_blank" rel="noreferrer" style={{ color: T.accent, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", gap: 6, alignItems: "center" }}><Navigation size={14} /> Apri in Google Maps</a>}
      {seesAll(me) && <div><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 6 }}>Agente *</div><select value={agentId} onChange={(e) => setAgentId(e.target.value)} style={{ ...inputStyle, appearance: "none" }}><option value="">— scegli —</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>}
      <Field icon={FileText} label="Note" value={notes} onChange={setNotes} placeholder="Dettagli…" textarea />
      <button onClick={() => { if (isPast) setDone((v) => !v); }} disabled={!isPast} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.ink, border: `1px solid ${done ? T.ok : T.border}`, borderRadius: 11, padding: "11px 13px", cursor: isPast ? "pointer" : "not-allowed", opacity: isPast ? 1 : 0.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: T.text, fontSize: 13.5, fontWeight: 700 }}><MapPin size={15} color={done ? T.ok : T.faint} /> Già visitato {isPast ? "(verde in mappa)" : "(solo date passate)"}</span>
        <span style={{ width: 40, height: 22, borderRadius: 11, background: done ? T.ok : T.raised2, position: "relative" }}><span style={{ position: "absolute", top: 3, left: done ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} /></span>
      </button>
    </div>
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <Btn full onClick={() => onSave(build())} disabled={!valid}><Save size={16} /> {isEdit ? "Salva" : "Crea appuntamento"}</Btn>
      {isProspect && <Btn full color={T.ok} onClick={() => onPromote(build(), { name: newName.trim(), address: newAddress.trim(), agent_id: seesAll(me) ? agentId : me.id })} disabled={!newName.trim()}><Building2 size={16} /> Aggiungi alla rubrica clienti</Btn>}
      {isEdit && <div style={{ display: "flex", gap: 10 }}>
        <Btn ghost full onClick={() => downloadICS({ ...existing })}><CalendarDays size={15} color={T.accent} /> Al calendario</Btn>
        <Btn ghost full onClick={onDelete}><Trash2 size={15} color="#ef6464" /> <span style={{ color: "#ef6464" }}>Elimina</span></Btn>
      </div>}
    </div>
  </Modal>;
}

/* ============================================================ MAPPA */
function ItalyMap({ visited = [], todo = [] }) {
  const both = new Set(visited.filter((v) => todo.some((t) => t.name === v.name)).map((v) => v.name));
  const pin = (p, color, dir) => { let [x, y] = projXY(p.ll[0], p.ll[1]); if (both.has(p.name)) x += dir * 7; const cy = y - 22; return <g key={color + p.name}>
    <ellipse cx={x} cy={y} rx={5} ry={2} fill="#000" opacity={0.4} />
    <path d={`M ${x} ${y} L ${x - 7} ${cy + 5} A 9 9 0 1 1 ${x + 7} ${cy + 5} Z`} fill={color} stroke={T.ink} strokeWidth={1.2} strokeLinejoin="round" />
    <circle cx={x} cy={cy} r={3.6} fill={T.ink} />
    {p.approx && <circle cx={x} cy={cy} r={12} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />}
    {p.count > 1 && <g><circle cx={x + 9} cy={cy - 8} r={7} fill={T.gold} stroke={T.ink} strokeWidth={1} /><text x={x + 9} y={cy - 5} textAnchor="middle" fontSize={8.5} fontWeight={800} fill={T.ink}>{p.count}</text></g>}
    <text x={x} y={y + 13} textAnchor="middle" fontSize={10} fontWeight={800} fill={T.text} stroke={T.ink} strokeWidth={2.6} paintOrder="stroke">{capCity(p.name)}</text>
  </g>; };
  return <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
    <rect x={0} y={0} width={MAP_W} height={MAP_H} rx={16} fill={T.ink} />
    {[8, 10, 12, 14, 16, 18].map((ln) => { const [x] = projXY(42, ln); return <line key={"v" + ln} x1={x} y1={0} x2={x} y2={MAP_H} stroke={T.borderSoft} strokeWidth={0.5} />; })}
    {[38, 40, 42, 44, 46].map((la) => { const [, y] = projXY(la, 12); return <line key={"h" + la} x1={0} y1={y} x2={MAP_W} y2={y} stroke={T.borderSoft} strokeWidth={0.5} />; })}
    {ITALY.map((seg, i) => <polygon key={i} points={seg.map(([la, ln]) => projXY(la, ln).join(",")).join(" ")} fill={T.raised} stroke={T.border} strokeWidth={1.2} strokeLinejoin="round" />)}
    {todo.map((p) => pin(p, T.accent, 1))}
    {visited.map((p) => pin(p, T.ok, -1))}
  </svg>;
}
function Mappe({ me, appts, customers, profiles, isMobile }) {
  const agents = profiles.filter((u) => ["agent", "admin", "manager"].includes(u.role));
  const [sel, setSel] = useState(seesAll(me) ? (agents[0]?.id || "") : me.id);
  const agent = profiles.find((u) => u.id === sel);
  const { visited, todo, unmatched } = useMemo(() => agentPlaces(sel, appts, customers), [sel, appts, customers]);
  const nV = visited.reduce((s, p) => s + p.count, 0), nD = todo.reduce((s, p) => s + p.count, 0);
  const Legend = ({ color, label }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.muted, fontWeight: 700 }}><span style={{ width: 11, height: 11, borderRadius: "50%", background: color }} /> {label}</span>;
  const List = ({ items, color, title }) => items.length > 0 && <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color, marginBottom: 8 }}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{items.map((p) => <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, padding: "9px 13px" }}><MapPin size={15} color={color} /><span style={{ flex: 1, fontWeight: 700 }}>{p.name}</span><span style={{ fontWeight: 900, color }}>{p.count}</span></div>)}</div>
  </div>;
  return <div style={{ padding: isMobile ? "16px 14px 90px" : "26px 30px 40px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
      <div><div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900 }}>Mappa spostamenti</div><div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>Verde = visitati · Blu = da visitare</div></div>
      {seesAll(me) && <select value={sel} onChange={(e) => setSel(e.target.value)} style={{ ...inputStyle, width: "auto", appearance: "none" }}>{agents.length === 0 && <option value="">Nessun agente</option>}{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>}
    </div>
    <div style={{ display: "flex", gap: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ width: isMobile ? "100%" : 420, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 18, marginBottom: 10 }}><Legend color={T.ok} label="Visitati" /><Legend color={T.accent} label="Da visitare" /></div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 8 }}><ItalyMap visited={visited} todo={todo} /></div>
      </div>
      <div style={{ flex: 1, minWidth: isMobile ? "100%" : 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar name={agent?.name || "?"} size={44} round />
          <div><div style={{ fontWeight: 900, fontSize: 19 }}>{agent?.name || "—"}</div><div style={{ color: T.muted, fontSize: 13 }}>{nV} visitati · {nD} da visitare</div></div>
        </div>
        {visited.length === 0 && todo.length === 0 && <Empty icon={Map} title="Nessuna località" sub="Crea appuntamenti con un luogo." />}
        <List items={visited} color={T.ok} title="Visitati" />
        <List items={todo} color={T.accent} title="Da visitare" />
        {unmatched.length > 0 && <div style={{ background: T.surface, border: `1px solid ${T.borderSoft}`, borderRadius: 12, padding: 13 }}><div style={{ fontSize: 12, color: T.faint, marginBottom: 6 }}>Senza città riconosciuta ({unmatched.length}). Aggiungi città o CAP:</div><div style={{ color: T.muted, fontSize: 13 }}>{unmatched.slice(0, 8).join(" · ")}</div></div>}
      </div>
    </div>
  </div>;
}

/* ============================================================ UTENTI */
function Utenti({ me, profiles, customers, onUpdate, isMobile }) {
  const count = (id) => customers.filter((c) => refAgent(c) === id).length;
  const ROLES = [["agent", "Agente"], ["manager", "Responsabile"], ["packaging", "Imballaggio"], ["admin", "Titolare"]];
  const [editId, setEditId] = useState(null);
  const ed = profiles.find((p) => p.id === editId);
  return <div style={{ padding: isMobile ? "16px 14px 90px" : "26px 30px 40px", maxWidth: 780 }}>
    <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, marginBottom: 8 }}>Utenti & permessi</div>
    <div style={{ color: T.muted, fontSize: 13.5, marginBottom: 18 }}>Per <b>creare</b> un nuovo accesso: Supabase → Authentication → Add user. Poi qui gli assegni ruolo e permessi.</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {profiles.map((u) => <div key={u.id} style={{ background: T.surface, border: `1px solid ${editId === u.id ? T.accent : T.border}`, borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={u.name} size={40} color={roleColor(u.role)} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{u.name} <span style={{ color: roleColor(u.role), fontSize: 12, fontWeight: 700 }}>· {ROLE_LABEL[u.role]}</span></div><div style={{ color: T.muted, fontSize: 12.5 }}>{u.role === "agent" ? `${count(u.id)} clienti` : ROLE_DESC[u.role]}</div></div>
          {u.id !== me.id && <button onClick={() => setEditId(editId === u.id ? null : u.id)} style={{ background: T.raised2, border: "none", borderRadius: 9, padding: 8, cursor: "pointer" }}><Pencil size={15} color={T.muted} /></button>}
        </div>
        {editId === u.id && <div style={{ marginTop: 12, borderTop: `1px solid ${T.borderSoft}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field icon={User} label="Nome" value={ed.name} onChange={(v) => onUpdate(u.id, { name: v })} />
          <div><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 7 }}>Ruolo</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{ROLES.map(([k, l]) => <button key={k} onClick={() => onUpdate(u.id, { role: k, can_edit: k === "admin" ? true : (k === "packaging" ? false : ed.can_edit) })} style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", background: ed.role === k ? roleColor(k) : T.ink, color: ed.role === k ? "#0B0D16" : T.muted, border: `1px solid ${ed.role === k ? roleColor(k) : T.border}` }}>{l}</button>)}</div></div>
          {ed.role !== "packaging" && ed.role !== "admin" && <button onClick={() => onUpdate(u.id, { can_edit: !ed.can_edit })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T.ink, border: `1px solid ${ed.can_edit ? T.accent : T.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, color: T.text, fontSize: 13, fontWeight: 700 }}><Pencil size={14} color={ed.can_edit ? T.accent : T.faint} /> Può modificare</span>
            <span style={{ width: 38, height: 22, borderRadius: 11, background: ed.can_edit ? T.accent : T.raised2, position: "relative" }}><span style={{ position: "absolute", top: 3, left: ed.can_edit ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff" }} /></span>
          </button>}
        </div>}
      </div>)}
    </div>
  </div>;
}

/* ============================================================ ROOT */
export default function App() {
  const isMobile = useIsMobile();
  const [session, setSession] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appts, setAppts] = useState([]);
  const [page, setPage] = useState("clienti");
  const [selCust, setSelCust] = useState(null);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setMe(null); setLoading(false); } });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAll = useCallback(async (uid2) => {
    const [{ data: prof }, { data: cust }, { data: ap }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*"),
    ]);
    setProfiles(prof || []);
    setCustomers(cust || []);
    setAppts(ap || []);
    const mine = (prof || []).find((p) => p.id === uid2);
    setMe(mine || null);
    setLoading(false);
  }, []);

  useEffect(() => { if (session?.user) { setLoading(true); loadAll(session.user.id); } }, [session, loadAll]);
  useEffect(() => { const f = () => { if (session?.user) loadAll(session.user.id); }; window.addEventListener("focus", f); return () => window.removeEventListener("focus", f); }, [session, loadAll]);

  const reload = () => session?.user && loadAll(session.user.id);

  const saveCustomer = async (c) => {
    setErr("");
    const payload = { ...c };
    delete payload.created_at;
    ["agent_id", "created_by"].forEach((k) => { if (payload[k] === "" || payload[k] === undefined) payload[k] = null; });
    if (!payload.id) { payload.created_by = session.user.id; delete payload.id; }
    const { error } = await supabase.from("customers").upsert(payload).select();
    if (error) return setErr(error.message);
    setModal(null); await reload();
  };
  const deleteCustomer = async (id) => {
    if (!confirm("Eliminare questo cliente?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return setErr(error.message);
    setSelCust(null); await reload();
  };
  const saveAppt = async (a) => {
    setErr("");
    const payload = { ...a };
    ["agent_id", "customer_id", "created_by"].forEach((k) => { if (payload[k] === "" || payload[k] === undefined) payload[k] = null; });
    if (!payload.id) payload.created_by = session.user.id;
    const { error } = await supabase.from("appointments").upsert(payload);
    if (error) return setErr(error.message);
    setModal(null); await reload();
  };
  const deleteAppt = async (id) => {
    if (!confirm("Eliminare questo appuntamento?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return setErr(error.message);
    setModal(null); await reload();
  };
  const promoteAppt = async (appt, prospect) => {
    setErr("");
    const { data, error } = await supabase.from("customers").insert({ name: prospect.name, address: prospect.address, paese: "Italia", category: "", agent_id: prospect.agent_id || null, created_by: session.user.id }).select().single();
    if (error) return setErr(error.message);
    const a = { ...appt, customer_id: data.id, prospect_name: "", prospect_address: "" };
    await saveAppt(a);
  };
  const updateProfile = async (id, patch) => {
    setProfiles((ps) => ps.map((p) => p.id === id ? { ...p, ...patch } : p));
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) { setErr(error.message); reload(); }
  };

  if (loading) return <Shell><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.muted }}><Loader2 size={26} className="spin" /></div></Shell>;
  if (!session) return <Shell><Login /></Shell>;
  if (!me) return <Shell><div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 20, textAlign: "center" }}>
    <Logo size={40} /><div style={{ color: T.text, fontWeight: 700 }}>Profilo non trovato</div>
    <div style={{ color: T.muted, fontSize: 14, maxWidth: 320 }}>Il tuo account esiste ma non ha un profilo collegato. Ricarica la pagina; se persiste, controlla che lo schema SQL sia stato eseguito.</div>
    <Btn ghost onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Esci</Btn>
  </div></Shell>;

  const visibleCustomers = customers; // RLS già filtra lato server
  const cust = visibleCustomers.find((c) => c.id === selCust);

  const NAV = [["clienti", "Clienti", LayoutGrid], ["calendario", "Calendario", CalendarDays], ["mappe", "Mappe", Map]];
  if (canManage(me)) NAV.push(["utenti", "Utenti", Users]);

  const go = (p) => { setPage(p); setSelCust(null); };

  const content = <>
    {page === "clienti" && (cust
      ? <Detail me={me} customer={cust} profiles={profiles} onBack={() => setSelCust(null)} onEdit={(id) => setModal({ type: "editCust", id })} onDelete={deleteCustomer} onSave={saveCustomer} isMobile={isMobile} />
      : <Clienti me={me} customers={visibleCustomers} profiles={profiles} onOpen={setSelCust} onNew={() => setModal({ type: "newCust" })} isMobile={isMobile} />)}
    {page === "calendario" && <CalendarView me={me} appts={appts} customers={visibleCustomers} profiles={profiles} onNew={(d) => setModal({ type: "appt", date: d })} onEdit={(a) => setModal({ type: "appt", appt: a })} isMobile={isMobile} />}
    {page === "mappe" && <Mappe me={me} appts={appts} customers={visibleCustomers} profiles={profiles} isMobile={isMobile} />}
    {page === "utenti" && canManage(me) && <Utenti me={me} profiles={profiles} customers={customers} onUpdate={updateProfile} isMobile={isMobile} />}
  </>;

  return <Shell>
    {err && <div style={{ position: "fixed", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "#3a1520", border: "1px solid #ef6464", color: "#ffdada", padding: "10px 14px", borderRadius: 10, fontSize: 13, maxWidth: "90%" }}>{err} <span onClick={() => setErr("")} style={{ cursor: "pointer", marginLeft: 8, fontWeight: 800 }}>✕</span></div>}
    {isMobile ? (
      <div style={{ minHeight: "100vh" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: `${T.ink}f2`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.borderSoft}` }}>
          <Logo size={26} /><div style={{ fontWeight: 900, letterSpacing: 3, flex: 1 }}>ORBITA</div>
          <button onClick={() => supabase.auth.signOut()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 9, cursor: "pointer" }}><LogOut size={17} color={T.muted} /></button>
        </div>
        {content}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30, display: "flex", background: `${T.surface}f5`, backdropFilter: "blur(10px)", borderTop: `1px solid ${T.border}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {NAV.map(([k, l, Icon]) => <button key={k} onClick={() => go(k)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: page === k ? T.accent : T.faint }}>
            <Icon size={20} /><span style={{ fontSize: 10.5, fontWeight: 700 }}>{l}</span>
          </button>)}
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: 244, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.borderSoft}`, display: "flex", flexDirection: "column", padding: 16, height: "100vh", position: "sticky", top: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 18px" }}><Logo size={30} /><div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 3 }}>ORBITA</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map(([k, l, Icon]) => <button key={k} onClick={() => go(k)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 700, background: page === k ? T.raised2 : "transparent", color: page === k ? T.text : T.muted }}><Icon size={18} color={page === k ? T.accent : T.faint} /> {l}</button>)}
          </div>
          <div style={{ marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderTop: `1px solid ${T.borderSoft}`, marginBottom: 8 }}>
              <Avatar name={me.name} size={36} color={roleColor(me.role)} />
              <div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{me.name}</div><div style={{ color: roleColor(me.role), fontSize: 12, fontWeight: 700 }}>{ROLE_LABEL[me.role]}</div></div>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}><LogOut size={16} /> Esci</button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{content}</div>
      </div>
    )}

    {modal?.type === "newCust" && <CustomerForm me={me} profiles={profiles} onClose={() => setModal(null)} onSave={saveCustomer} />}
    {modal?.type === "editCust" && <CustomerForm me={me} existing={customers.find((c) => c.id === modal.id)} profiles={profiles} onClose={() => setModal(null)} onSave={saveCustomer} />}
    {modal?.type === "appt" && <ApptModal me={me} existing={modal.appt} defaultDate={modal.date} customers={visibleCustomers} profiles={profiles} onClose={() => setModal(null)} onSave={saveAppt} onDelete={() => deleteAppt(modal.appt.id)} onPromote={promoteAppt} />}
  </Shell>;
}

function Shell({ children }) {
  return <div style={{ background: T.ink, minHeight: "100vh", color: T.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
    <style>{`
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      @keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1s linear infinite}
      .rowh:active,.rowh:hover{background:${T.raised}}
      input,textarea,select{font-family:inherit}
      input[type=date],input[type=time]{color-scheme:dark}
      ::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:6px}
    `}</style>
    {children}
  </div>;
}
