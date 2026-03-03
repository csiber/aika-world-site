# AIKA WORLD — Projekt Fejlesztési Terv (TODO)

Ez a dokumentum összefoglalja a folyamatban lévő és tervezett fejlesztéseket az AIKA WORLD böngészős játékhoz.

---

## 🛠️ Phase 1: Játékmechanika & Realizmus (Alapok megerősítése)
*A jelenlegi "egyszerűsített" modell átalakítása valódi űrháborús stratégia irányába.*

- [x] **Bolygó-specifikus gazdaság:** 
    - [x] A `game_state` átalakítása, hogy a nyersanyagok, épületek és flották bolygónként legyenek tárolva.
    - [x] Nyersanyagszállítás (Transport) implementálása bolygók között.
    - [x] **BUGFIX:** Háttérben futó termelés minden bolygón (nem csak az aktívon).
- [x] **Valódi Flotta Mozgás:**
    - [x] Küldetés indításakor a hajók tényleges levonása az indulási bolygóról.
    - [x] A küldetés befejeztével a túlélő hajók visszatérése.
    - [x] **BUGFIX:** Sorban álló hajók/épületek helyes bolygóhoz rendelése (`planet_id`).
- [x] **Automatizált Küldetéskezelés:**
    - [x] Cloudflare Worker `scheduled` (Cron) esemény bővítése minden felhasználó beérkezett küldetésének automatikus feldolgozására.
- [ ] **Technológiai Fa (Tech Tree):**
    - [ ] Épületek és kutatások előfeltételeinek (Prerequisites) szigorúbb ellenőrzése és megjelenítése a UI-on.
- [ ] **Védelmi Rendszerek:**
    - [ ] A `defense` épület ne csak bónuszt adjon, hanem legyenek konkrét védelmi egységek (pl. Rakétatorony, Lézerágyú).
...
