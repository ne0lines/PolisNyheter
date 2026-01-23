# OBSNews

En webbapp som visar nyheter från SVT:s RSS-flöde, med adminvy för att blockera ord och dölja enskilda nyheter.

## Funktioner

- Hämtar och visar nyheter från https://www.svt.se/rss.xml
- Breaking‑läge markerar nyligen publicerade nyheter
- News‑ticker för fler händelser
- Adminvy (`admin.html`) för:
  - Blocklist med ord/fraser (sparas i localStorage)
  - Dölja/visa enskilda händelser (sparas i localStorage)

## Kom igång

1. Installera Node.js: https://nodejs.org/
2. Installera dependencies:
   ```
   npm install
   ```
3. Bygg TypeScript:
   ```
   npm run build
   ```
4. Öppna:
- `index.html` för användarvyn
- `admin.html` för adminvyn

Tips: för bästa kompatibilitet med ES‑moduler, kör via en lokal server.

## Adminvy

- Lägg till blockerade ord i formuläret. Matchning är case‑insensitive mot titel + sammanfattning.
- Dolda händelser sparas direkt via toggle‑knappen.
- Rensa dolda händelser med “Show all”.

## Projektstruktur

```
src/
 ├── models/       (Typer och interfaces)
 ├── components/   (UI‑rendering)
 ├── services/     (API + filterlogik)
 ├── utils/        (helpers, localStorage, text)
 └── main.ts       (init + event listeners)
```

## Skript

- `npm run build` – bygger TypeScript till `dist/`
- `npm run dev` – watch‑läge för TypeScript

## Noteringar

- RSS-flödet kräver nätverk. Kartan visas bara om en nyhet innehåller koordinater.
