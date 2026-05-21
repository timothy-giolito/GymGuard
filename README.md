# 🏋️‍♂️ MyGymGuard

Un'applicazione mobile moderna e reattiva pensata per gestire in modo completo la tua vita in palestra: dal tracciamento delle schede di allenamento, alla gestione dei timer di recupero, fino all'archiviazione degli abbonamenti. 

## ✨ Funzionalità Principali

* 📝 **Diario di Allenamento**: Registra ogni esercizio, serie e ripetizione. L'interfaccia è l'ideale per tenere traccia dei progressi della tua "Bro Split" settimanale.
* ⏱️ **Smart Timer**: Gestisci i tempi di recupero tra una serie e l'altra con precisione per ottimizzare la resa fisica.
* 📊 **Grafici di Progressione**: Monitora i tuoi miglioramenti nel tempo grazie a grafici interattivi e statistiche dettagliate basate su `recharts`.
* 📄 **Gestione Abbonamenti (PDF)**: Carica e visualizza i documenti e le ricevute della palestra direttamente in-app, grazie all'integrazione nativa di un lettore PDF.
* 📱 **Esperienza Nativa**: Interfaccia fluida ottimizzata per dispositivi Android con un tema scuro elegante (`#0a0a0a`) applicato direttamente alla Status Bar.
* 💾 **Salvataggio Dati Offline**: I tuoi dati sono sempre al sicuro e disponibili anche senza connessione internet, archiviati in modo persistente sul dispositivo tramite `localforage`.
* ✨ **UI Animata**: Transizioni fluide e animazioni curate nei minimi dettagli gestite tramite `framer-motion`.

## 🛠️ Stack Tecnologico

Il progetto (identificato con l'app ID `com.mygymguard.app`) è stato sviluppato con uno stack moderno incentrato sulle performance e sulla portabilità:

* **Core**: React 19, TypeScript e Vite per un ambiente di sviluppo rapidissimo.
* **Mobile Framework**: Capacitor 8 per la build nativa multipiattaforma e l'accesso ai file di sistema (es. File Opener).
* **Routing & Icone**: React Router DOM v7 per la navigazione e Lucide React per l'iconografia.
* **Utility Dati**: `date-fns` per una gestione flessibile delle date dei workout.
* **Documenti**: PDF.js (`pdfjs-dist` v5) per il rendering dei file degli abbonamenti.

## 🚀 Come avviare il progetto (Sviluppo Locale)

### Prerequisiti
Assicurati di avere installato Node.js e le dipendenze per lo sviluppo Android (Android Studio) per la compilazione nativa.

### Installazione ed Esecuzione

1. Clona la repository e accedi alla cartella del progetto.
2. Installa le dipendenze:

   ```bash
   npm install
   
4. Avvia il server di sviluppo web:

   ```bash
   npm run dev
(Puoi anche utilizzare npm run dev:host per esporre l'app sulla rete locale).

### Build per Android 📱

Per compilare e testare l'applicazione nativa tramite Capacitor:

1. Crea la build ottimizzata:

   ```bash
   npm run build

2. Sincronizza i file web con la cartella nativa di Android:

   ```bash
   npx cap sync android

3. Apri il progetto su Android Studio o avvialo sul tuo dispositivo:

   ```bash
   npx cap open android
   
### Autore 👨‍💻
Sviluppato con dedizione da Timothy Giolito per un utilizzo quotidiano durante la sessione di allenamento.


