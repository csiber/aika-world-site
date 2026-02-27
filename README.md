# AIKA COLONY v2 — Full-Stack Cloudflare Workers + Vue 3 + D1

## Architektúra

```
aika-colony-v2/
├── frontend/                    ← Vue 3 + Vite frontend
│   ├── src/
│   │   ├── api/client.js        ← API kliens (fetch wrapper)
│   │   ├── components/          ← Újrafelhasználható Vue komponensek
│   │   │   ├── views/           ← Tab-specifikus nézetek
│   │   │   ├── BuildingCard.vue
│   │   │   ├── BuildingItem.vue
│   │   │   ├── QueueItem.vue
│   │   │   └── ResourceItem.vue
│   │   ├── router/index.js      ← Vue Router (auth guard)
│   │   ├── stores/
│   │   │   ├── auth.js          ← Pinia auth store (JWT)
│   │   │   └── game.js          ← Pinia game state store
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── GameView.vue     ← Fő játék shell
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── worker/
│   └── src/
│       ├── index.js             ← Worker belépési pont + routing
│       ├── routes/
│       │   ├── auth.js          ← /api/auth/* (register, login, me)
│       │   ├── game.js          ← /api/game/* (state, upgrade, research, fleet)
│       │   └── rankings.js      ← /api/rankings
│       └── utils/
│           ├── jwt.js           ← PBKDF2 hash + HS256 JWT (Web Crypto API)
│           └── response.js      ← JSON response helpers + CORS
├── db/
│   └── schema.sql               ← D1 SQLite séma + seed adatok
├── package.json
├── wrangler.toml
└── README.md
```

## Funkciók

- **Regisztráció / Bejelentkezés** — email + jelszó, PBKDF2 hash, JWT session
- **Épület fejlesztés** — valós D1 adatbázisba ment, build queue
- **Kutatás** — 10 kutatási ág, szintenkénti fejlesztés
- **Flotta gyártás** — 6 hajótípus, mennyiség megadható
- **Rangsor** — valós játékosok pontszáma, oldalpozíció kiemelés
- **Offline termelés** — max 8 óra offline nyersanyag-gyűjtés szinkronizálásnál
- **Kliens-oldali tick** — folyamatos erőforrás-animáció szerver szinkron között

## Telepítés

### 1. Előfeltételek

- Node.js 18+
- Cloudflare fiók

### 2. Dependenciák telepítése

```bash
# Gyökér (wrangler)
npm install

# Frontend (Vue + Vite)
cd frontend && npm install && cd ..
```

### 3. D1 adatbázis létrehozása

```bash
npm run db:create
```

Másold ki a kapott database_id-t és illeszd be a `wrangler.toml`-ba:

```toml
[[d1_databases]]
database_id = "IDE_ILLESZD_A_KAPOTT_ID-T"
```

### 4. Séma futtatása

```bash
# Lokális fejlesztéshez:
npm run db:migrate:preview

# Éles D1-re:
npm run db:migrate
```

### 5. JWT és GEMINI secret beállítása

```bash
wrangler secret put JWT_SECRET
# Adj meg egy hosszú, random stringet (pl. openssl rand -hex 32)

wrangler secret put GEMINI_API_KEY
```

### 6. Lokális fejlesztés

```bash
# Terminal 1 — Vue dev server (port 5173)
npm run dev:frontend

# Terminal 2 — Cloudflare Worker (port 8787, API proxy)
npm run dev:worker
```

A frontend Vite-ban a `/api/*` kéréseket proxyzza a Worker-re (8787).

### 7. Deploy

```bash
npm run deploy
```

Ez először buildeli a Vue appot (`frontend/dist/`), majd feltölti az egészet Cloudflare-re.

## API Végpontok

### Auth (publikus)

| Metódus | Endpoint             | Leírás                                   |
| ------- | -------------------- | ---------------------------------------- |
| POST    | `/api/auth/register` | Regisztráció (username, email, password) |
| POST    | `/api/auth/login`    | Bejelentkezés (email, password) → JWT    |
| GET     | `/api/auth/me`       | Saját profil (JWT szükséges)             |

### Game (JWT szükséges)

| Metódus | Endpoint                | Leírás                             |
| ------- | ----------------------- | ---------------------------------- |
| GET     | `/api/game/state`       | Teljes játékállapot + sor          |
| POST    | `/api/game/sync`        | Szerver szinkronizáció             |
| POST    | `/api/game/upgrade`     | Épület fejlesztés `{ buildingId }` |
| POST    | `/api/game/research`    | Kutatás indítás `{ researchId }`   |
| POST    | `/api/game/fleet/build` | Hajógyártás `{ shipId, amount }`   |

### Rankings (JWT szükséges)

| Metódus | Endpoint               | Leírás             |
| ------- | ---------------------- | ------------------ |
| GET     | `/api/rankings?page=1` | Rangsor (50/oldal) |

## Jövőbeli fejlesztési lehetőségek

- **Durable Objects** — valós idejű multiplayer, flotta ütközések
- **Queues** — aszinkron értesítések (email, push)
- **D1 trigger** — automatikus rangsor frissítés
- **WebSocket** — élő chat, szövetségi koordináció
- **R2** — játékos avatárok, bolygó képek
