# OBSNews

En webbapp som visar polisnyheter från Polismyndighetens API och fungerar som en enkel overlay. Adminvyn låter dig blockera ord och dölja enskilda händelser.

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

## OBS Browser Source

1. Bygg projektet:
   ```
   npm run build
   ```
2. Starta en lokal server från projektroten:
   ```
   python3 -m http.server 8080
   ```
3. I OBS: Add -> Browser Source och ange:
   - URL: `http://localhost:8080/index.html`
   - Width/Height: `1920x1080`
4. (Valfritt) Avmarkera “Shutdown source when not visible” om du vill att feeden ska uppdateras även när scenen är dold.
5. Adminvyn öppnar du i vanlig webbläsare: `http://localhost:8080/admin.html`.

## Adminvy

- Lägg till blockerade ord i formuläret. Matchning är case‑insensitive mot titel + sammanfattning + plats.
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

- Kartan laddar tiles från OpenStreetMap och kräver nätverk.
