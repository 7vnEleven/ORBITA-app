# ORBITA — app collegata a Supabase

App gestione clienti/ordini/appuntamenti/mappa, collegata al tuo database Supabase (progetto **ORBITA**).
Login con email + password. I dati sono condivisi tra PC e telefono (stesso database).

Il tuo database è già configurato. Il collegamento (URL + chiave anon) è già dentro il codice
(`src/supabase.js`). Non devi toccare niente nel codice: devi solo metterlo online.

---

## Come metterla online (gratis) — guida semplice

Ci sono due strade. La più semplice per te è la **A**.

### A) Con Vercel (consigliata, senza installare niente)

1. Vai su **https://vercel.com** e registrati (puoi usare "Continue with GitHub"; se non hai
   GitHub, crea un account gratis su https://github.com prima).
2. Dentro Vercel premi **Add New… → Project**.
3. Ti chiede di caricare il codice. Il modo più comodo:
   - Vai su https://github.com → **New repository** → nome `orbita-app` → **Create**.
   - Nella pagina del repository premi **uploading an existing file** e trascina **tutti i file
     di questa cartella** (NON la cartella `node_modules`, se c'è: escludila).
   - **Commit**.
   - Torna su Vercel → **Add New… → Project** → scegli il repository `orbita-app` → **Import**.
4. Vercel riconosce che è un progetto **Vite**. Lascia tutto com'è e premi **Deploy**.
5. Dopo ~1 minuto avrai un indirizzo tipo **https://orbita-app.vercel.app** 🎉
   Aprilo dal PC e dal telefono: è la tua app.

> Suggerimento telefono: apri il link su iPhone in Safari → **Condividi → Aggiungi a Home**.
> Così hai l'icona come un'app vera.

### B) Con Netlify Drop (ancora più veloce, ma senza aggiornamenti automatici)

1. Sul PC apri un terminale in questa cartella e lancia:
   ```
   npm install
   npm run build
   ```
   Si crea una cartella **`dist`**.
2. Vai su **https://app.netlify.com/drop** e **trascina dentro la cartella `dist`**.
3. Ti dà subito un indirizzo online.
   (Per aggiornare l'app in futuro ripeti `npm run build` e ritrascini `dist`.)

---

## Primo accesso

- Email: quella che hai creato in Supabase (es. `paolo.ogliosi@alesiainc.com`)
- Password: quella che hai impostato

Sei **Titolare (admin)**: vedi tutto e gestisci gli utenti.

## Aggiungere agenti / utenti

1. Supabase → **Authentication → Add user → Create new user** (email + password).
2. Nell'app → sezione **Utenti** → assegna il ruolo (Agente / Responsabile / Imballaggio) e
   l'opzione "Può modificare".

---

## Cosa c'è in questa versione
- Login vero (email+password), dati condivisi PC↔telefono
- Clienti: tutti i campi (categoria, agente rif., referente, 3 email, P.IVA, CF, IBAN, paese/CAP,
  modalità e termini di pagamento con incompatibilità automatiche) + ordini + fatturato
- Calendario: appuntamenti, clienti potenziali (non in rubrica) con "Aggiungi alla rubrica",
  "già visitato" solo per date passate, aggiunta al calendario del telefono (.ics)
- Mappa per agente: visitati (verde) / da visitare (blu), riconoscimento città + CAP
- Utenti & permessi

## Prossimi passi (quando vuoi)
- Foto clienti/prodotti e allegati ordini (con Supabase Storage)
- Notifiche push e mappa geografica mondiale precisa
- Aggiornamento in tempo reale automatico tra dispositivi

---

## PWA — installazione come app (con icona ORBITA)

Questa app è una **PWA**: dopo averla messa online (vedi sopra), si installa sui dispositivi
con la sua icona, a schermo intero, e funziona offline per le parti già viste.

**iPhone / iPad (Safari):** apri il link → tasto Condividi → **Aggiungi a Home**.
Comparirà l'icona ORBITA; il nome sotto sarà "ORBITA".

**Android (Chrome):** apri il link → menù ⋮ → **Installa app** (o "Aggiungi a schermata Home").

**PC (Chrome/Edge):** apri il link → nella barra indirizzi appare l'icona **Installa** →
clic → l'app si apre in una sua finestra e resta tra le applicazioni.

Le icone e la schermata d'avvio sono già incluse nella cartella `public/`.
