# AIKA WORLD — Projekt Fejlesztési Terv (TODO)

Ez a dokumentum összefoglalja a folyamatban lévő és tervezett fejlesztéseket az AIKA WORLD böngészős játékhoz.

---

## 🛠️ Phase 1: Játékmechanika & Realizmus (Alapok megerősítése)
*A jelenlegi "egyszerűsített" modell átalakítása valódi űrháborús stratégia irányába.*

- [x] **Bolygó-specifikus gazdaság:** 
    - [x] A `game_state` átalakítása, hogy a nyersanyagok, épületek és flották bolygónként legyenek tárolva.
    - [x] Nyersanyagszállítás (Transport) implementálása bolygók között.
    - [x] **BUGFIX:** Háttérben futó termelés minden bolygón.
- [x] **Valódi Flotta Mozgás:**
    - [x] Küldetés indításakor a hajók tényleges levonása az indulási bolygóról.
    - [x] A küldetés befejeztével a túlélő hajók visszatérése.
- [x] **Automatizált Küldetéskezelés:**
    - [x] Cloudflare Worker `scheduled` (Cron) esemény bővítése.
- [x] **Technológiai Fa (Tech Tree):**
    - [x] Épületek és kutatások előfeltételeinek (Prerequisites) ellenőrzése és megjelenítése.
- [x] **Védelmi Rendszerek:**
    - [x] Buildable védelmi egységek (Rakétatorony, Lézerágyú, Pajzskupola) implementálása.
    - [x] Védelem integrálása a harci szimulációba.

## 🎨 Phase 2: Felhasználói Élmény & Vizualitás (UI/UX)
*A játék kényelmesebbé és látványosabbá tétele.*
...
