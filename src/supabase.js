import { createClient } from "@supabase/supabase-js";

// ============================================================
//  Collegamento al TUO database Supabase (progetto ORBITA)
//  La chiave "anon" e pubblica per natura: e sicura da tenere
//  qui. I dati sono protetti dalle regole (RLS) sul database.
// ============================================================
const SUPABASE_URL = "https://kyazwcpbudhvfmipjrcc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3Y3BidWRodmZtaXBqcmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NDksImV4cCI6MjA5ODU3MzU0OX0.B2OEayqBJTmARlKc0zr3vEj4bh26P7at7Wsd65I4Zr8";

// La sessione vive SOLO finche' il browser/app e' aperto:
// usiamo sessionStorage, che si svuota alla chiusura -> logout automatico.
const safeSession = {
  getItem: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  setItem: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
  removeItem: (k) => { try { sessionStorage.removeItem(k); } catch {} },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: safeSession,
    storageKey: "orbita-auth",
  },
});
