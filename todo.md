# AIKA WORLD — Projekt Fejlesztési Terv (TODO)

Ez a dokumentum összefoglalja a folyamatban lévő és tervezett fejlesztéseket az AIKA WORLD böngészős játékhoz.

---

## 🛠️ Phase 1: Játékmechanika & Realizmus (Alapok megerősítése)
*A jelenlegi "egyszerűsített" modell átalakítása valódi űrháborús stratégia irányába.*

- [ ] **Bolygó-specifikus gazdaság:** 
    - [ ] A `game_state` átalakítása, hogy a nyersanyagok, épületek és flották bolygónként legyenek tárolva (ne globálisan a felhasználónál).
    - [ ] Nyersanyagszállítás (Transport) implementálása bolygók között.
- [ ] **Valódi Flotta Mozgás:**
    - [ ] Küldetés indításakor a hajók tényleges levonása az indulási bolygóról.
    - [ ] A küldetés befejeztével a túlélő hajók visszatérése (vagy megmaradása a célpontnál, pl. Colonize/Station).
- [ ] **Automatizált Küldetéskezelés:**
    - [ ] Cloudflare Worker `scheduled` (Cron) esemény bővítése, hogy ne csak a botokat, hanem minden felhasználó beérkezett küldetését automatikusan feldolgozza (jelenleg manuális `/resolve` vagy csak belépéskori sync van).
- [ ] **Technológiai Fa (Tech Tree):**
    - [ ] Épületek és kutatások előfeltételeinek (Prerequisites) szigorúbb ellenőrzése és megjelenítése a UI-on.
- [ ] **Védelmi Rendszerek:**
    - [ ] A `defense` épület ne csak bónuszt adjon, hanem legyenek konkrét védelmi egységek (pl. Rakétatorony, Lézerágyú), amik a flottához hasonlóan építhetők és megsemmisíthetők.

## 🎨 Phase 2: Felhasználói Élmény & Vizualitás (UI/UX)
*A játék kényelmesebbé és látványosabbá tétele.*

- [ ] **Részletes Harci Jelentések:**
    - [ ] Külön nézet vagy modális ablak a csaták részletezéséhez (körökre bontott veszteségek, pontos statisztikák), a sima szöveges üzenet helyett.
- [ ] **Galaxis Térkép Bővítése:**
    - [ ] Jelenleg csak egy 10x10-es grid van. Galaxisok és Naprendszerek bevezetése (pl. [1:1:1] - [9:499:15]).
    - [ ] Navigációs nyilak és gyorskeresés a koordinátákra.
- [ ] **Flotta Irányítóközpont:**
    - [ ] Egy központi nézet, ahol az összes úton lévő saját flotta látható visszaszámlálóval és visszahívási (Recall) lehetőséggel.
- [ ] **Animációk & Effektek:**
    - [ ] Nyersanyagtermelés vizuális visszajelzése, gombok interakcióinak javítása, sötét mód finomhangolása.

## 🤝 Phase 3: Közösségi Funkciók & Tartalom
*Interakció a játékosok között és hosszú távú célok.*

- [ ] **Szövetségi Fejlesztések:**
    - [ ] Szövetségi raktár, közös adományozás, szövetségi szintlépés és bónuszok.
    - [ ] Szövetségi chat valós idejűbbé tétele (esetleg WebSockets/SSE, ha a Cloudflare Workers Durable Objects engedi).
- [ ] **Okosabb Botok (AIKA v2):**
    - [ ] A botok ne csak passzív célpontok legyenek. Kémkedjenek a játékosok után és támadják meg azokat, akiknek sok a védtelen nyersanyaguk.
- [ ] **Események & Küldetések:**
    - [ ] Napi kihívások (Daily Quests) és időszakos események (pl. dupla bányahozam hétvégén).

## 🧹 Phase 4: Refaktorálás & Biztonság (Műszaki adósság)
*A kódminőség és stabilitás javítása.*

- [ ] **Állapot Szinkronizáció:**
    - [ ] A frontend és backend közötti erőforrás-szinkronizáció finomítása (időbélyeg alapú pontosítás a kliens oldalon, hogy ne "ugráljanak" a számok).
- [ ] **API Biztonsági Felülvizsgálat:**
    - [ ] Paraméterek validálása minden végponton (pl. negatív mennyiségű hajó építése elleni védelem).
- [ ] **Lokalizáció:**
    - [ ] Hiányzó magyar/angol fordítások pótlása, dinamikus szövegek (pl. harci üzenetek) többnyelvűsítése.

---
*Utoljára frissítve: 2026. március 2.*
