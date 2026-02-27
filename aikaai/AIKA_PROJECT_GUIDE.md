# AIKA PROJECT — CORE INSTRUCTION (v5.1)

## 1. Projekt Cél

Aika egy:

- 🎙 hangalapú
- 🧍 vizuálisan megjelenített (VRM)
- 🧠 LLM-alapú
- 🛠 eszközvezérelt (MCP / Tool routing)
- 💾 strukturált memória-rendszerrel rendelkező
- 🖥 állapotvezérelt digitális karakter

Aika:

- nem chatbot
- nem “waifu” projekt
- nem egyszerű dev assistant

**Cél:**  
Egy agent-szintű, állapotvezérelt digitális karakterplatform.

---

## 2. Architektúra Alap

### Backend (Server)

- Multi-engine LLM támogatás
- Tool routing (MCP, explicit permission gating)
- Strukturált memória rendszer
- Goal → Action generálás
- Multi-step workflow engine
- Confirmation gating
- RBAC jogosultságkezelés
- SQLite adatbázis (WAL mód)
- Event logging és state kezelés
- TTS pipeline
- ASR integráció

### Frontend (Client)

- Vue 3 + Vite
- Neo-Red Desktop OS
- Ablakkezelő rendszer
- App ökoszisztéma
- Three.js + Three-VRM
- WebSocket real-time szinkron
- Workflow confirmation overlay

---

## 3. Aika Képességszintek (Stage Modell)

### Stage 1 — Megjelenés

- VRM karakter
- Alap chat

### Stage 2 — Kommunikáció

- Rövid memória
- TTS / ASR integráció

### Stage 3 — Tool-alapú működés

- MCP tool routing
- Rendszervezérlés
- Multimodális input

### Stage 4 — Karakterré válás

- Strukturált memória
- Kapcsolatrendszer
- XP rendszer
- Proaktív viselkedés

### Stage 5 — Platform

- Asztali operációs környezet
- App ökoszisztéma
- Docker infrastruktúra kezelés
- Goal → Action generálás
- Multi-step workflow engine
- Confirmation gating
- RBAC
- SQLite state engine

**Jelenlegi cél:** Stabil, valós Stage 5.

---

## 4. Következő Stage Szintek

### Stage 6 — Kiterjesztett Agent

- Teljes MCP tool routing
- Külső API orchestration (Cloudflare, email, stb.)
- Idempotens workflow execution
- Strukturált audit log
- Emóció-vezérelt TTS hangszínezés
- 3D room interakció

### Stage 7 — Meta-Intelligencia

- Self-evaluation loop
- Meta-memory
- Hosszú távú céloptimalizálás
- Episodikus tudásgráf
- Hibákból tanulás
- Workflow statisztikai finomítás

### Stage 8 — Kiterjesztett Autonómia

- Hosszú horizontú tervezés
- Belső világmodell
- Célütközés-kezelés
- Önszabályozó autonóm scheduler

⚠️ Nem cél a kontroll nélküli autonóm működés.

---

## 5. Memória Rendszer

### Rövid memória

- Chat kontextus
- Session state

### Strukturált memória

- User profil
- Kapcsolati állapot
- Preferenciák

### Epizodikus memória

- Fontos események
- Projektek
- Workflow eredmények

### Meta-memory (Stage 7+)

- Saját döntések értékelése
- Hibaelemzés
- Viselkedési minták

---

## 6. Tool Filozófia

Aika csak azt tudja, amire explicit tool van.

Tool kategóriák:

- Dev Tools
- System Tools
- Docker Tools
- Memory Tools
- Workflow Tools
- HA / IoT Tools

Az LLM nem hajthat végre közvetlen rendszerszintű műveletet.  
Mindig routing + permission + validation rétegen keresztül működik.

---

## 7. Karakter Identitás

Aika:

- intelligens
- stabil
- nem túlzottan érzelgős
- nem agresszív
- nem roleplay engine
- fejlesztőtárs

Persona konfiguráció külön fájlban kezelendő.  
Group-alapú persona módosítás engedélyezett (pl. child mode).

---

## 8. Fejlesztési Alapelvek

- Nem hackelünk core fájlokat.
- Modulárisan bővítünk.
- Memory és State külön réteg.
- Tool execution mindig validált.
- Autonóm működés csak confirmation gatinggel.
- Minden kritikus művelet idempotens.
- Adat perzisztencia adatbázison keresztül történik.

---

## 9. Nem Cél

- Teljes AGI rövid távon
- Saját LLM tréning
- Önmódosító rendszer
- Root szintű OS kontroll

Az AGI irány kutatási cél, nem aktuális product deliverable.

---

## 10. Összefoglaló

Aika:

LLM + Voice + Avatar + Memory + Tools + Workflow + State Engine

Nem chatbot projekt.  
Nem VRM demó.  
Nem TTS wrapper.

Ez egy állapotvezérelt agent karakter platform.
