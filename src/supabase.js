import { createClient } from "@supabase/supabase-js";

// ============================================================
//  Collegamento al TUO database Supabase (progetto ORBITA)
//  La chiave "anon" e pubblica per natura: e sicura da tenere
//  qui. I dati sono protetti dalle regole (RLS) sul database.
// ============================================================
const SUPABASE_URL = "https://kyazwcpbudhvfmipjrcc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXp3Y3BidWRodmZtaXBqcmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTc1NDksImV4cCI6MjA5ODU3MzU0OX0.B2OEayqBJTmARlKc0zr3vEj4bh26P7at7Wsd65I4Zr8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
